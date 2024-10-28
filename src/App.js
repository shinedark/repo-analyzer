import React, { useState } from 'react'
import RepoVisualizer from './components/RepoVisualizer'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  const [repoLink, setRepoLink] = useState('')
  const [submittedLink, setSubmittedLink] = useState('')
  const [showLanguageLegend, setShowLanguageLegend] = useState(false)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [nodes, setNodes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

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

  return (
    <div className="App">
      {submittedLink && !isLoading && (
        <Navbar
          showLanguageLegend={showLanguageLegend}
          setShowLanguageLegend={setShowLanguageLegend}
          showAnalyzer={showAnalyzer}
          setShowAnalyzer={setShowAnalyzer}
          nodes={nodes}
        />
      )}
      <div className="container">
        <h1>GitHub Repository Analyzer</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={repoLink}
            onChange={handleLinkChange}
            placeholder="Enter GitHub Repo Link (https://github.com/owner/repo)"
            className={error ? 'error-input' : ''}
          />
          <button type="submit" disabled={isLoading && !nodes.length}>
            {isLoading && !nodes.length ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

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
          />
        )}
      </div>
    </div>
  )
}

export default App
