import React, { useState } from 'react'
import RepoVisualizer from './components/RepoVisualizer'
import Navbar from './components/Navbar'
import TargetRepoSelector from './components/TargetRepoSelector'
import './App.css'

function App() {
  const [repoLink, setRepoLink] = useState('')
  const [submittedLink, setSubmittedLink] = useState('')
  const [showLanguageLegend, setShowLanguageLegend] = useState(false)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [nodes, setNodes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [showSummaryChip, setShowSummaryChip] = useState(true) // Default to true for testing

  // Debug: Add test data to see if chip renders
  React.useEffect(() => {
    if (submittedLink && !analysisData) {
      console.log('Setting test analysis data for debugging')
      setAnalysisData({
        totalFiles: 10,
        codeFiles: 8,
        repetitions: [
          { count: 3, files: ['test1.js', 'test2.js'] },
          { count: 2, files: ['test3.js'] }
        ],
        wordFrequency: [
          { word: 'function', count: 25 },
          { word: 'const', count: 18 }
        ],
        languageStats: {
          'JavaScript': { fileCount: 5, totalLines: 200 },
          'TypeScript': { fileCount: 3, totalLines: 150 }
        }
      })
    }
  }, [submittedLink, analysisData])

  const handleLinkChange = (e) => {
    setRepoLink(e.target.value)
    setError(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Basic validation
    if (!repoLink.trim()) {
      setError('Please enter a GitHub repository link')
      return
    }

    if (!repoLink.startsWith('https://github.com/')) {
      setError('Please enter a valid GitHub repository link')
      return
    }

    setIsLoading(true)
    setError(null)
    setSubmittedLink(repoLink)
    setRepoLink('')
  }

  const handleRepoSelect = (url) => {
    setRepoLink(url)
    setError(null)
  }

  return (
    <div className="App">
      {submittedLink && !isLoading && (
        <Navbar
          showLanguageLegend={showLanguageLegend}
          setShowLanguageLegend={setShowLanguageLegend}
          showAnalyzer={showAnalyzer}
          setShowAnalyzer={setShowAnalyzer}
          nodes={nodes}
          repoUrl={submittedLink}
          onAnalysisComplete={setAnalysisData}
          showSummaryChip={showSummaryChip}
          setShowSummaryChip={setShowSummaryChip}
        />
      )}
      <div className="container">
        <h1>GitHub Pattern & Language Analyzer</h1>
        <p className="app-description">
          Analyze patterns, repetitions, word frequencies, and language-specific elements across major open source repositories
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={repoLink}
            onChange={handleLinkChange}
            placeholder="Enter GitHub Repo Link (https://github.com/owner/repo) or choose from preset targets"
            className={error ? 'error-input' : ''}
          />
          <button type="submit" disabled={isLoading && !nodes.length}>
            {isLoading && !nodes.length ? 'Analyzing Patterns...' : 'Analyze Patterns'}
          </button>
        </form>

        <TargetRepoSelector onRepoSelect={handleRepoSelect} />

        {error && <div className="error-message">{error}</div>}

        {isLoading && !nodes.length && (
          <div className="loader">
            <div className="spinner"></div>
            <p>Analyzing repository...</p>
          </div>
        )}

        {submittedLink && (
          <RepoVisualizer
            repoLink={submittedLink}
            setNodes={setNodes}
            showLanguageLegend={showLanguageLegend}
            analysisData={analysisData}
            showSummaryChip={showSummaryChip}
          />
        )}
      </div>
    </div>
  )
}

export default App
