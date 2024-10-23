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

  const handleLinkChange = (e) => {
    setRepoLink(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmittedLink(repoLink)
  }

  return (
    <div className="App">
      <Navbar
        showLanguageLegend={showLanguageLegend}
        setShowLanguageLegend={setShowLanguageLegend}
        showAnalyzer={showAnalyzer}
        setShowAnalyzer={setShowAnalyzer}
        nodes={nodes}
      />
      <div className="container">
        <h1>GitHub Repository Analyzer</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={repoLink}
            onChange={handleLinkChange}
            placeholder="Enter GitHub Repo Link"
          />
          <button type="submit">Analyze</button>
        </form>
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
