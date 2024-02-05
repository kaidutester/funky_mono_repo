import React from 'react';
import { useTheme } from '@kaidu/shared/lib/styles';
import Svg, { Path } from 'react-native-svg';

export function DocShieldIcon({ size = 42, ...optionals }) {
  const theme = useTheme();
  return (
    <Svg
      viewBox="0 0 153 136"
      width={size}
      height={(size / 144) * 128}
      fill={theme.colors.secondary}
      // transform="translate(14 0)"
      style={{ marginRight: -4, marginLeft: 4 }}
      {...optionals}>
      <Path d="M0 16C0 7.175 7.175 0 16 0h40v32c0 4.425 3.575 8 8 8h32v11.75l-23.2 9.275c-5.325 2.125 -8.8 7.275 -8.8 13 0 14.15 4.725 37 23.55 52.075 -2.25 1.2 -4.825 1.9 -7.55 1.9H16c-8.825 0 -16 -7.175 -16 -16V16zm96 16H64V0l32 32zm9.775 24.425c1.425 -0.575 3.025 -0.575 4.45 0l30 12c2.275 0.925 3.775 3.125 3.775 5.575 0 15.825 -6.475 42.2 -33.7 53.55 -1.475 0.625 -3.15 0.625 -4.625 0C78.475 116.2 72 89.825 72 74c0 -2.45 1.5 -4.65 3.775 -5.575l30 -12zM131.85 78 108 68.45v46.975c17.05 -8.25 22.875 -24.75 23.85 -37.425z" />
    </Svg>
  );
}
