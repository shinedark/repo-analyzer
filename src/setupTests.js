// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Octokit to avoid ES module issues
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(() => ({
    rest: {
      repos: {
        getContent: jest.fn(),
        listContents: jest.fn(),
      }
    }
  }))
}));

// Mock react-syntax-highlighter
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }) => <pre>{children}</pre>
}));

jest.mock('react-syntax-highlighter/dist/cjs/styles/prism', () => ({
  coldarkDark: {}
}));

// Mock esprima
jest.mock('esprima', () => ({
  tokenize: jest.fn(() => [])
}));

// Mock react-flow-renderer
jest.mock('react-flow-renderer', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="react-flow">{children}</div>,
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />
}));

// Mock environment variables
process.env.REACT_APP_GITHUB_TOKEN = 'test-token';