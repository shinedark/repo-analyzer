// Simple rate limiter for GitHub API requests
class RateLimiter {
  constructor(maxRequests = 5000, timeWindow = 3600000) { // 5000 requests per hour by default
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = []
    this.remaining = maxRequests
    this.resetTime = Date.now() + timeWindow
  }

  // Check if we can make a request
  canMakeRequest() {
    this.cleanOldRequests()
    return this.requests.length < this.maxRequests
  }

  // Record a new request
  recordRequest() {
    const now = Date.now()
    this.requests.push(now)
    this.remaining = Math.max(0, this.maxRequests - this.requests.length)
    
    if (this.requests.length === 1) {
      this.resetTime = now + this.timeWindow
    }
  }

  // Clean up old requests outside the time window
  cleanOldRequests() {
    const now = Date.now()
    const cutoff = now - this.timeWindow
    this.requests = this.requests.filter(time => time > cutoff)
    this.remaining = Math.max(0, this.maxRequests - this.requests.length)
    
    if (this.requests.length === 0) {
      this.resetTime = now + this.timeWindow
    }
  }

  // Get time until reset (in milliseconds)
  getTimeUntilReset() {
    return Math.max(0, this.resetTime - Date.now())
  }

  // Get remaining requests
  getRemainingRequests() {
    this.cleanOldRequests()
    return this.remaining
  }

  // Calculate delay needed before next request
  getDelayBeforeNextRequest() {
    if (this.canMakeRequest()) {
      return 0
    }
    
    // If we're at the limit, calculate when the oldest request will expire
    if (this.requests.length > 0) {
      const oldestRequest = Math.min(...this.requests)
      const delay = (oldestRequest + this.timeWindow) - Date.now()
      return Math.max(0, delay)
    }
    
    return 0
  }

  // Update rate limit info from GitHub API response headers
  updateFromHeaders(headers) {
    const remaining = parseInt(headers['x-ratelimit-remaining']) || this.remaining
    const reset = parseInt(headers['x-ratelimit-reset']) || Math.floor(this.resetTime / 1000)
    const limit = parseInt(headers['x-ratelimit-limit']) || this.maxRequests
    
    this.remaining = remaining
    this.resetTime = reset * 1000 // Convert to milliseconds
    this.maxRequests = limit
    
    // Estimate current request count
    this.requests = Array(limit - remaining).fill(Date.now())
  }

  // Get status information
  getStatus() {
    this.cleanOldRequests()
    return {
      remaining: this.remaining,
      limit: this.maxRequests,
      resetTime: new Date(this.resetTime).toISOString(),
      timeUntilReset: this.getTimeUntilReset(),
      canMakeRequest: this.canMakeRequest(),
      delayNeeded: this.getDelayBeforeNextRequest()
    }
  }
}

// Create a singleton instance for GitHub API
export const githubRateLimiter = new RateLimiter()

// Helper function to make rate-limited requests
export const makeRateLimitedRequest = async (requestFn, retryCount = 3) => {
  const limiter = githubRateLimiter
  
  // Check if we can make the request
  if (!limiter.canMakeRequest()) {
    const delay = limiter.getDelayBeforeNextRequest()
    if (delay > 0 && delay < 300000) { // Don't wait more than 5 minutes
      console.log(`Rate limit reached. Waiting ${Math.ceil(delay / 1000)} seconds...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    } else {
      throw new Error('Rate limit exceeded and delay too long')
    }
  }

  try {
    // Record the request
    limiter.recordRequest()
    
    // Make the actual request
    const response = await requestFn()
    
    // Update rate limit info from response headers if available
    if (response && response.headers) {
      limiter.updateFromHeaders(response.headers)
    }
    
    return response
  } catch (error) {
    // If it's a rate limit error and we have retries left, wait and try again
    if (error.status === 403 && retryCount > 0) {
      const retryAfter = error.response?.headers?.['retry-after'] || 60
      console.log(`Rate limit error. Retrying after ${retryAfter} seconds...`)
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
      return makeRateLimitedRequest(requestFn, retryCount - 1)
    }
    
    throw error
  }
}

// Helper to add delays between requests
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Batch processor with rate limiting
export class BatchProcessor {
  constructor(rateLimiter, batchSize = 10, delayBetweenBatches = 1000) {
    this.rateLimiter = rateLimiter
    this.batchSize = batchSize
    this.delayBetweenBatches = delayBetweenBatches
  }

  async processBatch(items, processFn, onProgress = null) {
    const results = []
    const batches = this.chunkArray(items, this.batchSize)
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const batchResults = []
      
      // Process each item in the batch
      for (const item of batch) {
        try {
          const result = await makeRateLimitedRequest(() => processFn(item))
          batchResults.push({ item, result, error: null })
        } catch (error) {
          console.error(`Error processing item:`, error)
          batchResults.push({ item, result: null, error: error.message })
        }
      }
      
      results.push(...batchResults)
      
      // Report progress
      if (onProgress) {
        onProgress({
          completed: results.length,
          total: items.length,
          currentBatch: i + 1,
          totalBatches: batches.length
        })
      }
      
      // Delay between batches (except for the last one)
      if (i < batches.length - 1) {
        await delay(this.delayBetweenBatches)
      }
    }
    
    return results
  }

  chunkArray(array, size) {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

export default RateLimiter
