import { ViewStyle } from 'react-native';

export { colors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  sm2: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
};

// Subtle card shadow for list items
export const cardShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

// Slightly stronger shadow for prominent cards
export const cardShadowMd: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};
