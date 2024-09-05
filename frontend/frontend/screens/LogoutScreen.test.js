import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LogoutScreen from './LogoutScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useTheme } from './ThemeContext';

// Mocking useTheme
jest.mock('./ThemeContext', () => ({
  useTheme: jest.fn(),
}));

// Mocking AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn().mockResolvedValue(),
}));

// Mocking Alert
jest.spyOn(Alert, 'alert');

describe('LogoutScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useTheme.mockReturnValue({ theme: 'light' });
  });

  test('renders correctly with light theme', () => {
    const { getByText } = render(
      <LogoutScreen navigation={mockNavigation} onLogout={mockOnLogout} />
    );
    const button = getByText('Logging out...');
    expect(button).toBeTruthy();
  });

  test('calls AsyncStorage.removeItem and navigates to Login on logout', async () => {
    const { getByText } = render(
      <LogoutScreen navigation={mockNavigation} onLogout={mockOnLogout} />
    );
    const button = getByText('Logging out...');

    fireEvent.press(button);

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('isLoggedIn');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('uid');
      expect(mockOnLogout).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  test('shows alert on logout error', async () => {
    AsyncStorage.removeItem.mockRejectedValueOnce(new Error('Error'));
    const { getByText } = render(
      <LogoutScreen navigation={mockNavigation} onLogout={mockOnLogout} />
    );
    const button = getByText('Logging out...');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Logout Error', 'Failed to log out. Please try again.');
    });
  });
});
