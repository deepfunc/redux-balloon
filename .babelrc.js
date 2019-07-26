const { BABEL_ENV, NODE_ENV } = process.env;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        modules: BABEL_ENV === 'commonjs' ? 'cjs' : false,
        loose: true,
        targets: NODE_ENV === 'test' ? { node: 'current' } : {}
      }
    ]
  ],
  plugins: [
    // don't use `loose` mode here - need to copy symbols when spreading
    '@babel/proposal-object-rest-spread',
    NODE_ENV === 'test' && '@babel/transform-modules-commonjs'
  ].filter(Boolean)
};
