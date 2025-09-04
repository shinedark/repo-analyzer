import React from 'react'
import LanguageColorLegend from './LanguageColorLegend'
import PatternAnalyzer from './PatternAnalyzer'

const Navbar = ({
  showLanguageLegend,
  setShowLanguageLegend,
  showAnalyzer,
  setShowAnalyzer,
  nodes,
  repoUrl,
  onAnalysisComplete,
  showSummaryChip,
  setShowSummaryChip,
}) => {
  // Compute used languages based on nodes
  const computeUsedLanguages = () => {
    return [...new Set(nodes.map((node) => node.language))].filter(Boolean)
  }

  const usedLanguages = computeUsedLanguages()

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f8f9fa',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => setShowLanguageLegend(!showLanguageLegend)}
        style={{
          marginRight: '10px',
          padding: '5px 10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {showLanguageLegend ? 'Hide' : 'Show'} Language
      </button>
      <button
        onClick={() => setShowSummaryChip(!showSummaryChip)}
        style={{
          marginRight: '10px',
          padding: '5px 10px',
          backgroundColor: showSummaryChip ? '#dc3545' : '#6f42c1',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {showSummaryChip ? 'Hide' : 'Show'} Summary
      </button>
      <button
        onClick={() => setShowAnalyzer(true)}
        style={{
          padding: '5px 10px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Analyze Patterns
      </button>
      {showLanguageLegend && (
        <LanguageColorLegend usedLanguages={usedLanguages} />
      )}
      {showAnalyzer && (
        <PatternAnalyzer 
          nodes={nodes} 
          onClose={() => setShowAnalyzer(false)} 
          repoUrl={repoUrl}
          onAnalysisComplete={onAnalysisComplete}
        />
      )}
    </nav>
  )
}

export default Navbar
