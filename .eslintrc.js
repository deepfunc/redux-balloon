module.exports = {
  parser: '@typescript-eslint/parser',
  extends: 'standard-with-typescript',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: './tsconfig.eslint.json'
  },
  env: {
    browser: true,
    jest: true
  },
  rules: {
    semi: ['error', 'always'],
    'space-before-function-paren': 'off',
    'generator-star-spacing': ['error', 'after'],
    'operator-linebreak': [
      'error',
      'after',
      { overrides: { '?': 'before', ':': 'before' } }
    ],
    'quote-props': 'off',
    'no-prototype-builtins': 'off',
    '@typescript-eslint/space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false
        }
      }
    ],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/default-param-last': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/indent': 'off'
  }
};
