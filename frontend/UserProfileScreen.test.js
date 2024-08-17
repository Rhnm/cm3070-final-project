import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import UserProfileScreen from './screens/UserProfileScreen'; // Adjust path as necessary
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';

// Mocking necessary modules
jest.mock('axios');
jest.mock('expo-image-picker');
jest.mock('expo-file-system');
jest.mock('@react-native-async-storage/async-storage');

describe('UserProfileScreen', () => {
  const mockNavigation = { navigate: jest.fn() };
  const mockUserId = '12345';
  
  beforeEach(() => {
    AsyncStorage.getItem.mockResolvedValue(mockUserId);
    axios.get.mockImplementation(url => {
      if (url.includes('/getUserDetails/')) {
        return Promise.resolve({ data: [{ name: 'John Doe', email: 'john.doe@example.com' }] });
      } else if (url.includes('/getProfileImage/')) {
        return Promise.resolve({ data: [{ image: 'profile.jpg' }] });
      }
    });
    FileSystem.getInfoAsync.mockResolvedValue({ exists: true });
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }]
    });
    FileSystem.moveAsync.mockResolvedValue();
  });

  test('renders user profile details correctly', async () => {
    render(<UserProfileScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('john.doe@example.com')).toBeTruthy();
    });
  });

  test('handles image upload', async () => {
    render(<UserProfileScreen navigation={mockNavigation} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.press(editButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`${baseURL}:3001/resources/saveProfileImage`, { imageName: 'test-image.jpg', userId: mockUserId });
    });
  });

  test('handles refreshing data', async () => {
    render(<UserProfileScreen navigation={mockNavigation} />);

    const refreshControl = screen.getByRole('button', { name: /refresh/i });
    fireEvent.refresh(refreshControl);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${baseURL}:3001/resources/getUserDetails/${mockUserId}`);
      expect(axios.get).toHaveBeenCalledWith(`${baseURL}:3001/resources/getProfileImage/${mockUserId}`);
    });
  });
});
