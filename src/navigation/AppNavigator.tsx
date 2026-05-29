import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootState } from '../store';
import HomeScreen from '@/screens/HomeScreen';
import PlansScreen from '@/screens/PlansScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import SpendingsScreen from '@/screens/SpendingsScreen';
import CheckInDetailsScreen from '@/screens/CheckInDetailsScreen';
import { useTheme } from '@/shared/theme/useTheme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#1a1d20',
    border: '#e9ecef',
  },
};

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0c0f14',
    card: '#1b1f28',
    text: '#ffffff',
    border: '#1e222b',
  },
};

function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'camera';

          if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Plans') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Spendings') {
            iconName = focused ? 'images' : 'images-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderDark,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Camera" component={HomeScreen} options={{ tabBarLabel: 'Máy Ảnh' }} />
      <Tab.Screen name="Plans" component={PlansScreen} options={{ tabBarLabel: 'Kế Hoạch' }} />
      <Tab.Screen
        name="Spendings"
        component={SpendingsScreen}
        options={{ tabBarLabel: 'Nhật Ký' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const token = useSelector((state: RootState) => state.auth.token);
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer theme={isDark ? MyDarkTheme : MyLightTheme}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token === null ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main Stack
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="CheckInDetails"
              component={CheckInDetailsScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
