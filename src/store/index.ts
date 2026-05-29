import { configureStore } from '@reduxjs/toolkit';
import plansReducer from './plansSlice';
import CheckInsReducer from './checkInsSlice';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../shared/constants';

export const store = configureStore({
  reducer: {
    plans: plansReducer,
    CheckIns: CheckInsReducer,
    auth: authReducer,
    theme: themeReducer,
  },
});

// Subscribe to store changes to save state to AsyncStorage
store.subscribe(async () => {
  try {
    const state = store.getState();
    await AsyncStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(state.plans.plans));
    await AsyncStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(state.CheckIns.CheckIns));
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, state.theme.themeMode);
    
    if (state.auth.token) {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, state.auth.token);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
    
    if (state.auth.user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.auth.user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (e) {
    console.error('Error saving state to AsyncStorage', e);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

