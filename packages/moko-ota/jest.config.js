module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-cookies|@react-native|react-native-ble-plx|react-native-elements|react-native-circular-progress|react-native-size-matters|react-native-ratings)/)',
  ],//these folders in node_modules will not be ignored
};
