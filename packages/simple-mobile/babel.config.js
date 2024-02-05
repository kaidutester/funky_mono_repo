module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    "react-native-reanimated/plugin",
    [
      "module-resolver",
      {
        extensions: [
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.android.js',
          '.android.tsx',
          '.ios.js',
          '.ios.tsx'
        ],
        // root: ['./src'],
        // alias: {
        //   '@components': './components',
        //   '~': './'
        // },
      }
    ],
    "module:react-native-dotenv",
    // [
    //   "react-native-wifi-reborn",
    //   {
    //     "fineLocationPermission": true
    //   }
    // ]
  ],
};
