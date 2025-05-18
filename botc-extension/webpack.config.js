const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.js',
    popup: './src/popup/popup.js',
    // Add other entries as needed (e.g., content scripts)
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  // No Node.js polyfills needed for Chrome extension environment
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: false // For easier debugging in development
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        // Include only files that exist
        { from: 'src/popup/accountTab.js', to: 'popup/accountTab.js' },
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'src/popup/popup.css', to: 'popup.css' },
        { from: 'src/auth/auth.html', to: 'auth/auth.html' },
        { from: 'src/icons', to: 'icons' }
      ],
    }),
  ],
};
