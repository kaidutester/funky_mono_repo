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
  // danger: '#E63946',
  // success: '#7CE7AC', 
  // warn: '#F4BE5E',
  blue: '#2f64d7',
  purple: '#9698D6',
  white: '#FFFFFF',
};

const FONTS = ['sans-serif', 'Roboto'];

export const lightTheme: DefaultTheme = {
  name: 'light',
  colors: {
    // primary: '#F6F6F6',
    primary: '#FFF', 
    secondary: '#5E81F4',
    tertiary: '#1C1D21',
    fourth: '#8181A5',
    fifth: '#2481cc',
    success: '#0FA958',
    danger: '#E63946',
    warn: '#F4BE5E',
    ...base,
  },
  fonts: FONTS,
  fontSizes: {
    small: '1em',
    medium: '2em',
    large: '3em',
  },
};

const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    // primary: '#1C1D21',
    primary: '#0D0D0D',
    secondary: '#5E81F4',
    tertiary: '#F6F6F6',
    fourth: '#8181A5',
    fifth: '#F5F5FA', //F5F5FA
    backgroundLight: '#F5F5FA',
    buttonHover: '#475EAA',
    success: '#11C063',
    danger: '#E9505C',
    warn: '#F6C776',
    ...base,
  },
  fonts: FONTS,
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
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ThemeProvider
      theme={isDarkMode ? darkTheme : lightTheme}
    >
      {children}
    </ThemeProvider>
  );
}
