const path = require('path');

module.exports = {
  mode: 'development', // Use 'production' for releases
  entry: {
    background: './botc-extension/src/background.js',
    popup: './botc-extension/src/popup/popup.js'
  },
  output: {
    filename: '[name].bundle.js', // Generates background.bundle.js and popup.bundle.js
    path: path.resolve(__dirname, 'botc-extension/dist'),
    clean: true, // Clean the output directory before emit.
  },
  // Optional: Add resolve fallbacks if needed by dependencies, less common now
  // resolve: {
  //   fallback: {
  //     "path": require.resolve("path-browserify"),
  //     "os": require.resolve("os-browserify/browser"),
  //     "crypto": require.resolve("crypto-browserify")
  //     // Add other fallbacks as needed if you encounter errors
  //   }
  // },
  devtool: 'cheap-module-source-map', // Helps with debugging bundled code
};
