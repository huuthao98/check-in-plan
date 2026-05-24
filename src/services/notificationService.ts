import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler to show alerts while the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as any),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for local notification!');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

/**
 * Schedules a periodic check-in reminder for a specific plan.
 * @param planId Unique ID of the plan
 * @param planTitle Title of the plan (e.g., "Ăn uống")
 * @param intervalHours Time interval in hours (could be fraction like 0.016 for 1 min)
 */
export const schedulePlanReminder = async (
  planId: string,
  planTitle: string,
  intervalHours: number
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Convert hours to seconds
    let seconds = intervalHours * 3600;
    if (seconds < 10) {
      seconds = 10; // Minimum 10 seconds to avoid errors
    }

    // Cancel existing reminder for this plan first to avoid duplicate notifications
    await cancelPlanReminder(planId);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📸 Giờ check-in: ${planTitle}!`,
        body: `Đã đến giờ chụp ảnh chi tiêu cho kế hoạch "${planTitle}". Nhấn để check-in ngay.`,
        data: { planId, type: 'CheckIn_REMINDER' },
        sound: true,
      },
      trigger: {
        seconds: Math.round(seconds),
        repeats: true, // periodic reminder
      } as any,
    });

    console.log(`Scheduled notification for plan ${planId} (ID: ${notificationId}) repeating every ${seconds} seconds.`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Cancels all notifications matching a specific planId in their metadata.
 */
export const cancelPlanReminder = async (planId: string): Promise<void> => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data && notification.content.data.planId === planId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log(`Cancelled notification ${notification.identifier} for plan ${planId}`);
      }
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

/**
 * Cancels all scheduled notifications.
 */
export const cancelAllReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
