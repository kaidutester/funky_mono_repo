import React from 'react';
import { DefaultTheme, ThemeProvider } from 'styled-components';
import { useColorScheme } from 'react-native';

const base = {
  grayscale: [
    '#212121',
    '#414141',
    '#616161',
    '#9e9e9e',
    '#bdbdbd',
    '#e0e0e0',
    '#eeeeee',
    '#ffffff',
  ],
  error: '#FF808B',
  danger: '#E63946',
  success: '#7CE7AC',
  warn: '#F4BE5E',
  blue: '#2f64d7',
  purple: '#9698D6',
  white: '#FFFFFF',
};

export const theme: DefaultTheme = {
  colors: {
    primary: '#F6F6F6',
    secondary: '#5E81F4',
    tertiary: '#1C1D21',
    fourth: '#8181A5',
    fifth: '#2481cc',
    ...base,
  },
  fonts: ['sans-serif', 'Roboto'],
  fontSizes: {
    small: '1em',
    medium: '2em',
    large: '3em',
  },
};

const darkTheme: DefaultTheme = {
  colors: {
    primary: '#1C1D21',
    secondary: '#5E81F4',
    tertiary: '#F6F6F6',
    fourth: '#8181A5',
    fifth: '#F5F5FA', //F5F5FA
    backgroundLight: '#F5F5FA',
    buttonHover: '#475EAA',
    ...base,
  },
  fonts: ['sans-serif', 'Roboto'],
  fontSizes: {
    small: '1em',
    medium: '2em',
    large: '3em',
  },
};

/**
 * Theme provider
 */
export function Theme({ children, ...optionals }) {
  // const isDarkMode = true;
  const isDarkMode = useColorScheme() === 'dark';


  return (
    <ThemeProvider
      theme={isDarkMode ? darkTheme : theme}
    >
      {children}
    </ThemeProvider>
  );
}
