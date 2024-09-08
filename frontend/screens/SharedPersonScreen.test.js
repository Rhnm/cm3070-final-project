import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import SharedPersonScreen from './SharedPersonScreen';
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

test('renders loading spinner when loading is true', () => {
  // Mocking the useState hook to set loading to true
  jest.spyOn(React, 'useState')
    .mockImplementationOnce(initial => [true, jest.fn()]);

  render(
    <NavigationContainer>
        <SharedPersonScreen />
    </NavigationContainer>
    );

  // Checking if the ActivityIndicator (spinner) is present
  const spinner = screen.getByTestId('loading-spinner');
  expect(spinner).toBeTruthy();
});


test('displays shared tasks after loading', async () => {
    // Mocking axios to return a sample response
    axios.get.mockResolvedValue({
      data: [
        {
          task_id: 1,
          task_title: 'Sample Task 1',
          user_from_names: 'John Doe',
          user_to_names: 'Jane Smith, Bob Brown',
          user_to_ids: '2,3',
          shared_ats: new Date().toISOString(),
        },
      ],
    });
  
    render(<SharedPersonScreen />);
  
    // Waiting for the loading state to be set to false and the tasks to be rendered
    await waitFor(() => screen.getByText('Sample Task 1'));
  
    // Checking if the task title is displayed
    const taskTitle = screen.getByText('Sample Task 1');
    expect(taskTitle).toBeTruthy();
  
    // Checking if the assigned users are displayed
    const user1 = screen.getByText('Jane Smith');
    const user2 = screen.getByText('Bob Brown');
    expect(user1).toBeTruthy();
    expect(user2).toBeTruthy();
  });