import React, { useState, useEffect, useCallback } from 'react'
import ExportResults from './ExportResults'
import './RepoVisualizer.css'

const PatternAnalyzer = ({ nodes, onClose, repoUrl, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzePatterns = useCallback(async () => {
    if (!nodes || nodes.length === 0) {
      setAnalysis(null)
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Extract all text content from files, filtering out problematic files
      const fileContents = nodes
        .filter(node => {
          if (!node.data?.content || node.data?.type !== 'file') return false
          
          // Skip problematic files
          const name = node.data.name || ''
          const skipFile = name.endsWith('.d.ts') || 
                          name.endsWith('.min.js') ||
                          name.includes('canonicalize') ||
                          name.includes('.bundle.') ||
                          name.includes('.chunk.') ||
                          name.includes('vendor') ||
                          name.includes('polyfill') ||
                          (node.data.content && node.data.content.length > 100000) // Skip very large files
          
          return !skipFile
        })
        .map(node => ({
          name: node.data.name,
          content: node.data.content,
          extension: getFileExtension(node.data.name),
          path: node.data.path || node.data.name
        }))

      // Analyze patterns
      const patterns = await analyzeCodePatterns(fileContents)
      const wordFrequency = analyzeWordFrequency(fileContents)
      const languageStats = analyzeLanguageSpecifics(fileContents)
      const repetitions = findRepetitions(fileContents)
      
      const analysisResult = {
        totalFiles: nodes.length,
        codeFiles: fileContents.length,
        patterns,
        wordFrequency,
        languageStats,
        repetitions,
        repoUrl
      }
      
      setAnalysis(analysisResult)
      
      // Notify parent component about analysis completion
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult)
      }
    } catch (error) {
      console.error('Pattern analysis error:', error)
      setAnalysis({
        error: 'Failed to analyze patterns',
        totalFiles: nodes.length,
        codeFiles: 0
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [nodes, repoUrl, onAnalysisComplete])

  useEffect(() => {
    analyzePatterns()
  }, [analyzePatterns])

  const renderAnalysis = () => {
    if (isAnalyzing) {
      return (
        <div className="analysis-loading">
          <div className="spinner"></div>
          <p>Analyzing patterns and repetitions...</p>
        </div>
      )
    }

    if (!analysis) {
      return (
        <p>No analysis available. Please ensure the repository has been loaded.</p>
      )
    }

    if (analysis.error) {
      return (
        <div className="analysis-error">
          <h2>Analysis Error</h2>
          <p>{analysis.error}</p>
          <p>Total Files: {analysis.totalFiles}</p>
        </div>
      )
    }

    return (
      <div className="pattern-analysis">
        <h2>Pattern & Language Analysis</h2>
        <div className="analysis-section">
          <h3>Repository Overview</h3>
          <p><strong>Repository:</strong> {analysis.repoUrl}</p>
          <p><strong>Total Files:</strong> {analysis.totalFiles}</p>
          <p><strong>Code Files Analyzed:</strong> {analysis.codeFiles}</p>
        </div>

        <div className="analysis-section">
          <h3>Language Distribution</h3>
          {renderLanguageStats(analysis.languageStats)}
        </div>

        <div className="analysis-section">
          <h3>Common Patterns</h3>
          {renderPatterns(analysis.patterns)}
        </div>

        <div className="analysis-section">
          <h3>Word Frequency Analysis</h3>
          {renderWordFrequency(analysis.wordFrequency)}
        </div>

        <div className="analysis-section">
          <h3>Code Repetitions</h3>
          {renderRepetitions(analysis.repetitions)}
        </div>

        <ExportResults analysis={analysis} repoUrl={analysis.repoUrl} />
      </div>
    )
  }

  const renderLanguageStats = (languageStats) => {
    if (!languageStats || Object.keys(languageStats).length === 0) {
      return <p>No language statistics available.</p>
    }

    return (
      <div className="language-stats">
        {Object.entries(languageStats)
          .sort(([,a], [,b]) => b.fileCount - a.fileCount)
          .map(([language, stats]) => (
            <div key={language} className="language-stat">
              <h4>{language}</h4>
              <p>Files: {stats.fileCount}</p>
              <p>Lines: {stats.totalLines}</p>
              <p>Common Keywords: {stats.keywords.slice(0, 5).join(', ')}</p>
            </div>
          ))}
      </div>
    )
  }

  const renderPatterns = (patterns) => {
    if (!patterns || patterns.length === 0) {
      return <p>No common patterns detected.</p>
    }

    return (
      <div className="patterns-list">
        {patterns.slice(0, 10).map((pattern, index) => (
          <div key={index} className="pattern-item">
            <code>{pattern.pattern}</code>
            <span className="pattern-count">({pattern.count} occurrences)</span>
          </div>
        ))}
      </div>
    )
  }

  const renderWordFrequency = (wordFrequency) => {
    if (!wordFrequency || wordFrequency.length === 0) {
      return <p>No word frequency data available.</p>
    }

    return (
      <div className="word-frequency">
        {wordFrequency.slice(0, 20).map((word, index) => (
          <div key={index} className="word-item">
            <span className="word">{word.word}</span>
            <span className="frequency">{word.count}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderRepetitions = (repetitions) => {
    if (!repetitions || repetitions.length === 0) {
      return <p>No significant repetitions found.</p>
    }

    return (
      <div className="repetitions-list">
        {repetitions.slice(0, 8).map((rep, index) => (
          <div key={index} className="repetition-item">
            <h4>Repeated {rep.lines} lines ({rep.count} times)</h4>
            <pre className="code-snippet">{rep.snippet}</pre>
            <p className="files-list">Files: {rep.files.join(', ')}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pattern-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        {renderAnalysis()}
      </div>
    </div>
  )
}

// Helper functions
function getFileExtension(filename) {
  return filename ? filename.split('.').pop().toLowerCase() : null
}

async function analyzeCodePatterns(fileContents) {
  const patterns = new Map()
  
  fileContents.forEach(file => {
    // Look for common code patterns
    const commonPatterns = [
      /import\s+.*\s+from\s+['"`].*['"`]/g,
      /export\s+.*\s*{/g,
      /function\s+\w+\s*\(/g,
      /const\s+\w+\s*=/g,
      /let\s+\w+\s*=/g,
      /var\s+\w+\s*=/g,
      /class\s+\w+/g,
      /if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /try\s*{/g,
      /catch\s*\(/g,
    ]

    commonPatterns.forEach(pattern => {
      const matches = file.content.match(pattern) || []
      matches.forEach(match => {
        const cleanMatch = match.trim()
        patterns.set(cleanMatch, (patterns.get(cleanMatch) || 0) + 1)
      })
    })
  })

  return Array.from(patterns.entries())
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
}

function analyzeWordFrequency(fileContents) {
  const wordCounts = new Map()
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'])

  fileContents.forEach(file => {
    // Extract words from code, focusing on identifiers
    const words = file.content
      .replace(/[{}();,[\]]/g, ' ')
      .replace(/['"]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word.toLowerCase()) && !/^\d+$/.test(word))

    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9_]/g, '')
      if (cleanWord.length > 2) {
        wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1)
      }
    })
  })

  return Array.from(wordCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
}

function analyzeLanguageSpecifics(fileContents) {
  const languageStats = {}

  fileContents.forEach(file => {
    const ext = file.extension
    const language = getLanguageFromExtension(ext)
    
    if (!languageStats[language]) {
      languageStats[language] = {
        fileCount: 0,
        totalLines: 0,
        keywords: []
      }
    }

    languageStats[language].fileCount++
    languageStats[language].totalLines += file.content.split('\n').length

    // Extract language-specific keywords
    const keywords = extractLanguageKeywords(file.content, language)
    languageStats[language].keywords.push(...keywords)
  })

  // Deduplicate and count keywords
  Object.keys(languageStats).forEach(language => {
    const keywordCounts = {}
    languageStats[language].keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
    })
    
    languageStats[language].keywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword)
  })

  return languageStats
}

function findRepetitions(fileContents) {
  const repetitions = []
  const codeBlocks = new Map()

  fileContents.forEach(file => {
    const lines = file.content.split('\n').filter(line => line.trim().length > 5)
    
    // Look for repeated blocks of 3+ lines
    for (let i = 0; i < lines.length - 2; i++) {
      const block = lines.slice(i, i + 3).join('\n').trim()
      if (block.length > 50) {
        if (!codeBlocks.has(block)) {
          codeBlocks.set(block, { count: 0, files: new Set(), lines: 3 })
        }
        codeBlocks.get(block).count++
        codeBlocks.get(block).files.add(file.name)
      }
    }
  })

  codeBlocks.forEach((data, block) => {
    if (data.count > 1) {
      repetitions.push({
        snippet: block.substring(0, 200) + (block.length > 200 ? '...' : ''),
        count: data.count,
        files: Array.from(data.files),
        lines: data.lines
      })
    }
  })

  return repetitions.sort((a, b) => b.count - a.count)
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

function extractLanguageKeywords(content, language) {
  const keywords = []
  
  const languageKeywords = {
    'JavaScript': ['function', 'const', 'let', 'var', 'class', 'import', 'export', 'async', 'await', 'Promise'],
    'TypeScript': ['interface', 'type', 'enum', 'namespace', 'declare', 'readonly', 'private', 'public', 'protected'],
    'Python': ['def', 'class', 'import', 'from', 'if', 'elif', 'else', 'for', 'while', 'try', 'except'],
    'Java': ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final'],
    'C++': ['class', 'struct', 'namespace', 'template', 'typename', 'public', 'private', 'protected', 'virtual'],
    'Go': ['func', 'type', 'struct', 'interface', 'package', 'import', 'var', 'const', 'go', 'defer'],
    'Rust': ['fn', 'struct', 'enum', 'impl', 'trait', 'pub', 'mod', 'use', 'match', 'let', 'mut']
  }

  const langKeywords = languageKeywords[language] || []
  
  langKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    const matches = content.match(regex)
    if (matches) {
      keywords.push(...matches.map(() => keyword))
    }
  })

  return keywords
}

export default PatternAnalyzer
