import React from 'react';
import { render,screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewTaskScreen from './NewTaskScreen'; 
import { NavigationContainer } from '@react-navigation/native';
// Mocking axios
jest.mock('axios'); 
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));
jest.mock('expo-checkbox', () => 'CheckBox'); // Mocking expo-checkbox
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

// Mocking @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const mockComponent = ({ name, ...rest }) => {
    return <div {...rest}>Icon: {name}</div>;
  };

  return {
    Ionicons: mockComponent,
    MaterialIcons: mockComponent,
    FontAwesome: mockComponent,
  };
});

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mocking the useFocusEffect
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useFocusEffect: jest.fn((callback) => callback()), 
  };
});


// Mocking AsyncStorage for testing purposes
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));


describe('NewTaskScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('true'); // Mocking isLoggedIn
    AsyncStorage.getItem.mockResolvedValueOnce('123'); // Mocking user ID

    const { getByPlaceholderText, getByText } = render(<NewTaskScreen />);

    await waitFor(() => {
      expect(getByText('Save Task')).toBeTruthy();
      expect(getByPlaceholderText('Task Title')).toBeTruthy();
      expect(getByPlaceholderText('Task Description')).toBeTruthy();
    });
  }); 


  test('displays login message when not logged in', async() => {
    // Mocking the useState hook to set isLoggedIn to false
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [false, jest.fn()]) 
      .mockImplementationOnce(() => [null, jest.fn()]); 
  
      render(
        <NavigationContainer>
            <NewTaskScreen />
        </NavigationContainer>
        );
  
    


    // Checking if loading indicator is displayed
  expect(screen.getByTestId('loadingIndicator')).toBeTruthy();

  // Waiting for loading to complete
  await waitFor(() => {
      expect(screen.getByText('You need to be logged in to view your tasks.')).toBeTruthy();
    });
  });

});