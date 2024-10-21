const webpack = require('webpack')

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    path: require.resolve('path-browserify'),
    fs: false,
    stream: require.resolve('stream-browserify'),
  }

  return config
}
