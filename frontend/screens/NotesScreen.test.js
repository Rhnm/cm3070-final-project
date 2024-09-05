import React from 'react';
import { render,screen, fireEvent, waitFor, getByText } from '@testing-library/react-native';
import NotesScreen from './NotesScreen';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { NavigationContainer } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { baseURL } from '../apiConfig';;
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('axios');

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
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mocked_directory/',
  getInfoAsync: jest.fn(),
  copyAsync: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    FontAwesome5: ({ name, size, color }) => `Icon: ${name} | Size: ${size} | Color: ${color}`,
  }));  

jest.spyOn(Alert, 'alert');

describe('NotesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNotes = [
    { id: 1, note_text: 'Note 1', attachment: null },
    { id: 2, note_text: 'Note 2', attachment: 'attachment.jpg' },
  ];

  const mockUserId = 'mockUserId';


  AsyncStorage.getItem.mockResolvedValue('mockUserId');
  axios.get.mockResolvedValue({ data: mockNotes });
  axios.post.mockResolvedValue({ 
        data: { 
        id: 3, 
        user_id: mockUserId, 
        note_text: 'New Note', 
        created_at: new Date().toISOString() // Match backend format
    }  
    });
  axios.put.mockResolvedValue({});
  axios.delete.mockResolvedValue({});
  FileSystem.getInfoAsync.mockResolvedValue({ exists: true });

  const renderWithNavigation = () => (
    <NavigationContainer>
      <NotesScreen />
    </NavigationContainer>
  );

  test('renders correctly and fetches notes', async () => {
    const { getByText, findByText } = render(renderWithNavigation());

    await findByText('Your Notes');

    // Check initial notes are fetched and displayed
    expect(axios.get).toHaveBeenCalledWith(`${baseURL}:3001/resources/getnotes/mockUserId`);
    expect(getByText('Note 1')).toBeTruthy();
    expect(getByText('Note 2')).toBeTruthy();
  });

  

  test('displays alert if adding an empty note', async () => {
    const { getByText } = render(renderWithNavigation());
    const button = getByText('Save Note');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Note cannot be empty');
    });
  });  

});
