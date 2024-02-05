import 'react-native-gesture-handler';
import React from 'react';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { NAME } from './src/lib/constants';
import Symbol from 'es6-symbol';

AppRegistry.registerComponent(NAME, () => App);
