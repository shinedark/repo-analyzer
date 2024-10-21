import React from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

// ... existing imports and language registrations ...

const FileContentModal = ({ file, content, onClose }) => {
  console.log('FileContentModal rendered', { file, content })

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
    if (!content || typeof content !== 'string')
      return { lines: 0, functions: 0, imports: [], contracts: [] }

    const lines = content.split('\n').length
    const fileExtension = fileName.split('.').pop().toLowerCase()

    let functionRegex, importRegex, contractRegex

    if (fileExtension === 'sol') {
      functionRegex = /function\s+(\w+)/g
      importRegex = /import\s+(?:(?:\{[^}]+\}|[^{}\s]+)\s+from\s+)?["']([^"']+)["']/g
      contractRegex = /contract\s+(\w+)/g
    } else {
      // ... existing regex for other file types ...
    }

    const functions = (content.match(functionRegex) || []).length

    const imports = []
    let match
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }

    const contracts = []
    while ((match = contractRegex.exec(content)) !== null) {
      contracts.push(match[1])
    }

    return { lines, functions, imports, contracts }
  }

  if (!file) {
    console.log('No file provided to FileContentModal')
    return null
  }

  const fileName =
    file.name || (file.path ? file.path.split('/').pop() : 'Unknown File')
  const analysis = analyzeCode(content, fileName)

  const renderContent = () => {
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
      return (
        <SyntaxHighlighter
          language={getLanguage(fileName)}
          style={docco}
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
    return (
      <>
        <p>
          <strong>Lines of code:</strong> {analysis.lines}
        </p>
        <p>
          <strong>Number of functions:</strong> {analysis.functions}
        </p>
        {analysis.imports.length > 0 && (
          <div>
            <strong>Imports:</strong>
            <ul>
              {analysis.imports.map((imp, index) => (
                <li key={index}>{imp}</li>
              ))}
            </ul>
          </div>
        )}
        {analysis.contracts.length > 0 && (
          <div>
            <strong>Contracts:</strong>
            <ul>
              {analysis.contracts.map((contract, index) => (
                <li key={index}>{contract}</li>
              ))}
            </ul>
          </div>
        )}
      </>
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
            <p>
              <strong>Size:</strong>{' '}
              {file.size !== undefined ? `${file.size} bytes` : 'Unknown'}
            </p>
            {content && typeof content === 'string' && renderAnalysis()}
          </div>
          <div className="file-content">
            <h2>File Content:</h2>
            {renderContent()}
          </div>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          text-align: justify;
          margin: 10px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: #f0f0f0;
        }
        .modal-header h1 {
          margin: 0;
          font-size: 1.5rem;
        }
        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        .file-info {
          margin-bottom: 1rem;
        }
        .file-info p {
          margin: 0.5rem 0;
        }
        .file-content {
          border-top: 1px solid #e0e0e0;
          padding-top: 1rem;
        }
        .file-info ul {
          margin: 0;
          padding-left: 20px;
        }
        @media (max-width: 600px) {
          .modal-content {
            width: 95%;
          }
          .modal-header h1 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  )
}

export default FileContentModal
