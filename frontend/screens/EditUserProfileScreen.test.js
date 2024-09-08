import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import EditUserProfileScreen from './EditUserProfileScreen';

// Mocking axios, AsyncStorage, and navigation
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

describe('EditUserProfileScreen', () => {
  beforeEach(() => {
  axios.get.mockResolvedValue({
    data: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    },
  });
});
  it('renders user profile form', async () => {
    render(
      <NavigationContainer>
        <EditUserProfileScreen />
      </NavigationContainer>
    );

    // Checking if the username and email fields are present
    expect(screen.getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(screen.getByText('Save Changes')).toBeTruthy();
  });

  it('shows an error message if the save operation fails due to missing fields', async () => {
  axios.post.mockRejectedValueOnce({
    response: {
      data: {
        success: false,
        message: 'All fields are required',
      },
    },
  });

  render(
    <NavigationContainer>
      <EditUserProfileScreen />
    </NavigationContainer>
  );

  // Updating only one field
  fireEvent.changeText(screen.getByPlaceholderText('Enter your username'), 'John Doe');

  // Checking if the button is present and press it
  const saveButton = screen.getByText('Save Changes');
  expect(saveButton).toBeTruthy();
  fireEvent.press(saveButton);

  // Waiting for the error alert to be shown
  await waitFor(() => {
    expect(screen.getByText('Error: Please fill in all fields')).toBeTruthy();
  });
});

  it('shows an error message if the user is not found', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      },
    });

    // Mocking the API response for saving user profile
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: 'User not found',
      },
    });

    render(
      <NavigationContainer>
        <EditUserProfileScreen />
      </NavigationContainer>
    );

    // Updating the username and email fields
    fireEvent.changeText(screen.getByPlaceholderText('Enter your username'), 'John Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your email'), 'john.doe@example.com');

    // Checking if the button is present and press it
    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).toBeTruthy();
    fireEvent.press(saveButton);

    // Waiting for the error alert to be shown
    await waitFor(() => {
      expect(screen.getByText('Error: User not found')).toBeTruthy();
    });
  });
});
