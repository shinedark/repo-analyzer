import React, { useState, useCallback } from 'react'
import { Octokit } from '@octokit/rest'
import { extractCodePatterns, extractWordFrequency, findCodeRepetitions } from '../utils/codeParser'
import { makeRateLimitedRequest } from '../utils/rateLimiter'

const BatchAnalyzer = ({ targetRepos, onClose }) => {
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [currentRepo, setCurrentRepo] = useState('')
  const [error, setError] = useState(null)

  const githubToken = process.env.REACT_APP_GITHUB_TOKEN

  const analyzeBatch = useCallback(async () => {
    if (!targetRepos || targetRepos.length === 0) return

    if (!githubToken) {
      setError('GitHub token is missing. Please add REACT_APP_GITHUB_TOKEN to your .env file. See README.md for setup instructions.')
      return
    }

    setError(null) // Clear any previous errors
    setIsAnalyzing(true)
    setProgress({ current: 0, total: targetRepos.length })
    
    const octokit = new Octokit({
      auth: githubToken,
    })

    const batchResults = []
    
    for (let i = 0; i < targetRepos.length; i++) {
      const repo = targetRepos[i]
      setCurrentRepo(repo.name)
      setProgress({ current: i + 1, total: targetRepos.length })
      
      try {
        const repoAnalysis = await analyzeRepository(octokit, repo)
        batchResults.push(repoAnalysis)
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error analyzing ${repo.name}:`, error)
        batchResults.push({
          name: repo.name,
          url: repo.url,
          error: error.message,
          patterns: [],
          wordFrequency: [],
          repetitions: [],
          languageStats: {}
        })
      }
    }

    // Aggregate results across all repositories
    const aggregatedAnalysis = aggregateResults(batchResults)
    setAnalysis(aggregatedAnalysis)
    setIsAnalyzing(false)
    setCurrentRepo('')
  }, [targetRepos, githubToken])

  const analyzeRepository = async (octokit, repo) => {
    const [owner, repoName] = repo.url.replace('https://github.com/', '').split('/')
    
    // Get repository contents with rate limiting
    const { data: contents } = await makeRateLimitedRequest(() =>
      octokit.rest.repos.getContent({
        owner,
        repo: repoName,
        path: '',
      })
    )

    // Get file contents for analysis (limit to prevent API exhaustion)
    const filesToAnalyze = contents
      .filter(item => item.type === 'file' && isCodeFile(item.name))
      .slice(0, 20) // Limit to first 20 files

    const fileContents = []
    
    for (const file of filesToAnalyze) {
      try {
        const { data: fileData } = await makeRateLimitedRequest(() =>
          octokit.rest.repos.getContent({
            owner,
            repo: repoName,
            path: file.path,
          })
        )
        
        if (fileData.content && fileData.size < 100000) { // Skip very large files
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
          fileContents.push({
            name: file.name,
            path: file.path,
            content,
            extension: getFileExtension(file.name)
          })
        }
      } catch (error) {
        console.warn(`Skipping file ${file.path}:`, error.message)
      }
    }

    // Analyze patterns
    const allPatterns = []
    const allWords = []
    const languageStats = {}

    fileContents.forEach(file => {
      const patterns = extractCodePatterns(file.name, file.content)
      allPatterns.push(...patterns)
      
      const words = extractWordFrequency(file.content)
      allWords.push(...words)
      
      const language = getLanguageFromExtension(file.extension)
      if (!languageStats[language]) {
        languageStats[language] = { fileCount: 0, totalLines: 0 }
      }
      languageStats[language].fileCount++
      languageStats[language].totalLines += file.content.split('\n').length
    })

    // Aggregate patterns
    const patternCounts = {}
    allPatterns.forEach(pattern => {
      const key = `${pattern.type} (${pattern.language})`
      patternCounts[key] = (patternCounts[key] || 0) + pattern.count
    })

    // Aggregate word frequency
    const wordCounts = {}
    allWords.forEach(word => {
      wordCounts[word.word] = (wordCounts[word.word] || 0) + word.count
    })

    const repetitions = findCodeRepetitions(fileContents)

    return {
      name: repo.name,
      url: repo.url,
      description: repo.description,
      patterns: Object.entries(patternCounts)
        .map(([pattern, count]) => ({ pattern, count }))
        .sort((a, b) => b.count - a.count),
      wordFrequency: Object.entries(wordCounts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count),
      repetitions,
      languageStats,
      fileCount: fileContents.length
    }
  }

  const aggregateResults = (results) => {
    const validResults = results.filter(r => !r.error)
    
    // Aggregate patterns across all repos
    const allPatterns = {}
    const allWords = {}
    const allLanguages = {}
    let totalFiles = 0
    
    validResults.forEach(repo => {
      totalFiles += repo.fileCount
      
      repo.patterns.forEach(pattern => {
        allPatterns[pattern.pattern] = (allPatterns[pattern.pattern] || 0) + pattern.count
      })
      
      repo.wordFrequency.forEach(word => {
        allWords[word.word] = (allWords[word.word] || 0) + word.count
      })
      
      Object.entries(repo.languageStats).forEach(([lang, stats]) => {
        if (!allLanguages[lang]) {
          allLanguages[lang] = { fileCount: 0, totalLines: 0, repos: new Set() }
        }
        allLanguages[lang].fileCount += stats.fileCount
        allLanguages[lang].totalLines += stats.totalLines
        allLanguages[lang].repos.add(repo.name)
      })
    })

    return {
      totalRepos: results.length,
      successfulRepos: validResults.length,
      failedRepos: results.filter(r => r.error).length,
      totalFiles,
      aggregatedPatterns: Object.entries(allPatterns)
        .map(([pattern, count]) => ({ pattern, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30),
      aggregatedWords: Object.entries(allWords)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50),
      languageDistribution: Object.entries(allLanguages)
        .map(([lang, stats]) => ({
          language: lang,
          fileCount: stats.fileCount,
          totalLines: stats.totalLines,
          repoCount: stats.repos.size
        }))
        .sort((a, b) => b.fileCount - a.fileCount),
      repoResults: results
    }
  }

  const renderAnalysis = () => {
    if (isAnalyzing) {
      return (
        <div className="batch-analysis-loading">
          <h2>Analyzing Repositories</h2>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p>
            Analyzing {currentRepo} ({progress.current} of {progress.total})
          </p>
        </div>
      )
    }

    if (!analysis) {
      return <p>No batch analysis available.</p>
    }

    return (
      <div className="batch-analysis-results">
        <h2>Batch Analysis Results</h2>
        
        <div className="analysis-summary">
          <h3>Summary</h3>
          <p><strong>Total Repositories:</strong> {analysis.totalRepos}</p>
          <p><strong>Successfully Analyzed:</strong> {analysis.successfulRepos}</p>
          <p><strong>Failed:</strong> {analysis.failedRepos}</p>
          <p><strong>Total Files Analyzed:</strong> {analysis.totalFiles}</p>
        </div>

        <div className="analysis-section">
          <h3>Language Distribution</h3>
          <div className="language-distribution">
            {analysis.languageDistribution.map(lang => (
              <div key={lang.language} className="language-item">
                <h4>{lang.language}</h4>
                <p>Files: {lang.fileCount} | Lines: {lang.totalLines} | Repos: {lang.repoCount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-section">
          <h3>Most Common Patterns</h3>
          <div className="patterns-grid">
            {analysis.aggregatedPatterns.slice(0, 15).map((pattern, index) => (
              <div key={index} className="pattern-card">
                <code>{pattern.pattern}</code>
                <span className="pattern-count">{pattern.count} occurrences</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-section">
          <h3>Most Common Words</h3>
          <div className="word-cloud">
            {analysis.aggregatedWords.slice(0, 30).map((word, index) => (
              <span 
                key={index} 
                className="word-tag"
                style={{ fontSize: `${Math.min(word.count / 10 + 0.8, 2)}em` }}
              >
                {word.word} ({word.count})
              </span>
            ))}
          </div>
        </div>

        <div className="analysis-section">
          <h3>Repository Details</h3>
          <div className="repo-results">
            {analysis.repoResults.map((repo, index) => (
              <div key={index} className="repo-result-card">
                <h4>{repo.name}</h4>
                {repo.error ? (
                  <p className="error">Error: {repo.error}</p>
                ) : (
                  <div>
                    <p>Files: {repo.fileCount}</p>
                    <p>Top patterns: {repo.patterns.slice(0, 3).map(p => p.pattern).join(', ')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content batch-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        {!analysis && !isAnalyzing && !error && (
          <div>
            <h2>Batch Repository Analysis</h2>
            <p>Analyze {targetRepos?.length || 0} repositories for patterns and repetitions</p>
            <button className="start-batch-btn" onClick={analyzeBatch}>
              Start Batch Analysis
            </button>
          </div>
        )}
        {renderAnalysis()}
      </div>
    </div>
  )
}

// Helper functions
function isCodeFile(filename) {
  const codeExtensions = [
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rs',
    'php', 'rb', 'swift', 'kt', 'scala', 'html', 'css', 'scss', 'less',
    'json', 'xml', 'yaml', 'yml', 'md', 'sql'
  ]
  
  const extension = filename.split('.').pop()?.toLowerCase()
  return codeExtensions.includes(extension)
}

function getFileExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function getLanguageFromExtension(ext) {
  const languageMap = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'go': 'Go',
    'rs': 'Rust',
    'php': 'PHP',
    'rb': 'Ruby',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'scala': 'Scala',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'less': 'LESS',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML',
    'md': 'Markdown',
    'sql': 'SQL'
  }
  
  return languageMap[ext] || 'Other'
}

export default BatchAnalyzer
