import React from 'react';
import { ThemeProvider } from 'styled-components/native';
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
  blue: '#2f64d7',
  purple: '#9698D6',
  white: '#FFFFFF',
};

export const theme = {
  colors: {
    primary: '#f5f5f5',
    secondary: '#eeeeee',
    tertiary: '#101010',
    fourth: '#919191',
    fifth: '#2481cc',
    ...base,
    error: '#B00020',
    success: '#4BB543',
    blue: '#155fff',
  },
  fonts: ['sans-serif', 'Roboto'],
  fontSizes: {
    small: '1em',
    medium: '2em',
    large: '3em',
  },
};

const darkTheme = {
  colors: {
    primary: '#101010',
    secondary: '#2a2a2a',
    tertiary: '#f5f5f5',
    fourth: '#919191',
    fifth: '#173F5F',
    ...base,
    error: '#ff002f',
    success: '#4BB543',
    blue: '#2f64d7',
  },
  fonts: ['sans-serif', 'Roboto'],
  fontSizes: {
    small: '1em',
    medium: '2em',
    large: '3em',
  },
};

export function Theme({ children }) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ThemeProvider
      theme={isDarkMode ? darkTheme : theme}
      isDarkMode={isDarkMode}>
      {children}
    </ThemeProvider>
  );
}
