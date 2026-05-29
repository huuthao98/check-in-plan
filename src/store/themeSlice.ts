import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode } from '../shared/theme/colors';

interface ThemeState {
  themeMode: ThemeMode;
}

const initialState: ThemeState = {
  themeMode: 'dark', // App is dark by default
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
    hydrateTheme: (state, action: PayloadAction<ThemeMode>) => {
      if (action.payload) {
        state.themeMode = action.payload;
      }
    },
  },
});

export const { setThemeMode, hydrateTheme } = themeSlice.actions;
export default themeSlice.reducer;
