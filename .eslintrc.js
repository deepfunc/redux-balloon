module.exports = {
  extends: 'standard',
  env: {
    browser: true,
    jest: true
  },
  rules: {
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    'generator-star-spacing': ['error', 'after']
  }
};
