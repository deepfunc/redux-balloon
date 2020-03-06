module.exports = {
  parser: '@typescript-eslint/parser',
  extends: 'standard-with-typescript',
  plugins: [
    '@typescript-eslint',
  ],
  'parserOptions': {
    'project': './tsconfig.eslint.json'
  },
  env: {
    browser: true,
    jest: true
  },
  rules: {
    'semi': ['error', 'always'],
    '@typescript-eslint/space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    '@typescript-eslint/member-delimiter-style': ['error', {
      'multiline': {
        'delimiter': 'semi',
        'requireLast': true
      },
      'singleline': {
          'delimiter': 'semi',
          'requireLast': true
        }
    }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    'generator-star-spacing': ['error', 'after'],
    'operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }]
  }
};
