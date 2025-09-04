import React from 'react'

const AnalysisSummaryChip = ({ analysis, isVisible }) => {
  // Debug logging
  console.log('AnalysisSummaryChip props:', { analysis, isVisible, hasAnalysis: !!analysis })
  
  if (!isVisible) {
    console.log('AnalysisSummaryChip not visible')
    return null
  }

  if (!analysis) {
    console.log('AnalysisSummaryChip no analysis data')
    // Show a placeholder chip for debugging
    return (
      <div className="analysis-summary-chip">
        <div className="chip-container">
          <div className="chip-item">
            <div className="chip-icon">🔍</div>
            <div className="chip-content">
              <span className="chip-label">Status</span>
              <span className="chip-value">Waiting for analysis...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate summary metrics
  const totalRepetitions = analysis.repetitions?.reduce((sum, rep) => sum + rep.count, 0) || 0
  const mostRepeatedWord = analysis.wordFrequency?.[0]?.word || 'N/A'
  const mostRepeatedWordCount = analysis.wordFrequency?.[0]?.count || 0
  
  // Determine biggest pitfall based on analysis
  const getBiggestPitfall = () => {
    if (!analysis.repetitions || analysis.repetitions.length === 0) {
      return 'No code repetitions detected'
    }
    
    const highRepetitionCount = analysis.repetitions.filter(rep => rep.count > 5).length
    const totalFiles = analysis.codeFiles || 0
    
    if (highRepetitionCount > 3) {
      return `High code duplication (${highRepetitionCount} patterns)`
    } else if (totalRepetitions > 20) {
      return `Multiple repetitions detected (${totalRepetitions} total)`
    } else if (analysis.repetitions.length > 0) {
      return `Minor code duplication found`
    } else if (totalFiles > 50) {
      return 'Large codebase - monitor for patterns'
    } else {
      return 'Clean codebase structure'
    }
  }

  const biggestPitfall = getBiggestPitfall()
  const pitfallSeverity = getPitfallSeverity(biggestPitfall)

  return (
    <div className="analysis-summary-chip">
      <div className="chip-container">
        <div className="chip-item repetitions">
          <div className="chip-icon">🔄</div>
          <div className="chip-content">
            <span className="chip-label">Total Repetitions</span>
            <span className="chip-value">{totalRepetitions}</span>
          </div>
        </div>
        
        <div className="chip-divider"></div>
        
        <div className="chip-item most-word">
          <div className="chip-icon">📝</div>
          <div className="chip-content">
            <span className="chip-label">Most Used Word</span>
            <span className="chip-value">
              "{mostRepeatedWord}" ({mostRepeatedWordCount}x)
            </span>
          </div>
        </div>
        
        <div className="chip-divider"></div>
        
        <div className={`chip-item pitfall ${pitfallSeverity}`}>
          <div className="chip-icon">
            {pitfallSeverity === 'high' ? '⚠️' : 
             pitfallSeverity === 'medium' ? '⚡' : '✅'}
          </div>
          <div className="chip-content">
            <span className="chip-label">Code Health</span>
            <span className="chip-value">{biggestPitfall}</span>
          </div>
        </div>
        
        <div className="chip-summary">
          <div className="chip-stats">
            <span>{analysis.codeFiles || 0} files analyzed</span>
            <span>•</span>
            <span>{Object.keys(analysis.languageStats || {}).length} languages</span>
            <span>•</span>
            <span>{(analysis.wordFrequency?.length || 0)} unique words</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to determine pitfall severity
function getPitfallSeverity(pitfall) {
  if (pitfall.includes('High code duplication') || pitfall.includes('Multiple repetitions')) {
    return 'high'
  } else if (pitfall.includes('Minor code duplication') || pitfall.includes('monitor for patterns')) {
    return 'medium'
  } else {
    return 'low'
  }
}

export default AnalysisSummaryChip
