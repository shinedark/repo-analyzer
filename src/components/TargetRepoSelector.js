import React, { useState } from 'react'
import BatchAnalyzer from './BatchAnalyzer'

const TargetRepoSelector = ({ onRepoSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showBatchAnalyzer, setShowBatchAnalyzer] = useState(false)

  const majorRepos = [
    {
      category: 'Meta/Facebook',
      repos: [
        { name: 'React', url: 'https://github.com/facebook/react', description: 'JavaScript library for building user interfaces' },
        { name: 'React Native', url: 'https://github.com/facebook/react-native', description: 'Mobile app framework' },
        { name: 'Metro', url: 'https://github.com/facebook/metro', description: 'JavaScript bundler' },
        { name: 'Flipper', url: 'https://github.com/facebook/flipper', description: 'Desktop debugging platform' }
      ]
    },
    {
      category: 'Netflix',
      repos: [
        { name: 'Hystrix', url: 'https://github.com/Netflix/Hystrix', description: 'Latency and fault tolerance library' },
        { name: 'Eureka', url: 'https://github.com/Netflix/eureka', description: 'Service discovery server' },
        { name: 'Zuul', url: 'https://github.com/Netflix/zuul', description: 'Gateway service' },
        { name: 'Conductor', url: 'https://github.com/Netflix/conductor', description: 'Workflow orchestration engine' }
      ]
    },
    {
      category: 'Vue.js Ecosystem',
      repos: [
        { name: 'Vue.js Core', url: 'https://github.com/vuejs/core', description: 'Progressive JavaScript framework' },
        { name: 'Vue Router', url: 'https://github.com/vuejs/router', description: 'Official router for Vue.js' },
        { name: 'Vuex', url: 'https://github.com/vuejs/vuex', description: 'State management pattern' },
        { name: 'Vite', url: 'https://github.com/vitejs/vite', description: 'Next generation frontend tooling' }
      ]
    },
    {
      category: 'Google',
      repos: [
        { name: 'Angular', url: 'https://github.com/angular/angular', description: 'Platform for mobile and desktop web applications' },
        { name: 'TensorFlow', url: 'https://github.com/tensorflow/tensorflow', description: 'Machine learning platform' },
        { name: 'Go', url: 'https://github.com/golang/go', description: 'The Go programming language' },
        { name: 'Kubernetes', url: 'https://github.com/kubernetes/kubernetes', description: 'Container orchestration system' }
      ]
    },
    {
      category: 'Microsoft',
      repos: [
        { name: 'TypeScript', url: 'https://github.com/microsoft/TypeScript', description: 'Superset of JavaScript' },
        { name: 'VS Code', url: 'https://github.com/microsoft/vscode', description: 'Code editor' },
        { name: 'PowerToys', url: 'https://github.com/microsoft/PowerToys', description: 'Windows system utilities' },
        { name: 'Playwright', url: 'https://github.com/microsoft/playwright', description: 'Web testing and automation' }
      ]
    },
    {
      category: 'Twitter/X',
      repos: [
        { name: 'Bootstrap', url: 'https://github.com/twbs/bootstrap', description: 'CSS framework' },
        { name: 'Finagle', url: 'https://github.com/twitter/finagle', description: 'Extensible RPC system' },
        { name: 'Heron', url: 'https://github.com/apache/incubator-heron', description: 'Real-time stream processing' }
      ]
    },
    {
      category: 'Popular Open Source',
      repos: [
        { name: 'Node.js', url: 'https://github.com/nodejs/node', description: 'JavaScript runtime' },
        { name: 'Express', url: 'https://github.com/expressjs/express', description: 'Web framework for Node.js' },
        { name: 'Webpack', url: 'https://github.com/webpack/webpack', description: 'Module bundler' },
        { name: 'Babel', url: 'https://github.com/babel/babel', description: 'JavaScript compiler' },
        { name: 'ESLint', url: 'https://github.com/eslint/eslint', description: 'JavaScript linter' },
        { name: 'Prettier', url: 'https://github.com/prettier/prettier', description: 'Code formatter' }
      ]
    }
  ]

  const handleRepoClick = (repo) => {
    onRepoSelect(repo.url)
    setIsExpanded(false)
  }

  const handleBatchAnalysis = () => {
    setShowBatchAnalyzer(true)
  }

  const getAllRepos = () => {
    return majorRepos.flatMap(category => category.repos)
  }

  return (
    <div className="target-repo-selector">
      <div className="selector-buttons">
        <button 
          className="preset-repos-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼' : '▶'} Choose from Popular Repositories
        </button>
        <button 
          className="batch-analysis-btn"
          onClick={handleBatchAnalysis}
        >
          🚀 Batch Analyze All Repos
        </button>
      </div>
      
      {isExpanded && (
        <div className="repos-grid">
          {majorRepos.map((category) => (
            <div key={category.category} className="repo-category">
              <h3>{category.category}</h3>
              <div className="repo-list">
                {category.repos.map((repo) => (
                  <div 
                    key={repo.url} 
                    className="repo-item"
                    onClick={() => handleRepoClick(repo)}
                  >
                    <h4>{repo.name}</h4>
                    <p>{repo.description}</p>
                    <span className="repo-url">{repo.url}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showBatchAnalyzer && (
        <BatchAnalyzer
          targetRepos={getAllRepos()}
          onClose={() => setShowBatchAnalyzer(false)}
        />
      )}
    </div>
  )
}

export default TargetRepoSelector
