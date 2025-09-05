#!/usr/bin/env node

/**
 * Debug Server for Computer-Optimized Builds
 * Web interface for error translation and debugging
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const ErrorTranslator = require('./error-translator');

class DebugServer {
  constructor(port = 3001) {
    this.port = port;
    this.translator = new ErrorTranslator();
  }

  start() {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(this.port, () => {
      console.log(`🔧 Debug Server running at http://localhost:${this.port}`);
      console.log('Available endpoints:');
      console.log('  GET  / - Debug interface');
      console.log('  POST /translate - Translate error message');
      console.log('  POST /debug - Debug file');
    });
  }

  handleRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${this.port}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    switch (url.pathname) {
      case '/':
        this.serveDebugInterface(res);
        break;
      case '/translate':
        this.handleTranslate(req, res);
        break;
      case '/debug':
        this.handleDebug(req, res);
        break;
      default:
        res.writeHead(404);
        res.end('Not Found');
    }
  }

  serveDebugInterface(res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Pattern Analyzer - Debug Interface</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f6f8fa;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: 600; }
        input, textarea { 
            width: 100%; 
            padding: 10px; 
            border: 1px solid #d1d5da; 
            border-radius: 6px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        button { 
            background: #0366d6; 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 6px; 
            cursor: pointer;
            font-weight: 600;
        }
        button:hover { background: #0256cc; }
        .result { 
            background: #f6f8fa; 
            border: 1px solid #e1e4e8; 
            border-radius: 6px; 
            padding: 15px; 
            margin-top: 15px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        .error { color: #d73a49; }
        .success { color: #28a745; }
        .warning { color: #f66a0a; }
        .suggestion { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 10px; 
            border-radius: 4px; 
            margin: 5px 0;
        }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 GitHub Pattern Analyzer - Debug Interface</h1>
            <p>Translate minified errors and debug optimized builds</p>
        </div>

        <div class="grid">
            <div class="section">
                <h2>🔍 Error Translator</h2>
                <div class="form-group">
                    <label for="errorMessage">Error Message:</label>
                    <textarea id="errorMessage" rows="3" placeholder="Paste your error message here..."></textarea>
                </div>
                <button onclick="translateError()">Translate Error</button>
                <div id="translationResult"></div>
            </div>

            <div class="section">
                <h2>🐛 File Debugger</h2>
                <div class="form-group">
                    <label for="filePath">File Path:</label>
                    <input type="text" id="filePath" placeholder="./build/static/js/main.js">
                </div>
                <button onclick="debugFile()">Debug File</button>
                <div id="debugResult"></div>
            </div>
        </div>

        <div class="section">
            <h2>📊 Optimization Status</h2>
            <div id="optimizationStatus">Loading...</div>
        </div>
    </div>

    <script>
        async function translateError() {
            const errorMessage = document.getElementById('errorMessage').value;
            if (!errorMessage.trim()) {
                alert('Please enter an error message');
                return;
            }

            try {
                const response = await fetch('/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ errorMessage })
                });
                
                const result = await response.json();
                displayTranslationResult(result);
            } catch (error) {
                document.getElementById('translationResult').innerHTML = 
                    '<div class="result error">Translation failed: ' + error.message + '</div>';
            }
        }

        async function debugFile() {
            const filePath = document.getElementById('filePath').value;
            if (!filePath.trim()) {
                alert('Please enter a file path');
                return;
            }

            try {
                const response = await fetch('/debug', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filePath })
                });
                
                const result = await response.json();
                displayDebugResult(result);
            } catch (error) {
                document.getElementById('debugResult').innerHTML = 
                    '<div class="result error">Debug failed: ' + error.message + '</div>';
            }
        }

        function displayTranslationResult(result) {
            const html = 
                '<div class="result">' +
                    '<h4>Original Error:</h4>' +
                    '<div class="error">' + result.original + '</div>' +
                    '<h4>Translated Error:</h4>' +
                    '<div class="success">' + result.translated + '</div>' +
                    '<h4>Suggestions:</h4>' +
                    result.suggestions.map(s => '<div class="suggestion">' + s + '</div>').join('') +
                '</div>';
            document.getElementById('translationResult').innerHTML = html;
        }

        function displayDebugResult(result) {
            const html = 
                '<div class="result">' +
                    '<h4>Debug Results:</h4>' +
                    '<div class="' + (result.success ? 'success' : 'warning') + '">' +
                        result.message +
                    '</div>' +
                    (result.issues && result.issues.length > 0 ? 
                        '<h4>Issues Found:</h4>' + 
                        result.issues.map(issue => '<div class="warning">⚠️ ' + issue + '</div>').join('')
                        : ''
                    ) +
                    (result.mappings && result.mappings.length > 0 ? 
                        '<h4>Symbol Mappings:</h4>' + 
                        result.mappings.map(m => '<div>' + m + '</div>').join('')
                        : ''
                    ) +
                '</div>';
            document.getElementById('debugResult').innerHTML = html;
        }

        // Load optimization status on page load
        window.onload = function() {
            loadOptimizationStatus();
        };

        async function loadOptimizationStatus() {
            try {
                const response = await fetch('/status');
                if (response.ok) {
                    const status = await response.json();
                    document.getElementById('optimizationStatus').innerHTML = 
                        '<div class="result success">' +
                            '<h4>✅ Optimization Active</h4>' +
                            '<p>Strategy: ' + status.strategy + '</p>' +
                            '<p>Average Reduction: ' + status.averageReduction + '%</p>' +
                            '<p>Files Optimized: ' + status.files + '</p>' +
                        '</div>';
                } else {
                    document.getElementById('optimizationStatus').innerHTML = 
                        '<div class="result warning">⚠️ No optimization manifest found</div>';
                }
            } catch (error) {
                document.getElementById('optimizationStatus').innerHTML = 
                    '<div class="result error">❌ Could not load optimization status</div>';
            }
        }
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  handleTranslate(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { errorMessage } = JSON.parse(body);
        const result = this.translator.translate(errorMessage);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  }

  handleDebug(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { filePath } = JSON.parse(body);
        
        if (!fs.existsSync(filePath)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: `File not found: ${filePath}`,
            issues: [],
            mappings: []
          }));
          return;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];
        const mappings = [];

        // Check for common issues
        if (content.includes('undefined')) issues.push('Contains undefined references');
        if (content.includes('null')) issues.push('Contains null references');
        if (content.match(/\b[a-z]\d+\b/g)) issues.push('Contains minified variables');

        // Get symbol mappings
        if (this.translator.manifest && this.translator.manifest.symbolMappings) {
          Object.entries(this.translator.manifest.symbolMappings)
            .slice(0, 10)
            .forEach(([minified, original]) => {
              mappings.push(`${minified} → ${original}`);
            });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: issues.length === 0,
          message: issues.length === 0 ? 'No obvious issues detected' : `${issues.length} potential issues found`,
          issues,
          mappings
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  }
}

// CLI Interface
if (require.main === module) {
  const port = process.argv[2] ? parseInt(process.argv[2]) : 3001;
  const server = new DebugServer(port);
  server.start();
}

module.exports = DebugServer;
