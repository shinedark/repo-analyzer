import { parse as parseJS } from '@babel/parser'

export const parseFile = (fileName, code) => {
  const extension = fileName.split('.').pop().toLowerCase()
  const isDeclarationFile = fileName.endsWith('.d.ts')

  // Skip TypeScript declaration files as they have different syntax
  if (isDeclarationFile) {
    console.log(`Skipping TypeScript declaration file: ${fileName}`)
    return null
  }

  try {
    switch (extension) {
      case 'js':
      case 'jsx':
        // Try multiple parsing strategies for JavaScript files
        try {
          return parseJS(code, {
            sourceType: 'module',
            plugins: ['jsx'],
          })
        } catch (moduleError) {
          // Fallback to script parsing
          try {
            return parseJS(code, {
              sourceType: 'script',
              plugins: ['jsx'],
            })
          } catch (scriptError) {
            // Try with more permissive settings
            return parseJS(code, {
              sourceType: 'unambiguous',
              plugins: ['jsx', 'objectRestSpread', 'functionBind', 'decorators-legacy'],
              allowImportExportEverywhere: true,
              allowAwaitOutsideFunction: true,
              allowReturnOutsideFunction: true,
              allowSuperOutsideMethod: true,
              allowUndeclaredExports: true,
            })
          }
        }
      case 'ts':
      case 'tsx':
        return parseJS(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript', 'decorators-legacy'],
          allowImportExportEverywhere: true,
        })
      default:
        console.warn(`Unsupported file type: ${extension}`)
        return null
    }
  } catch (error) {
    console.warn(`Error parsing ${fileName} (${extension}):`, error.message)
    
    // Log more details for debugging
    if (error.loc) {
      console.warn(`Parse error at line ${error.loc.line}, column ${error.loc.column}`)
    }
    
    return null
  }
}

export const extractDependencies = (fileName, ast) => {
  if (!ast) return []

  const dependencies = []
  ast.program.body.forEach((node) => {
    if (node.type === 'ImportDeclaration') {
      dependencies.push(node.source.value)
    }
  })
  return dependencies
}

export const countFunctions = (ast) => {
  let count = 0
  if (!ast) return count

  const traverse = (node) => {
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'FunctionExpression'
    ) {
      count++
    }
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        traverse(node[key])
      }
    }
  }

  traverse(ast)
  return count
}

export function extractImports(ast) {
  const imports = []
  if (ast && ast.body && Array.isArray(ast.body)) {
    ast.body.forEach((node) => {
      if (node.type === 'ImportDeclaration') {
        imports.push(node.source.value)
      }
    })
  }
  return imports
}

// Enhanced pattern analysis functions
export const extractCodePatterns = (fileName, content) => {
  const patterns = []
  const extension = fileName.split('.').pop().toLowerCase()
  
  // Language-specific pattern extraction
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      patterns.push(...extractJavaScriptPatterns(content))
      break
    case 'py':
      patterns.push(...extractPythonPatterns(content))
      break
    case 'java':
      patterns.push(...extractJavaPatterns(content))
      break
    case 'go':
      patterns.push(...extractGoPatterns(content))
      break
    default:
      patterns.push(...extractGenericPatterns(content))
  }
  
  return patterns
}

export const extractWordFrequency = (content, language = 'unknown') => {
  const words = new Map()
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
    'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
  ])

  // Extract meaningful words (identifiers, function names, etc.)
  const wordRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g
  const matches = content.match(wordRegex) || []
  
  matches.forEach(word => {
    const lowerWord = word.toLowerCase()
    if (word.length > 2 && !stopWords.has(lowerWord) && !/^\d+$/.test(word)) {
      words.set(lowerWord, (words.get(lowerWord) || 0) + 1)
    }
  })

  return Array.from(words.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
}

export const findCodeRepetitions = (files) => {
  const codeBlocks = new Map()
  const minBlockSize = 3 // minimum lines for a repetition
  
  files.forEach(file => {
    const lines = file.content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10) // ignore very short lines
    
    // Create sliding windows of code blocks
    for (let i = 0; i <= lines.length - minBlockSize; i++) {
      const block = lines.slice(i, i + minBlockSize).join('\n')
      const blockHash = hashCode(block)
      
      if (!codeBlocks.has(blockHash)) {
        codeBlocks.set(blockHash, {
          content: block,
          files: new Set(),
          count: 0
        })
      }
      
      codeBlocks.get(blockHash).files.add(file.name)
      codeBlocks.get(blockHash).count++
    }
  })
  
  // Filter out blocks that appear in only one location
  return Array.from(codeBlocks.values())
    .filter(block => block.count > 1 || block.files.size > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20) // Top 20 repetitions
}

