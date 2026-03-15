import { registerRootComponent } from 'expo';
import { decode, encode } from 'base-64';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'Android Push notifications (remote notifications) functionality',
  'was removed from Expo Go',
  'Use a development build instead of Expo Go',
  'read more at https://docs.expo.dev/develop/development-builds/introduction/'
]);

// Silent console.warn interceptor for terminal logs
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('expo-notifications: Android Push notifications') ||
    message.includes('removed from Expo Go') ||
    message.includes('Use a development build instead')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Polyfill atob and btoa for libraries that expect them to be globally available
if (!global.atob) {
  global.atob = decode;
}
if (!global.btoa) {
  global.btoa = encode;
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
