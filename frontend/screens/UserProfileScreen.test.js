import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import UserProfileScreen from './UserProfileScreen';


// Mocking axios
jest.mock('axios');

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
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [{ uri: 'file://test.jpg' }] }),
}));
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/document/directory/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  moveAsync: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => ({
  AntDesign: 'MockAntDesignIcon',
}));

describe('UserProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and display user details', async () => {
    // Mocking AsyncStorage to return a fake userId
    AsyncStorage.getItem.mockResolvedValue('1234');

    // Mocking axios to return user details
    axios.get.mockImplementation((url) => {
      if (url.includes('getUserDetails')) {
        return Promise.resolve({
          data: [{ name: 'Jane Doe', email: 'jane.doe@example.com' }],
        });
      } else if (url.includes('getProfileImage')) {
        return Promise.resolve({
          data: [{ image: 'profileImage.jpg' }],
        });
      }
    });

    const { getByText } = render(
      <NavigationContainer>
        <UserProfileScreen />
      </NavigationContainer>
    );

    // Waiting for the username and email to be fetched and displayed
    await waitFor(() => {
      expect(getByText('Jane Doe')).toBeTruthy();
      expect(getByText('jane.doe@example.com')).toBeTruthy();
    });
    
  }, 10000); // Setting timeout to 10 seconds
});
