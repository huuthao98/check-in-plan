import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { hydratePlans } from './src/store/plansSlice';
import { hydrateCheckIns } from './src/store/checkInsSlice';
import { hydrateAuth } from './src/store/authSlice';
import { setAuthToken } from './src/services/api';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermissions } from './src/services/notificationService';
import { STORAGE_KEYS } from './src/shared/constants';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // 1. Request notification permissions
        await requestNotificationPermissions();

        // 2. Load stored plans, CheckIns, and Auth from AsyncStorage
        const storedPlans = await AsyncStorage.getItem(STORAGE_KEYS.PLANS);
        const storedCheckIns = await AsyncStorage.getItem(STORAGE_KEYS.CHECKINS);
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

        if (storedPlans) {
          store.dispatch(hydratePlans(JSON.parse(storedPlans)));
        }
        if (storedCheckIns) {
          store.dispatch(hydrateCheckIns(JSON.parse(storedCheckIns)));
        }
        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          store.dispatch(hydrateAuth({
            token: storedToken,
            user: JSON.parse(storedUser)
          }));
        }
      } catch (e) {
        console.warn('Error loading persisted state:', e);
      } finally {
        setIsReady(true);
      }
    }

    prepareApp();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0c0f14" />
        <Text style={styles.logoText}>Locket Plan</Text>
        <ActivityIndicator size="large" color="#ff9f43" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0c0f14" />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0c0f14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});