// Language-specific pattern extractors
function extractJavaScriptPatterns(content) {
  const patterns = []
  
  // Common JS/TS patterns
  const jsPatterns = [
    { name: 'Arrow Functions', regex: /=>\s*{?/g },
    { name: 'Async/Await', regex: /async\s+\w+|await\s+\w+/g },
    { name: 'Destructuring', regex: /const\s*{\s*\w+/g },
    { name: 'Template Literals', regex: /`[^`]*\${[^}]*}/g },
    { name: 'Import Statements', regex: /import\s+.*from\s+['"][^'"]+['"]/g },
    { name: 'Export Statements', regex: /export\s+(default\s+)?/g },
    { name: 'Function Declarations', regex: /function\s+\w+\s*\(/g },
    { name: 'Class Definitions', regex: /class\s+\w+/g },
    { name: 'Try-Catch Blocks', regex: /try\s*{|catch\s*\(/g },
    { name: 'Promise Usage', regex: /\.then\(|\.catch\(|new\s+Promise/g }
  ]
  
  jsPatterns.forEach(pattern => {
    const matches = content.match(pattern.regex) || []
    if (matches.length > 0) {
      patterns.push({
        type: pattern.name,
        count: matches.length,
        language: 'JavaScript/TypeScript'
      })
    }
  })
  
  return patterns
}

function extractPythonPatterns(content) {
  const patterns = []
  
  const pythonPatterns = [
    { name: 'Function Definitions', regex: /def\s+\w+\s*\(/g },
    { name: 'Class Definitions', regex: /class\s+\w+/g },
    { name: 'List Comprehensions', regex: /\[.*for\s+\w+\s+in\s+.*\]/g },
    { name: 'Import Statements', regex: /from\s+\w+\s+import|import\s+\w+/g },
    { name: 'Decorators', regex: /@\w+/g },
    { name: 'With Statements', regex: /with\s+\w+/g },
    { name: 'Lambda Functions', regex: /lambda\s+.*:/g },
    { name: 'Try-Except Blocks', regex: /try:|except\s*\w*:/g }
  ]
  
  pythonPatterns.forEach(pattern => {
    const matches = content.match(pattern.regex) || []
    if (matches.length > 0) {
      patterns.push({
        type: pattern.name,
        count: matches.length,
        language: 'Python'
      })
    }
  })
  
  return patterns
}

function extractJavaPatterns(content) {
  const patterns = []
  
  const javaPatterns = [
    { name: 'Method Declarations', regex: /(public|private|protected)\s+\w+\s+\w+\s*\(/g },
    { name: 'Class Declarations', regex: /(public|private)\s+class\s+\w+/g },
    { name: 'Interface Declarations', regex: /(public\s+)?interface\s+\w+/g },
    { name: 'Import Statements', regex: /import\s+[\w.]+;/g },
    { name: 'Annotations', regex: /@\w+/g },
    { name: 'Try-Catch Blocks', regex: /try\s*{|catch\s*\(/g },
    { name: 'Generic Usage', regex: /<[A-Z]\w*>/g }
  ]
  
  javaPatterns.forEach(pattern => {
    const matches = content.match(pattern.regex) || []
    if (matches.length > 0) {
      patterns.push({
        type: pattern.name,
        count: matches.length,
        language: 'Java'
      })
    }
  })
  
  return patterns
}

function extractGoPatterns(content) {
  const patterns = []
  
  const goPatterns = [
    { name: 'Function Declarations', regex: /func\s+\w+\s*\(/g },
    { name: 'Method Declarations', regex: /func\s*\([^)]*\)\s*\w+\s*\(/g },
    { name: 'Struct Definitions', regex: /type\s+\w+\s+struct/g },
    { name: 'Interface Definitions', regex: /type\s+\w+\s+interface/g },
    { name: 'Import Statements', regex: /import\s+\(/g },
    { name: 'Goroutines', regex: /go\s+\w+/g },
    { name: 'Channels', regex: /make\s*\(\s*chan\s+\w+\)|<-\s*\w+|\w+\s*<-/g },
    { name: 'Defer Statements', regex: /defer\s+\w+/g }
  ]
  
  goPatterns.forEach(pattern => {
    const matches = content.match(pattern.regex) || []
    if (matches.length > 0) {
      patterns.push({
        type: pattern.name,
        count: matches.length,
        language: 'Go'
      })
    }
  })
  
  return patterns
}

function extractGenericPatterns(content) {
  const patterns = []
  
  // Generic patterns that work across languages
  const genericPatterns = [
    { name: 'Comments', regex: /\/\*[\s\S]*?\*\/|\/\/.*$/gm },
    { name: 'String Literals', regex: /"[^"]*"|'[^']*'/g },
    { name: 'Numbers', regex: /\b\d+\.?\d*\b/g },
    { name: 'Brackets', regex: /[{}()[\]]/g },
    { name: 'Operators', regex: /[+\-*/%=<>!&|]/g }
  ]
  
  genericPatterns.forEach(pattern => {
    const matches = content.match(pattern.regex) || []
    if (matches.length > 0) {
      patterns.push({
        type: pattern.name,
        count: matches.length,
        language: 'Generic'
      })
    }
  })
  
  return patterns
}

// Helper function to generate hash codes
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}
