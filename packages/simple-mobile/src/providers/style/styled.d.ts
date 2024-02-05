import 'styled-components';

interface IColorsPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  fourth: string;
  fifth: string;
  error: string;
  success: string;
  warn: string;
  grayscale: string[];
  [x: string]: any;
}

type IFontSizes = {
  small: string;
  medium: string;
  large: string;
};

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: IColorsPalette;
    fonts: string[];
    fontSizes: IFontSizes;
    name?: string;
  }
}
