import React from 'react'
// import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
// import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import GasPriceCalculator from './GasPriceCalculator'
import './FileContentModal.css'
import { tokenize } from 'esprima'

// ... existing imports and language registrations ...

const FileContentModal = ({ file, content, onClose }) => {
  const getLanguage = (fileName) => {
    if (!fileName) return 'plaintext'

    const extension = fileName.split('.').pop().toLowerCase()
    const languageMap = {
      // Existing mappings
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      py: 'python',
      rb: 'ruby',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      go: 'go',
      php: 'php',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      // Additional languages and config files
      yml: 'yaml',
      yaml: 'yaml',
      xml: 'xml',
      sql: 'sql',
      sh: 'bash',
      bash: 'bash',
      ps1: 'powershell',
      bat: 'batch',
      lua: 'lua',
      r: 'r',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      rs: 'rust',
      dart: 'dart',
      groovy: 'groovy',
      pl: 'perl',
      dockerfile: 'dockerfile',
      ini: 'ini',
      toml: 'toml',
      // Common config files
      gitignore: 'plaintext',
      env: 'plaintext',
      eslintrc: 'json',
      babelrc: 'json',
      prettierrc: 'json',
      stylelintrc: 'json',
      sol: 'solidity',
    }

    // Special handling for files without extension
    if (fileName.indexOf('.') === -1) {
      return languageMap[fileName.toLowerCase()] || 'plaintext'
    }

    return languageMap[extension] || 'plaintext'
  }

  const analyzeCode = (content, fileName) => {
    if (!content || typeof content !== 'string') {
      return {
        lines: 0,
        functions: 0,
        imports: [],
        contracts: [],
        complexity: 0,
        tokens: 0,
      }
    }

    const lines = content.split('\n').length
    const fileExtension = fileName.split('.').pop().toLowerCase()

    let functionRegex,
      importRegex,
      contractRegex,
      complexityScore = 0,
      tokens = 0

    if (fileExtension === 'sol') {
      functionRegex = /function\s+(\w+)/g
      importRegex = /import\s+(?:(?:\{[^}]+\}|[^{}\s]+)\s+from\s+)?["']([^"']+)["']/g
      contractRegex = /contract\s+(\w+)/g
    } else if (fileExtension === 'js' || fileExtension === 'ts') {
      functionRegex = /function\s+(\w+)|(\w+)\s*=\s*function|\(.*\)\s*=>/g
      importRegex = /import\s+(?:(?:\{[^}]+\}|[^{}\s]+)\s+from\s+)?["']([^"']+)["']/g
      // Calculate cyclomatic complexity (very basic)
      complexityScore = (content.match(/if|for|while|switch|catch/g) || [])
        .length

      // Count tokens
      try {
        tokens = tokenize(content).length
      } catch (error) {
        console.error('Error tokenizing code:', error)
      }
    } else {
      // For other file types, we'll just count lines
      return {
        lines,
        functions: 0,
        imports: [],
        contracts: [],
        complexity: 0,
        tokens: 0,
      }
    }

    const functions = (content.match(functionRegex) || []).length

    const imports = []
    let match
    while (importRegex && (match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }

    const contracts = []
    while (contractRegex && (match = contractRegex.exec(content)) !== null) {
      contracts.push(match[1])
    }

    return {
      lines,
      functions,
      imports,
      contracts,
      complexity: complexityScore,
      tokens,
    }
  }

  if (!file) {
    console.log('No file provided to FileContentModal')
    return null
  }

  const fileName =
    file.name || (file.path ? file.path.split('/').pop() : 'Unknown File')

  const renderContent = () => {
    if (file.isDirectory) {
      return <p>This is a directory. Its contents cannot be displayed here.</p>
    }

    if (typeof content === 'object') {
      return (
        <SyntaxHighlighter
          language="json"
          style={coldarkDark}
          wrapLongLines
          customStyle={{
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(content, null, 2)}
        </SyntaxHighlighter>
      )
    }

    const extension = fileName.split('.').pop().toLowerCase()
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg']
    const audioExtensions = ['mp3', 'wav', 'ogg']
    const videoExtensions = ['mp4', 'webm', 'ogv']

    if (imageExtensions.includes(extension)) {
      return (
        <img
          src={content}
          alt={fileName}
          style={{ maxWidth: '100%', maxHeight: '400px' }}
        />
      )
    } else if (audioExtensions.includes(extension)) {
      return <audio controls src={content} style={{ width: '100%' }} />
    } else if (videoExtensions.includes(extension)) {
      return (
        <video
          controls
          src={content}
          style={{ maxWidth: '100%', maxHeight: '400px' }}
        />
      )
    } else if (content) {
      const language = getLanguage(fileName)
      //   console.log('Detected language:', language)
      //   console.log('Content type:', typeof content)
      //   console.log('Content preview:', content.slice(0, 100)) // Show first 100 characters

      return (
        <SyntaxHighlighter
          language={language}
          style={coldarkDark}
          wrapLongLines
          customStyle={{
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          {content}
        </SyntaxHighlighter>
      )
    } else {
      return <p>No content available</p>
    }
  }

  const renderAnalysis = () => {
    if (file.isDirectory) {
      return null // Don't show analysis for directories
    }

    const analysis = analyzeCode(content, fileName)
    return (
      <div className="file-analysis">
        <p>
          <strong>Lines of code:</strong>{' '}
          <span className="analysis-value">{analysis.lines}</span>
        </p>
        <p>
          <strong>Number of functions:</strong>{' '}
          <span className="analysis-value">{analysis.functions}</span>
        </p>
        <p>
          <strong>Cyclomatic complexity:</strong>{' '}
          <span className="analysis-value">{analysis.complexity}</span>
        </p>
        <p>
          <strong>Number of tokens:</strong>{' '}
          <span className="analysis-value">{analysis.tokens}</span>
        </p>
        {analysis.imports.length > 0 && (
          <div className="analysis-section">
            <strong>Imports:</strong>
            <ul className="analysis-list">
              {analysis.imports.map((imp, index) => (
                <li key={index}>{imp}</li>
              ))}
            </ul>
          </div>
        )}
        {analysis.contracts.length > 0 && (
          <div className="analysis-section">
            <strong>Contracts:</strong>
            <ul className="analysis-list">
              {analysis.contracts.map((contract, index) => (
                <li key={index}>{contract}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h1>{fileName}</h1>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="file-info">
            <p>
              <strong>Path:</strong> {file.path || 'Unknown'}
            </p>
            {!file.isDirectory && (
              <p>
                <strong>Size:</strong>{' '}
                {file.size !== undefined ? `${file.size} bytes` : 'Unknown'}
              </p>
            )}
            {renderAnalysis()}
            {file.extension === 'sol' && (
              <GasPriceCalculator fileContent={content} fileName={fileName} />
            )}
          </div>
          <div className="file-content">
            <h2>
              {file.isDirectory ? 'Directory Information:' : 'File Content:'}
            </h2>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileContentModal
