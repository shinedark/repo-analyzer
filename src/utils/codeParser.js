import { parse as parseJS } from '@babel/parser'

export const parseFile = (fileName, code) => {
  const extension = fileName.split('.').pop().toLowerCase()

  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return parseJS(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      })
    default:
      console.warn(`Unsupported file type: ${extension}`)
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
