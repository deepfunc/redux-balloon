module.exports = {
  extends: 'standard',
  rules: {
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    'object-curly-spacing': 0,
    'generator-star-spacing': ['error', 'after']
  }
};
