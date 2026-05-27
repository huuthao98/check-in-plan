import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootState } from '../store';
import HomeScreen from '@/screens/HomeScreen';
import PlansScreen from '@/screens/PlansScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import SpendingsScreen from '@/screens/SpendingsScreen';
import CheckInDetailsScreen from '@/screens/CheckInDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
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
        tabBarActiveTintColor: '#ff9f43', // Premium orange accent
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1b1f28',
          borderTopColor: '#2d323f',
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

  return (
    <NavigationContainer>
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
