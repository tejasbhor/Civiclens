import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, LogBox } from 'react-native';
import { userApi } from '../api/userApi';

// Suppress the Expo Go SDK 53 warning about remote push notifications. 
// Remote push won't work in the Go app, but local functions and badges still do.
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const pushNotificationService = {
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }
      // Usually project ID is fetched from Constants, but we can rely on standard token generation
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log('Expo Push Token generated:', token);

        // Register token with our backend
        try {
          await userApi.registerDeviceToken(token);
          console.log('Push token successfully registered with backend');
        } catch (apiError) {
          console.error('Failed to register push token with backend:', apiError);
        }
      } catch (e: any) {
        console.error('Error generating Expo Push Token:', e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  },

  addNotificationReceivedListener(callback: (event: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  addNotificationResponseReceivedListener(
    callback: (event: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  removeNotificationSubscription(subscription: Notifications.EventSubscription) {
    subscription.remove();
  },

  async unregisterFromBackend() {
    try {
      // Clear token on the backend by sending an empty string or null
      // The backend update_device_token endpoint expects a string
      await userApi.registerDeviceToken('');
      console.log('Push token successfully unregistered from backend');
    } catch (error) {
      console.error('Failed to unregister push token from backend:', error);
      throw error;
    }
  },
};
