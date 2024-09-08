import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import CalendarScreen from './CalendarScreen'; 
import { ThemeProvider,useTheme } from './ThemeContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';

// Mocking ThemeContext
jest.mock('./ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light', 
  }),
}));

// Mocking AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Mocking axios
jest.mock('axios');
jest.mock('@expo/vector-icons', () => ({
  FontAwesome5: 'FontAwesome5',
  MaterialIcons: 'MaterialIcons',
}));

// Mocking react-native-calendars Calendar component
jest.mock('react-native-calendars', () => ({
    Calendar: () => null, // Simple mock that renders nothing
  }));

// Mocking react-native-community datetimepicker DatetimePicker component
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

describe('CalendarScreen', () => {
  it('renders loading indicator while fetching data', async () => {
    AsyncStorage.getItem.mockResolvedValue('true'); // Simulating user logged in
    axios.get.mockResolvedValue({ data: [] }); // Simulating empty task data

    render(
        <NavigationContainer>
            <CalendarScreen />
        </NavigationContainer>
    );

    // Checking if loading indicator is displayed
    expect(screen.getByTestId('loadingIndicator')).toBeTruthy();

    // Waiting for loading to complete
    await waitFor(() => {
        expect(screen.getByTestId('loaded-calendar')).toBeTruthy();
      });
  });

  it('displays message when user is not logged in', async () => {
    AsyncStorage.getItem.mockResolvedValue('false'); // Simulating user not logged in

    render(
        <NavigationContainer>
            <CalendarScreen />
        </NavigationContainer>
    );

    // Waiting for the component to render and check for the message
    await waitFor(() => {
      expect(screen.getByText('You need to be logged in to view your tasks.')).toBeTruthy();
    });
  });
});
