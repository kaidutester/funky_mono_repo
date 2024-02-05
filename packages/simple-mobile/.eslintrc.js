module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    skipBlankLines: true,
  },
  // parser: 'babel-eslint',
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
  },
  plugins: ['prettier'],
};
