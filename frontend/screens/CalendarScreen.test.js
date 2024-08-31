import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import CalendarScreen from './CalendarScreen'; // Update the path
import { ThemeProvider,useTheme } from './ThemeContext'; // Update the path
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';

// Mock ThemeContext
jest.mock('./ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light', // or 'dark', depending on what you want to test
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Mock axios
jest.mock('axios');

// Mock react-native-calendars Calendar component
jest.mock('react-native-calendars', () => ({
    Calendar: () => null, // Simple mock that renders nothing
  }));

// Mock react-native-community datetimepicker DatetimePicker component
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

describe('CalendarScreen', () => {
  it('renders loading indicator while fetching data', async () => {
    AsyncStorage.getItem.mockResolvedValue('true'); // Simulate user logged in
    axios.get.mockResolvedValue({ data: [] }); // Simulate empty task data

    render(
        <NavigationContainer>
            <CalendarScreen />
        </NavigationContainer>
    );

    // Check if loading indicator is displayed
    expect(screen.getByTestId('loadingIndicator')).toBeTruthy();

    // Wait for loading to complete
    await waitFor(() => {
        expect(screen.getByTestId('loaded-calendar')).toBeTruthy();
      });
  });

  it('displays message when user is not logged in', async () => {
    AsyncStorage.getItem.mockResolvedValue('false'); // Simulate user not logged in

    render(
        <NavigationContainer>
            <CalendarScreen />
        </NavigationContainer>
    );

    // Wait for the component to render and check for the message
    await waitFor(() => {
      expect(screen.getByText('You need to be logged in to view your tasks.')).toBeTruthy();
    });
  });
});
