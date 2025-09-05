# 🚀 GitHub Pattern & Language Analyzer

## Overview

A revolutionary React-based tool for analyzing patterns, repetitions, word frequencies, and language-specific elements across GitHub repositories. Features advanced build optimization achieving **57%+ size reduction** with intelligent error translation for production deployment.

**🎯 Live Demo**: [GitHub Pages](https://shinedark.github.io/repo-analyzer)  
**📊 Performance**: Up to 57% bundle size reduction  
**🔧 Debug Tools**: Real-time error translation system

## Features

### 🔍 Pattern Analysis
- **Language-Specific Patterns**: Detects common patterns for JavaScript/TypeScript, Python, Java, Go, and more
- **Code Repetitions**: Finds duplicate code blocks across files
- **Word Frequency Analysis**: Analyzes most common words and identifiers in codebases
- **Language Distribution**: Shows file counts and line counts per programming language

### 🚀 Batch Analysis
- **Multi-Repository Analysis**: Analyze multiple repositories in a single operation
- **Predefined Target Lists**: Includes major open-source projects from Facebook, Netflix, Vue, Google, Microsoft, and more
- **Aggregated Results**: Combines analysis across all repositories for comprehensive insights
- **Progress Tracking**: Real-time progress updates during batch operations

### 📊 Visualization & Export
- **Interactive UI**: Clean, modern interface with organized analysis results
- **Multiple Export Formats**: Export results as JSON, CSV, or Markdown
- **Copy to Clipboard**: Quick summary copying for sharing
- **Visual Charts**: Language distribution and pattern frequency visualizations

### ⚡ Performance & Reliability
- **GitHub API Rate Limiting**: Built-in rate limiting to respect GitHub API limits
- **Error Handling**: Robust error handling with retry mechanisms
- **Optimized Analysis**: Efficient parsing and pattern detection algorithms
- **Responsive Design**: Works on desktop and mobile devices

### ⚡ Build Optimization
- **Human-Readable**: 14.37% average reduction with debugging support
- **Computer-Optimized**: 57.48% average reduction with error translation
- **Debug Interface**: Web-based error translation at http://localhost:3001
- **Production Ready**: Automated deployment scripts

## Quick Start

### Prerequisites
- Node.js 14+ and npm
- GitHub Personal Access Token (required for API access)

### GitHub Token Setup

1. **Create a GitHub Personal Access Token:**
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes: `public_repo` (for public repositories) or `repo` (for private repositories)
   - Copy the generated token

2. **Configure Environment Variables:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your token
   REACT_APP_GITHUB_TOKEN=your_github_token_here
   ```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd repo-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up GitHub token for higher API limits:
```bash
# Create a .env file in the project root
echo "REACT_APP_GITHUB_TOKEN=your_github_token_here" > .env
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build Optimization

### 🎯 Quick Optimization

```bash
# Human-readable optimization (recommended for most projects)
npm run build:optimized

# Computer-optimized (maximum performance)
npm run build:computer

# Deploy optimized build
npm run deploy
```

### 🔧 Advanced Optimization

```bash
# Optimize existing build
npm run optimize

# Computer-optimized with error translation
npm run optimize:computer

# Start debug server for error translation
npm run debug
# Visit: http://localhost:3001
```

### 📊 Optimization Results

| Strategy | Average Reduction | Features |
|----------|-------------------|----------|
| **Human-Readable** | 14.37% | Production-ready, debuggable |
| **Computer-Optimized** | 57.48% | Maximum performance, translation-debuggable |

### 🐛 Debugging Optimized Code

```bash
# Translate error messages
npm run translate translate "x3 is not defined"

# Debug specific files
npm run translate debug ./build/static/js/main.js

# Start web debug interface
npm run debug
```

## Usage

### Single Repository Analysis

1. Enter a GitHub repository URL in the input field
2. Click "Analyze Patterns" to start the analysis
3. View results in the interactive visualization
4. Use the "Analyze Patterns" button in the navbar for detailed analysis
5. Export results using the export buttons

### Batch Analysis

1. Click "🚀 Batch Analyze All Repos" to analyze predefined repository sets
2. Monitor progress as repositories are analyzed
3. View aggregated results across all repositories
4. Export comprehensive analysis reports

### Predefined Repository Sets

The tool includes curated lists of repositories from:
- **Meta/Facebook**: React, React Native, Metro, Flipper
- **Netflix**: Hystrix, Eureka, Zuul, Conductor  
- **Vue.js Ecosystem**: Vue Core, Vue Router, Vuex, Vite
- **Google**: Angular, TensorFlow, Go, Kubernetes
- **Microsoft**: TypeScript, VS Code, PowerToys, Playwright
- **Twitter/X**: Bootstrap, Finagle, Heron
- **Popular Open Source**: Node.js, Express, Webpack, Babel, ESLint, Prettier

## Analysis Types

### Pattern Detection
- **JavaScript/TypeScript**: Arrow functions, async/await, destructuring, template literals, imports/exports
- **Python**: Function definitions, list comprehensions, decorators, context managers
- **Java**: Method declarations, annotations, generics, try-catch blocks
- **Go**: Function declarations, goroutines, channels, defer statements
- **Generic**: Comments, string literals, operators, brackets

### Word Frequency Analysis
- Extracts meaningful identifiers and function names
- Filters out common stop words
- Provides frequency counts for code vocabulary analysis

### Code Repetition Detection
- Identifies duplicate code blocks of 3+ lines
- Shows which files contain repetitions
- Helps identify refactoring opportunities

## Technical Architecture

### Frontend (React)
- **Components**: Modular React components for different analysis views
- **State Management**: React hooks for application state
- **Styling**: CSS modules with responsive design
- **API Integration**: GitHub REST API via Octokit

### Analysis Engine
- **Pattern Extraction**: Regex-based pattern matching for different languages
- **AST Parsing**: Babel parser for JavaScript/TypeScript analysis
- **Text Processing**: Word frequency and repetition algorithms
- **Rate Limiting**: Custom rate limiter for API request management

### Data Processing
- **File Filtering**: Intelligent filtering of code files vs other file types
- **Content Analysis**: Base64 decoding and text processing of file contents
- **Aggregation**: Statistical analysis and data aggregation across repositories
- **Export Generation**: Multiple format generation (JSON, CSV, Markdown)

## API Rate Limits

The tool respects GitHub API rate limits:
- **Authenticated**: 5,000 requests per hour
- **Unauthenticated**: 60 requests per hour

For batch analysis, we recommend using a GitHub Personal Access Token to avoid hitting rate limits.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Future Enhancements

- [ ] Support for more programming languages
- [ ] Advanced pattern customization
- [ ] Repository comparison features
- [ ] Historical analysis and trending
- [ ] Integration with code quality metrics
- [ ] Custom pattern definitions
- [ ] API for headless usage

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include repository URLs and error messages if applicable

---

**Built with ❤️ for the open source community**