import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewTaskScreen from './NewTaskScreen'; // Adjust the path as necessary
import { NavigationContainer } from '@react-navigation/native';

jest.mock('axios'); // Mock axios
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));
jest.mock('expo-checkbox', () => 'CheckBox'); // Mock expo-checkbox

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

// Mock the useFocusEffect
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useFocusEffect: jest.fn((callback) => callback()), // directly invoke the effect
  };
});


describe('NewTaskScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('true'); // Mock isLoggedIn
    AsyncStorage.getItem.mockResolvedValueOnce('123'); // Mock user ID

    const { getByPlaceholderText, getByText } = render(<NewTaskScreen />);

    await waitFor(() => {
      expect(getByText('Save Task')).toBeTruthy();
      expect(getByPlaceholderText('Task Title')).toBeTruthy();
      expect(getByPlaceholderText('Task Description')).toBeTruthy();
    });
  }); 

  /* test('fetches and displays task types and priorities', async () => {
    const taskTypesResponse = { data: [{ id: 1, name: 'Personal' }, { id: 2, name: 'Professional' }] };
    const prioritiesResponse = { data: [{ id: 1, name: 'Low' }, { id: 2, name: 'High' }] };

    axios.get.mockImplementation((url) => {
      if (url.includes('tasktypes')) return Promise.resolve(taskTypesResponse);
      if (url.includes('priority')) return Promise.resolve(prioritiesResponse);
      return Promise.resolve({ data: [] });
    });

    render(
      <NavigationContainer>
        <NewTaskScreen />
      </NavigationContainer>
  );

    await waitFor(() => {
      
      expect(screen.getByText('You need to be logged in to view your tasks.')).toBeTruthy();
      
    });
  }); */
});