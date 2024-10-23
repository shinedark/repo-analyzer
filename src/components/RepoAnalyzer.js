import React, { useState, useEffect, useCallback } from 'react'
import './RepoVisualizer.css'

const RepoAnalyzer = ({ nodes, onClose }) => {
  const [analysis, setAnalysis] = useState(null)

  const analyzeRepo = useCallback(() => {
    if (!nodes || nodes.length === 0) {
      setAnalysis(null)
      return
    }

    const totalFiles = nodes.length
    const fileTypes = nodes
      .map((node) => node.data?.extension || getFileExtension(node.data?.name))
      .filter(Boolean)

    const language = determineMainLanguage(fileTypes)

    const hasPackageJson = nodes.some(
      (node) => node.data?.name === 'package.json',
    )

    setAnalysis({ totalFiles, language, fileTypes, hasPackageJson })
  }, [nodes])

  useEffect(() => {
    analyzeRepo()
  }, [analyzeRepo])

  const renderAnalysis = () => {
    if (!analysis)
      return (
        <p>
          No analysis available. Please ensure the repository has been loaded.
        </p>
      )

    return (
      <div className="repo-analysis">
        <h2>Repository Analysis</h2>
        <p>Total Files: {analysis.totalFiles}</p>
        <p>Most Common Language: {analysis.language}</p>
        {analysis.hasPackageJson && (
          <p>Node.js project detected (package.json found)</p>
        )}
        <h3>File Types:</h3>
        {analysis.fileTypes.length > 0 ? (
          <ul>
            {[...new Set(analysis.fileTypes)].map((type) => (
              <li key={type}>{type}</li>
            ))}
          </ul>
        ) : (
          <p>No file types detected.</p>
        )}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        {renderAnalysis()}
      </div>
    </div>
  )
}

// Helper functions (add these outside the component)
function getFileExtension(filename) {
  return filename ? filename.split('.').pop() : null
}

function determineMainLanguage(fileTypes) {
  if (fileTypes.length === 0) return 'Unknown'

  const typeCounts = fileTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  return Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]
}

export default RepoAnalyzer
