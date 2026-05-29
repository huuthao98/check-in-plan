import { useColorScheme } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setThemeMode } from '../../store/themeSlice';
import { lightTheme, darkTheme, ThemeColors, ThemeMode } from './colors';

export function useTheme() {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.themeMode) as ThemeMode;
  const systemColorScheme = useColorScheme();

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? darkTheme : lightTheme;

  const changeThemeMode = (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
  };

  return {
    colors,
    themeMode,
    isDark,
    setThemeMode: changeThemeMode,
  };
}

export function useStyles<T>(createStyles: (colors: ThemeColors) => T): T {
  const { colors } = useTheme();
  return createStyles(colors);
}
