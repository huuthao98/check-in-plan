import { Platform } from 'react-native';

// Dùng IP vật lý của máy tính chạy backend để chạy được trên cả simulator lẫn thiết bị thật trong mạng LAN
export const DEV_HOST = '192.168.1.39';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${DEV_HOST}:3001/api`;

// AsyncStorage Keys
export const STORAGE_KEYS = {
  PLANS: 'locket_plans',
  CHECKINS: 'locket_CheckIns',
  TOKEN: 'locket_token',
  USER: 'locket_user',
  THEME: 'locket_theme',
};
