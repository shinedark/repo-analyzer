import React, { useEffect, useState, useMemo, useCallback } from 'react'
import ReactFlow, { Background, Controls, MiniMap } from 'react-flow-renderer'
import {
  parseFile,
  extractDependencies,
  countFunctions,
} from '../utils/codeParser'
import FileContentModal from './FileContentModal'
import { languageColors } from './LanguageColorLegend'

const getNodeColor = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  return languageColors[extension] || languageColors.default
}

const RepoVisualizer = ({ repoLink }) => {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  // Use a constant to store the token and ensure it's accessible
  const githubToken = process.env.REACT_APP_GITHUB_TOKEN

  const handleNodeClick = useCallback(async (event, node) => {
    try {
      const file = node.data

      const response = await fetch(file.downloadUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const content = await response.text()

      // Parse JSON content if the file is a JSON file
      const parsedContent =
        file.extension === 'json' ? JSON.parse(content) : content

      setSelectedFile({ ...file, content: parsedContent })
    } catch (error) {
      console.error('Error fetching file content:', error)
      alert('Error fetching file content. Please try again.')
    }
  }, [])

  const buildFlowElements = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    console.log('Starting to build flow elements')
    const [owner, repo] = repoLink.replace('https://github.com/', '').split('/')

    console.log('Owner:', owner)
    console.log('Repository:', repo)

    const fetchRepoFiles = async (owner, repo, path = '') => {
      try {
        if (!githubToken) {
          throw new Error(
            'GitHub token is missing. Please add it to your environment variables.',
          )
        }

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            headers: {
              Authorization: `Bearer ${githubToken}`,
            },
          },
        )
        if (!response.ok) {
          throw new Error(
            `Error fetching repository content: ${response.statusText}`,
          )
        }
        const repoContent = await response.json()

        let files = []
        for (const item of repoContent) {
          if (item.type === 'dir') {
            const dirFiles = await fetchRepoFiles(owner, repo, item.path)
            files = files.concat(dirFiles)
          } else if (item.type === 'file') {
            // Include all file types for now
            files.push(item)
          }
        }
        return files
      } catch (error) {
        console.error('Error fetching repository content:', error)
        setError(`Error fetching repository content: ${error.message}`)
        return []
      }
    }

    const createNodes = (files) => {
      const nodes = []
      const edges = []
      const directories = new Set()

      files.forEach((file, index) => {
        const parts = file.path.split('/')
        const fileName = parts.pop()
        const dirPath = parts.join('/')

        // Add directory nodes
        parts.forEach((_, index) => {
          const currentPath = parts.slice(0, index + 1).join('/')
          if (!directories.has(currentPath)) {
            directories.add(currentPath)
            nodes.push({
              id: currentPath,
              type: 'default',
              position: { x: 0, y: 0 }, // We'll position nodes later
              data: {
                label: parts[index],
                isDirectory: true,
              },
              style: {
                background: '#E1E1E1', // Light gray for directories
                border: '1px solid #999',
                borderRadius: '5px',
                padding: '10px',
              },
            })
          }
        })

        // Add file node
        const fileColor = getNodeColor(fileName)
        const fileExtension = fileName.split('.').pop().toLowerCase()
        const isClickable = fileExtension !== '' // Check if the file has an extension
        nodes.push({
          id: file.path,
          type: 'default',
          position: { x: 0, y: 0 }, // We'll position nodes later
          data: {
            label: fileName,
            size: file.size,
            sha: file.sha,
            path: file.path,
            downloadUrl: file.download_url,
            htmlUrl: file.html_url,
            extension: fileExtension,
            isDirectory: false,
            linesOfCode: 0,
            numberOfFunctions: 0,
            onClick: isClickable ? () => handleNodeClick(file) : undefined, // Only add onClick if clickable
          },
          style: {
            background: fileColor,
            color: '#fff', // White text for contrast
            border: '1px solid #999',
            borderRadius: '5px',
            padding: '10px',
            cursor: isClickable ? 'pointer' : 'default', // Change cursor based on clickability
          },
        })

        // Add edge from parent directory to file
        if (dirPath) {
          edges.push({
            id: `${dirPath}-${file.path}`,
            source: dirPath,
            target: file.path,
            type: 'smoothstep',
          })
        }
      })

      return { nodes, edges }
    }

    const positionNodes = (nodes) => {
      const levelWidth = 300
      const levelHeight = 100
      const nodesByLevel = {}

      nodes.forEach((node) => {
        const level = node.id.split('/').length - 1
        if (!nodesByLevel[level]) {
          nodesByLevel[level] = []
        }
        nodesByLevel[level].push(node)
      })

      Object.entries(nodesByLevel).forEach(([level, levelNodes]) => {
        levelNodes.forEach((node, index) => {
          node.position = {
            x: parseInt(level) * levelWidth,
            y: index * levelHeight,
          }
        })
      })

      return nodes
    }

    try {
      const files = await fetchRepoFiles(owner, repo)

      if (files.length > 0) {
        let { nodes, edges } = createNodes(files)
        nodes = positionNodes(nodes)

        // Process file contents and create dependency edges
        for (const file of files) {
          try {
            const response = await fetch(file.download_url)
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const code = await response.text()

            const ast = parseFile(file.name, code)
            const dependencies = extractDependencies(file.name, ast)

            // Update node with additional information
            const nodeIndex = nodes.findIndex((node) => node.id === file.path)
            if (nodeIndex !== -1) {
              nodes[nodeIndex].data.linesOfCode = code.split('\n').length
              nodes[nodeIndex].data.numberOfFunctions = countFunctions(ast)
            }

            // Create dependency edges
            dependencies.forEach((dep) => {
              const targetNode = nodes.find((node) =>
                node.data.label.includes(dep),
              )
              if (targetNode) {
                edges.push({
                  id: `${file.path}-${targetNode.id}-dep`,
                  source: file.path,
                  target: targetNode.id,
                  type: 'smoothstep',
                  animated: true,
                })
              }
            })
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error)
          }
        }

        setNodes(nodes)
        setEdges(edges)
      } else {
        setError('No files found in the repository')
      }
    } catch (error) {
      console.error('Error building flow elements:', error)
      setError(`Error building flow elements: ${error.message}`)
    } finally {
      setIsLoading(false)
      console.log('Finished building flow elements')
    }
  }, [repoLink, githubToken, handleNodeClick])

  useEffect(() => {
    if (repoLink) {
      buildFlowElements()
    }
  }, [repoLink, buildFlowElements])

  const memoizedNodes = useMemo(() => nodes, [nodes])
  const memoizedEdges = useMemo(() => edges, [edges])

  if (isLoading) {
    return <div>Loading repository structure...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <>
      <div style={{ height: '80vh', width: '80vw', border: '1px solid black' }}>
        <ReactFlow
          nodes={memoizedNodes}
          edges={memoizedEdges}
          onNodeClick={handleNodeClick}
          fitView
          style={{ height: '100%', width: '100%' }}
        >
          <Background gap={16} size={1.5} />
          <Controls fitView />
          <MiniMap />
        </ReactFlow>
      </div>
      {selectedFile && (
        <FileContentModal
          file={selectedFile}
          content={selectedFile.content}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </>
  )
}

export default RepoVisualizer
