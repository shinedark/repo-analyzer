#!/usr/bin/env node

/**
 * Error Translator for Computer-Optimized Builds
 * Translates minified errors back to human-readable format
 */

const fs = require('fs');
const path = require('path');

class ErrorTranslator {
  constructor(manifestPath = './optimized-build/optimization-manifest.json') {
    this.manifestPath = manifestPath;
    this.manifest = null;
    this.loadManifest();
  }

  loadManifest() {
    try {
      if (fs.existsSync(this.manifestPath)) {
        this.manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load optimization manifest:', error.message);
    }
  }

  translate(errorMessage) {
    if (!this.manifest || !this.manifest.symbolMappings) {
      return {
        original: errorMessage,
        translated: errorMessage,
        suggestions: ['Optimization manifest not found']
      };
    }

    let translated = errorMessage;
    const suggestions = [];

    // Translate symbol mappings
    if (this.manifest && this.manifest.symbolMappings) {
      Object.entries(this.manifest.symbolMappings).forEach(([minified, original]) => {
      if (translated.includes(minified)) {
        // Escape special regex characters in the minified string
        const escapedMinified = minified.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        try {
          translated = translated.replace(new RegExp(escapedMinified, 'g'), original);
          suggestions.push(`${minified} → ${original}`);
        } catch (error) {
          console.warn(`Failed to replace ${minified}: ${error.message}`);
          // Fallback to simple string replacement
          translated = translated.split(minified).join(original);
          suggestions.push(`${minified} → ${original} (fallback)`);
        }
      }
    });
    }

    // Add common error suggestions
    if (translated.includes('is not defined')) {
      suggestions.push('Check if variable is properly imported or declared');
    }
    if (translated.includes('Cannot read property')) {
      suggestions.push('Object may be null or undefined');
    }
    if (translated.includes('is not a function')) {
      suggestions.push('Check if method exists on the object');
    }

    return {
      original: errorMessage,
      translated,
      suggestions: suggestions.length > 0 ? suggestions : ['No specific suggestions available']
    };
  }

  debug(filePath) {
    console.log(`🔍 Debugging: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for common issues
    const issues = [];
    
    if (content.includes('undefined')) {
      issues.push('Contains undefined references');
    }
    if (content.includes('null')) {
      issues.push('Contains null references');
    }
    if (content.match(/\b[a-z]\d+\b/g)) {
      issues.push('Contains minified variables');
    }

    if (issues.length > 0) {
      console.log('⚠️  Potential issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ No obvious issues detected');
    }

    // Show symbol mappings if available
    if (this.manifest && this.manifest.symbolMappings) {
      console.log('\n📋 Available symbol mappings:');
      Object.entries(this.manifest.symbolMappings)
        .slice(0, 10)
        .forEach(([minified, original]) => {
          console.log(`   ${minified} → ${original}`);
        });
      
      if (Object.keys(this.manifest.symbolMappings).length > 10) {
        console.log(`   ... and ${Object.keys(this.manifest.symbolMappings).length - 10} more`);
      }
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const translator = new ErrorTranslator();

  switch (command) {
    case 'translate':
      const errorMessage = args[1];
      if (!errorMessage) {
        console.error('Usage: node error-translator.js translate "error message"');
        process.exit(1);
      }
      
      const result = translator.translate(errorMessage);
      console.log('🔍 Error Translation:');
      console.log(`Original:   ${result.original}`);
      console.log(`Translated: ${result.translated}`);
      console.log('💡 Suggestions:');
      result.suggestions.forEach(suggestion => console.log(`   - ${suggestion}`));
      break;

    case 'debug':
      const filePath = args[1];
      if (!filePath) {
        console.error('Usage: node error-translator.js debug <file-path>');
        process.exit(1);
      }
      translator.debug(filePath);
      break;

    default:
      console.log('🔧 Error Translator for GitHub Pattern Analyzer');
      console.log('');
      console.log('Usage:');
      console.log('  node error-translator.js translate "error message"');
      console.log('  node error-translator.js debug <file-path>');
      console.log('');
      console.log('Examples:');
      console.log('  node error-translator.js translate "x3 is not defined"');
      console.log('  node error-translator.js debug ./build/static/js/main.js');
      break;
  }
}

module.exports = ErrorTranslator;
