// @ts-check

import globals from 'globals';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022, // or latest like 'latest'
      sourceType: 'commonjs', // or 'module' if you switch
      globals: {
        ...globals.node, // All Node.js globals
        // Add any other specific globals your project uses if not covered by globals.node
      },
    },
    rules: {
      // You can add or override rules here
      // e.g., 'no-console': 'off', // to allow console.log statements
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // Warn on unused vars, ignore if prefixed with _
    },
    ignores: [
      'node_modules/',
      '.firebase/',
      'firebase-debug.log',
      'public/', // If public contains static assets not to be linted
      'auth-service/' // Assuming this is a sub-project or generated code not to be linted
    ]
  }
];
