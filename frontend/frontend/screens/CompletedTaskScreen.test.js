import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import CompletedTaskScreen from './CompletedTaskScreen';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';

// Mock the necessary modules
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('./ThemeContext');
jest.mock('@expo/vector-icons', () => ({
    FontAwesome5: 'FontAwesome5',
    MaterialIcons: 'MaterialIcons',
  }));

describe('CompletedTaskScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays tasks correctly', async () => {
    // Mock the theme context
    useTheme.mockReturnValue({ theme: 'light' });

    // Mock the API call
    axios.get.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description for task 1',
          priority: 'High',
          type: 'Work',
          timeframe: 30,
          due_date: '2024-12-01',
        },
      ],
    });

    // Mock AsyncStorage
    AsyncStorage.getItem.mockResolvedValue('userId123');

    const { getByText } = render(<CompletedTaskScreen />);

    await waitFor(() => getByText('Task 1'));

    expect(getByText('Task 1')).toBeTruthy();
    expect(getByText('Description for task 1')).toBeTruthy();
  });

  it('displays no tasks message when there are no tasks', async () => {
    // Mock the theme context
    useTheme.mockReturnValue({ theme: 'light' });

    // Mock the API call to return an empty list
    axios.get.mockResolvedValue({ data: [] });

    // Mock AsyncStorage
    AsyncStorage.getItem.mockResolvedValue('userId123');

    const { getByText } = render(<CompletedTaskScreen />);

    await waitFor(() => getByText('No completed tasks yet!'));

    expect(getByText('No completed tasks yet!')).toBeTruthy();
  });
});
