// HomeScreen.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from './HomeScreen'; // Adjust the import according to your file structure
import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock implementations
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-checkbox', () => 'CheckBox');
// Mock implementation of useTheme
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
// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const mockComponent = ({ name, ...rest }) => {
    return <div {...rest}>Icon: {name}</div>;
  };

  return {
    Ionicons: mockComponent,
    // Add other icons if needed
    MaterialIcons: mockComponent,
    FontAwesome: mockComponent,
    FontAwesome5: mockComponent,
    // Add any other icons or components used in your tests
  };
});
// Mock expo-file-system
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

// Mock react-native-community datetimepicker DatetimePicker component
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

describe('HomeScreen', () => {
  test('renders correctly and fetches tasks', async () => {

    // Render the component
    render(
      <NavigationContainer>
    <HomeScreen />
    </NavigationContainer>
  );

    // Check for elements, e.g., buttons or text
    expect(screen.getByText('All tasks completed!')).toBeTruthy();

    // Example interaction test
    fireEvent.press(screen.getByTestId('weatherInfo'));
    expect(screen.getByText('Close')).toBeTruthy(); // Ensure modal opens
  });
  test('renders correctly and fetches tasks', async () => {
    // Mock the API response for tasks
    const mockTasks = [
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: true },
    ];

    axios.get.mockResolvedValueOnce({ data: mockTasks });

    // Render the component
    render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    // Wait for the tasks to be fetched and rendered
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    // Check if the tasks are displayed
    expect(screen.getByText('Task 1')).toBeTruthy();
    expect(screen.getByText('Task 2')).toBeTruthy();
  });

  test('displays and closes the notes modal correctly', async () => {
    // Mock the API response for tasks with notes
    const mockTasks = [
      { id: '1', title: 'Task 1', description: 'Task 1 description', task_status: 'Pending', notes: 'This is a note for Task 1' },
    ];

    axios.get.mockResolvedValueOnce({ data: mockTasks });

    // Render the component
    render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    // Wait for the tasks to be fetched and rendered
    //await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    // Simulate clicking the 'Notes' button to open the modal
    fireEvent.press(screen.getByTestId('notes-button-1')); // Assuming you have set testID='notes-button-1' for the Notes button

    // Check if the modal is displayed with the correct notes
    await waitFor(() => expect(screen.getByText('This is a note for Task 1')).toBeTruthy());

    // Simulate clicking the 'Close' button to close the modal
    fireEvent.press(screen.getByText('Close'));

    // Check if the modal is closed
    await waitFor(() => expect(screen.queryByText('This is a note for Task 1')).toBeNull());
  });
});
