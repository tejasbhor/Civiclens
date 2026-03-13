import { registerRootComponent } from 'expo';
import { decode, encode } from 'base-64';

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
