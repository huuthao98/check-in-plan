import { Platform } from 'react-native';

// In development, Android emulator connects to host via 10.0.2.2.
// For physical devices, you can change this to your machine's LAN IP (e.g. 192.168.1.X)
export const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `http://${DEV_HOST}:3001/api`;

// AsyncStorage Keys
export const STORAGE_KEYS = {
  PLANS: 'locket_plans',
  CHECKINS: 'locket_CheckIns',
  TOKEN: 'locket_token',
  USER: 'locket_user',
  THEME: 'locket_theme',
};
