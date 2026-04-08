import { Alert } from 'react-native';

// Empty placeholder - no actual notification code
export async function registerForPushNotificationsAsync() {
  console.log('Push notifications disabled for Expo Go');
  return null;
}

export async function sendTokenToBackend(token: string) {
  return true;
}

export async function sendTestNotification() {
  Alert.alert(
    'Notifications Unavailable',
    'Push notifications require a development build.\n\nTo enable notifications, run:\neas build --platform android --profile development'
  );
}