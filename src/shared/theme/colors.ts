export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Theme layout colors
  background: string;
  surface: string;
  primary: string;
  border: string;
  borderDark: string;
  borderLight: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Text colors
  text: string; // normal readable text
  textSecondary: string; // secondary text/grey
  textLight: string; // force light color (e.g. for dark backgrounds or primary buttons)
  textGrey: string;
  textMuted: string;
  textDark: string;
  textRed: string;
  
  // Additional utilities
  overlay: string;
  overlayDark: string;
  card: string;
  inputBackground: string;
}

export const lightTheme: ThemeColors = {
  background: '#f8f9fa',
  surface: '#ffffff',
  primary: '#ff9f43',
  border: '#e9ecef',
  borderDark: '#dee2e6',
  borderLight: '#ced4da',
  
  success: '#28a745',
  warning: '#ff9800',
  error: '#B31B25',
  info: '#005EA0',

  text: '#1a1d20',
  textSecondary: '#495057',
  textLight: '#ffffff',
  textGrey: '#888888',
  textMuted: '#6c757d',
  textDark: '#212121',
  textRed: '#ff4d4d',
  
  overlay: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.6)',
  card: '#ffffff',
  inputBackground: '#f1f3f5',
};

export const darkTheme: ThemeColors = {
  background: '#0c0f14',
  surface: '#1b1f28',
  primary: '#ff9f43',
  border: '#1e222b',
  borderDark: '#2d323f',
  borderLight: '#3a4051',
  
  success: '#4caf50',
  warning: '#ff9800',
  error: '#B31B25',
  info: '#005EA0',

  text: '#ffffff',
  textSecondary: '#aaa',
  textLight: '#ffffff',
  textGrey: '#888888',
  textMuted: '#666666',
  textDark: '#212121',
  textRed: '#ff4d4d',
  
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayDark: 'rgba(0, 0, 0, 0.85)',
  card: '#1b1f28',
  inputBackground: '#2d323f',
};

// For backwards compatibility before screens are fully migrated
export const colors = darkTheme;
