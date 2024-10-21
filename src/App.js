import React, { useState } from 'react'
import RepoVisualizer from './components/RepoVisualizer'
import './App.css' // Add this import for the CSS

function App() {
  const [repoLink, setRepoLink] = useState('')
  const [submittedLink, setSubmittedLink] = useState('')

  const handleLinkChange = (e) => {
    setRepoLink(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmittedLink(repoLink)
  }

  return (
    <div className="App">
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
        {submittedLink && <RepoVisualizer repoLink={submittedLink} />}
      </div>
    </div>
  )
}

export default App
