// eslint-disable-next-line no-undef
module.exports = {
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: 'entry',
        corejs: 3,
        exclude: ['transform-typeof-symbol'],
      },
    ],
    '@babel/typescript',
    [
      '@babel/react',
      {
        runtime: 'automatic',
      },
    ],
  ],
  plugins: [
    '@babel/proposal-class-properties',
    [
      '@babel/transform-runtime',
      {
        corejs: false,
        regenerator: true,
      },
    ],
  ],
};
