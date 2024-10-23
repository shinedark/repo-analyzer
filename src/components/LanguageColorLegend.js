import React from 'react'

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
  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '10px',
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
  )
}

export { languageColors }
export default LanguageColorLegend
