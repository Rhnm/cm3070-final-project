import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from './HomeScreen'; 
import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mocking implementations
jest.mock('axios');
jest.mock('expo-av');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-checkbox', () => 'CheckBox');
// Mocking implementation of useTheme
jest.mock('./ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#fff',
        text: '#000',
        primary: '#6200ee',
        accent: '#03dac4',
      },
    },
  }),
}));
// Mocking @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const mockComponent = ({ name, ...rest }) => {
    return <div {...rest}>Icon: {name}</div>;
  };

  return {
    Ionicons: mockComponent,
    MaterialIcons: mockComponent,
    FontAwesome: mockComponent,
    FontAwesome5: mockComponent,
  };
});
// Mocking expo-file-system
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(() => Promise.resolve('mock file content')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, isDirectory: false, size: 1234 })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  documentDirectory: '/mock/document/directory/',
  cacheDirectory: '/mock/cache/directory/',
}));

// Mocking react-native-community datetimepicker DatetimePicker component
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

describe('HomeScreen', () => {
  test('renders correctly and fetches tasks', async () => {

    // Rendering the component
    render(
      <NavigationContainer>
    <HomeScreen />
    </NavigationContainer>
  );
    expect(screen.getByText('All tasks completed!')).toBeTruthy();

    fireEvent.press(screen.getByTestId('weatherInfo'));
    expect(screen.getByText('Close')).toBeTruthy();
  });
  
});
