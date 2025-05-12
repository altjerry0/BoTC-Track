const path = require('path');

module.exports = {
  mode: 'development', // Use 'production' for releases
  entry: './botc-extension/src/background.js', // Corrected path
  output: {
    path: path.resolve(__dirname, 'botc-extension/dist'),
    filename: 'background.bundle.js',
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
