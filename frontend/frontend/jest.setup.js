import 'react-native-gesture-handler/jestSetup';
import { NativeModules } from 'react-native';
import '@testing-library/jest-native/extend-expect';  
console.log('Jest Root Directory:', __dirname);

jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('expo-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/FontAwesome5', () => 'Icon');
global.alert = jest.fn();
global.setImmediate = (callback) => setTimeout(callback, 0);
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn(),
      unloadAsync: jest.fn(),
      setIsMutedAsync: jest.fn(),
      setVolumeAsync: jest.fn(),
      playAsync: jest.fn(),
      stopAsync: jest.fn(),
      getStatusAsync: jest.fn().mockResolvedValue({
        isLoaded: true,
        isPlaying: false,
        positionMillis: 0,
        durationMillis: 10000,
      }),
    })),
    InterruptionModeIOS: {
      DO_NOT_MIX: 'DO_NOT_MIX',
      MIX_WITH_OTHERS: 'MIX_WITH_OTHERS',
      DO_NOT_DISTURB: 'DO_NOT_DISTURB',
    },
    InterruptionModeAndroid: {
      DO_NOT_MIX: 'DO_NOT_MIX',
      MIX_WITH_OTHERS: 'MIX_WITH_OTHERS',
    },
    AudioMode: {
      setAudioModeAsync: jest.fn(),
    },
    AudioSource: {
      DEFAULT: 'DEFAULT',
    },
    AudioBackgroundMode: {
      NOT_PLAYING: 'NOT_PLAYING',
      PLAYING: 'PLAYING',
    },
  },
}));

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

// Mock the necessary NativeModules
NativeModules.SettingsManager = NativeModules.SettingsManager || {
  settings: {
    AppleInterfaceStyle: 'light', // or 'dark' to simulate dark mode
  },
  getConstants: () => ({
    AppleInterfaceStyle: 'light',
  }),
};