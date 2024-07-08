module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'standard',
    'eslint:recommended',
    'standard',
    'plugin:prettier/recommended',
  ],
  rules: {
    eqeqeq: ['off'],
    'prefer-const': ['off'],
    'arrow-body-style': 'off',
  },
};
