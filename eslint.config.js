const js = require('@eslint/js')
const globals = require('globals')
const prettierRecommended = require('eslint-plugin-prettier/recommended')

module.exports = [
  js.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          semi: false,
          singleQuote: true,
          trailingComma: 'es5',
          bracketSpacing: true,
          arrowParens: 'always',
        },
      ],
      'no-console': 'off',
      'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
      'no-var': 'error',
    },
  },
]
