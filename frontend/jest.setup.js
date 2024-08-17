import 'react-native-gesture-handler/jestSetup';
import { NativeModules } from 'react-native';
import '@testing-library/jest-native/extend-expect';  
console.log('Jest Root Directory:', __dirname);
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('expo-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/FontAwesome5', () => 'Icon');
global.alert = jest.fn();
jest.mock('expo-linear-gradient', () => {
    const { View } = require('react-native');
    return {
      LinearGradient: View,
    };
  });

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 0, longitude: 0 } })),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(),
}));
NativeModules.ImagePicker = {
    launchImageLibraryAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
  };