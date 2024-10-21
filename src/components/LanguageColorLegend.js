import React, { useState } from 'react'

const languageColors = {
  js: '#f1e05a', // JavaScript - yellow
  jsx: '#f1e05a', // JSX - yellow (same as JavaScript)
  ts: '#2b7489', // TypeScript - blue
  tsx: '#2b7489', // TSX - blue (same as TypeScript)
  py: '#3572A5', // Python - blue
  rb: '#701516', // Ruby - red
  java: '#b07219', // Java - brown
  php: '#4F5D95', // PHP - purple
  css: '#563d7c', // CSS - purple
  html: '#e34c26', // HTML - orange
  sol: '#AA6746', // Solidity - brown
  // Add more languages as needed
  default: '#6c757d', // Default color for unknown languages
}

const LanguageColorLegend = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {isOpen ? 'Hide' : 'Show'} Language
      </button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '10px',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            maxWidth: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {Object.entries(languageColors).map(([lang, color]) => (
            <div
              key={lang}
              style={{ margin: '5px', display: 'flex', alignItems: 'center' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  backgroundColor: color,
                  marginRight: '5px',
                }}
              ></span>
              {lang}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { languageColors }
export default LanguageColorLegend
