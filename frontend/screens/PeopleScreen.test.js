import React from 'react';
import { render, screen,fireEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import PeopleScreen from './PeopleScreen'; // Adjust the import path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('expo-checkbox', () => ({
    __esModule: true,
    default: ({ value, onValueChange }) => (
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onValueChange(e.target.checked)}
      />
    ),
  }));

  // Mock axios
jest.mock('axios');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

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

  jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
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
      // Add any other icons or components used in your tests
    };
  });

test('renders loading spinner when loading is true', async() => {
  // Mock the useState hook to set loading to true
  jest.spyOn(React, 'useState')
    .mockImplementationOnce(initial => [true, jest.fn()]);

  render(
    <NavigationContainer>
        <PeopleScreen />
    </NavigationContainer>
    );

  // Check if the ActivityIndicator (spinner) is present
  /* const spinner = screen.getByTestId('loading-spinner');
  expect(spinner).toBeTruthy(); */

  // Check if the login message is present
  const message = screen.getByTestId('loadingIndicator');
  expect(message).toBeTruthy();
});
test('displays login message when not logged in', async() => {
    // Mock the useState hook to set isLoggedIn to false
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [false, jest.fn()]) // isLoggedIn
      .mockImplementationOnce(() => [null, jest.fn()]); // userIdFrom
  
      render(
        <NavigationContainer>
            <PeopleScreen />
        </NavigationContainer>
        );
  
    


    // Check if loading indicator is displayed
  expect(screen.getByTestId('loadingIndicator')).toBeTruthy();

  // Wait for loading to complete
  await waitFor(() => {
      expect(screen.getByText('You need to be logged in to view your tasks.')).toBeTruthy();
    });
  });

  test('Email is displayed correctly after inserting to email field', async () => {
    // Mock data for testing
    const mockUserData = {
      name: 'John Doe',
      id: '1',
      email: 'john.doe@example.com',
      image: 'mock_image.png',
    };
    const mockTasks = [
      { id: '1', title: 'Task 1' },
      { id: '2', title: 'Task 2' },
    ];
  
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('getUsers')) {
        return Promise.resolve({ data: [mockUserData] });
      }
      if (url.includes('gettasks')) {
        return Promise.resolve({ data: mockTasks });
      }
      if (url.includes('getSharedUsers')) {
        return Promise.resulve({data: [mockUserData] });
      }
      return Promise.reject(new Error('Not Found'));
    });
  
    // Mock AsyncStorage
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'isLoggedIn') return Promise.resolve('true');
      if (key === 'uid') return Promise.resolve('123');
      if (key === 'loading') return Promise.resolve('false');
      return Promise.resolve(null);
    });
  
    // Render the component
    render(
      <NavigationContainer>
          <PeopleScreen />
      </NavigationContainer>
      );
  
    await waitFor(() => {
      expect(screen.getByTestId('loadingIndicator')).toBeTruthy();
      console.log("loading completed!");
    });
  
    const selectEmailButton = screen.getByTestId('getTestEmail');
    fireEvent.changeText(selectEmailButton, 'john.doe@example.com');
    await waitFor(() => {
      expect(screen.getByTestId('getTestEmail').props.value).toBe('john.doe@example.com');
    });
  });

  test('Modal is displayed correctly after pressing email field', async () => {
    // Mock data for testing
    const mockUserData = {
      name: 'John Doe',
      id: '1',
      email: 'john.doe@example.com',
      image: 'mock_image.png',
    };
    const mockTasks = [
      { id: '1', title: 'Task 1' },
      { id: '2', title: 'Task 2' },
    ];
  
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('getUsers')) {
        return Promise.resolve({ data: [mockUserData] });
      }
      if (url.includes('gettasks')) {
        return Promise.resolve({ data: mockTasks });
      }
      if (url.includes('getSharedUsers')) {
        return Promise.resolve({data: [mockUserData] });
      }
      return Promise.reject(new Error('Not Found'));
    });
  
    // Mock AsyncStorage
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'isLoggedIn') return Promise.resolve('true');
      if (key === 'uid') return Promise.resolve('123');
      if (key === 'loading') return Promise.resolve('false');
      return Promise.resolve(null);
    });
  
    // Render the component
    render(
      <NavigationContainer>
          <PeopleScreen />
      </NavigationContainer>
      );
  
    await waitFor(() => {
      expect(screen.getByTestId('loadingIndicator')).toBeTruthy();
      console.log("loading completed!");
    });
  
    const selectEmailButton = screen.getByTestId('getSharedTestEmail');
    fireEvent.changeText(selectEmailButton, 'john.doe@example.com');

    // Simulate selecting an email
    const selectEmail = screen.getByTestId('testing-assign');
    fireEvent.press(selectEmail);

    // Open the modal
    const modal = screen.getByTestId('test-modal');
    expect(modal).toBeTruthy();

    // Check the buttons in the modal
    const shareButton = screen.getByTestId('share-button');
    const closeButton = screen.getByTestId('close-button');

    expect(shareButton).toBeTruthy();
    expect(closeButton).toBeTruthy();

    // Simulate pressing the close button
    fireEvent.press(closeButton);
    await waitFor(() => {
      expect(screen.queryByTestId('test-modal')).toBeNull();
    });
  });