import React from 'react'

const ExportResults = ({ analysis, repoUrl }) => {
  const exportToJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      repository: repoUrl,
      analysis: {
        totalFiles: analysis.totalFiles,
        codeFiles: analysis.codeFiles,
        patterns: analysis.patterns,
        wordFrequency: analysis.wordFrequency.slice(0, 100), // Top 100 words
        languageStats: analysis.languageStats,
        repetitions: analysis.repetitions
      }
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `pattern-analysis-${getRepoName(repoUrl)}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const csvData = []
    
    // Header
    csvData.push(['Type', 'Item', 'Count', 'Language/Category'])
    
    // Add patterns
    analysis.patterns.forEach(pattern => {
      csvData.push(['Pattern', pattern.pattern, pattern.count, ''])
    })
    
    // Add word frequency
    analysis.wordFrequency.slice(0, 50).forEach(word => {
      csvData.push(['Word', word.word, word.count, ''])
    })
    
    // Add language stats
    Object.entries(analysis.languageStats).forEach(([lang, stats]) => {
      csvData.push(['Language', lang, stats.fileCount, `${stats.totalLines} lines`])
    })
    
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `pattern-analysis-${getRepoName(repoUrl)}-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToMarkdown = () => {
    const repoName = getRepoName(repoUrl)
    const timestamp = new Date().toLocaleString()
    
    let markdown = `# Pattern Analysis Report: ${repoName}\n\n`
    markdown += `**Repository:** ${repoUrl}\n`
    markdown += `**Analysis Date:** ${timestamp}\n`
    markdown += `**Total Files:** ${analysis.totalFiles}\n`
    markdown += `**Code Files Analyzed:** ${analysis.codeFiles}\n\n`
    
    // Language Distribution
    markdown += `## Language Distribution\n\n`
    Object.entries(analysis.languageStats)
      .sort(([,a], [,b]) => b.fileCount - a.fileCount)
      .forEach(([lang, stats]) => {
        markdown += `- **${lang}**: ${stats.fileCount} files, ${stats.totalLines} lines\n`
      })
    
    // Top Patterns
    markdown += `\n## Most Common Patterns\n\n`
    analysis.patterns.slice(0, 20).forEach((pattern, index) => {
      markdown += `${index + 1}. \`${pattern.pattern}\` - ${pattern.count} occurrences\n`
    })
    
    // Top Words
    markdown += `\n## Most Common Words\n\n`
    analysis.wordFrequency.slice(0, 30).forEach((word, index) => {
      markdown += `${index + 1}. **${word.word}** - ${word.count} occurrences\n`
    })
    
    // Repetitions
    if (analysis.repetitions && analysis.repetitions.length > 0) {
      markdown += `\n## Code Repetitions\n\n`
      analysis.repetitions.slice(0, 5).forEach((rep, index) => {
        markdown += `### Repetition ${index + 1}\n`
        markdown += `- **Occurrences:** ${rep.count}\n`
        markdown += `- **Files:** ${rep.files.join(', ')}\n`
        markdown += `- **Code Snippet:**\n\`\`\`\n${rep.snippet}\n\`\`\`\n\n`
      })
    }
    
    const dataBlob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `pattern-analysis-${repoName}-${Date.now()}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    const summary = `Pattern Analysis Summary for ${getRepoName(repoUrl)}:
- Total Files: ${analysis.totalFiles}
- Code Files: ${analysis.codeFiles}
- Top Languages: ${Object.keys(analysis.languageStats).slice(0, 3).join(', ')}
- Top Patterns: ${analysis.patterns.slice(0, 5).map(p => p.pattern).join(', ')}
- Most Common Words: ${analysis.wordFrequency.slice(0, 10).map(w => w.word).join(', ')}`

    try {
      await navigator.clipboard.writeText(summary)
      alert('Summary copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      alert('Failed to copy to clipboard. Please try again.')
    }
  }

  const getRepoName = (url) => {
    if (!url) return 'unknown'
    const parts = url.replace('https://github.com/', '').split('/')
    return `${parts[0]}-${parts[1]}`
  }

  if (!analysis) {
    return null
  }

  return (
    <div className="export-results">
      <h3>Export Analysis Results</h3>
      <div className="export-buttons">
        <button onClick={exportToJSON} className="export-btn json-btn">
          📄 Export JSON
        </button>
        <button onClick={exportToCSV} className="export-btn csv-btn">
          📊 Export CSV
        </button>
        <button onClick={exportToMarkdown} className="export-btn md-btn">
          📝 Export Markdown
        </button>
        <button onClick={copyToClipboard} className="export-btn copy-btn">
          📋 Copy Summary
        </button>
      </div>
    </div>
  )
}

export default ExportResults
