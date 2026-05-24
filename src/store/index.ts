import { configureStore } from '@reduxjs/toolkit';
import plansReducer from './plansSlice';
import CheckInsReducer from './checkinsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const store = configureStore({
  reducer: {
    plans: plansReducer,
    CheckIns: CheckInsReducer,
  },
});

// Subscribe to store changes to save state to AsyncStorage
store.subscribe(async () => {
  try {
    const state = store.getState();
    await AsyncStorage.setItem('locket_plans', JSON.stringify(state.plans.plans));
    await AsyncStorage.setItem('locket_CheckIns', JSON.stringify(state.CheckIns.CheckIns));
  } catch (e) {
    console.error('Error saving state to AsyncStorage', e);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
