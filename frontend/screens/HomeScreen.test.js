import React from 'react';
import { screen,render, fireEvent, waitFor, act } from '@testing-library/react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './HomeScreen';
import { ThemeProvider } from './ThemeContext';
import { NavigationContainer } from '@react-navigation/native';

// Mocking modules
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useFocusEffect: jest.fn().mockImplementation(callback => callback()),
  };
});

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

jest.mock('@expo/vector-icons', () => ({
  FontAwesome5: 'FontAwesome5',
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

describe('HomeScreen', () => {
  const mockTasks = [
    { id: 1, title: 'Task 1', description: 'Description 1', due_date: '2024-09-01', priority: 'High', type: 'Professional', status: 'Pending' },
    { id: 2, title: 'Task 2', description: 'Description 2', due_date: '2024-09-05', priority: 'Medium', type: 'Personal', status: 'Pending' },
  ];

  const mockSharedTasks = [
    { id: 3, title: 'Task 3', description: 'Description 3', due_date: '2024-09-07', priority: 'Low', type: 'Other', status: 'Pending' },
  ];

  beforeEach(() => {
    AsyncStorage.getItem.mockResolvedValue('1'); // Mocking user ID
    axios.get.mockImplementation((url) => {
      if (url.includes('getPendingTasks')) {
        return Promise.resolve({ data: mockTasks });
      }
      if (url.includes('getSharedUsersTasks')) {
        return Promise.resolve({ data: mockSharedTasks });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <NavigationContainer>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </NavigationContainer>
    );

  /* it('fetches and displays tasks on load', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Task 1')).toBeTruthy();
      expect(getByText('Task 2')).toBeTruthy();
      expect(getByText('Task 3')).toBeTruthy();
    });
  }); */

  /* it('filters tasks by priority', async () => {
    const { getByText, queryByText, getByLabelText } = renderComponent();

    await waitFor(() => getByText('Task 1'));

    // Open filter modal
    const filterIcon = getByLabelText('filter-list');
    fireEvent.press(filterIcon);

    // Select high priority
    const highPriorityCheckbox = getByLabelText('High');
    fireEvent.click(highPriorityCheckbox);

    // Apply filters
    const applyFiltersButton = getByText('Apply Filters');
    fireEvent.press(applyFiltersButton);

    await waitFor(() => {
      expect(getByText('Task 1')).toBeTruthy();
      expect(queryByText('Task 2')).toBeNull();
      expect(queryByText('Task 3')).toBeNull();
    });
  }); */

  /* it('completes a task', async () => {
    axios.put.mockResolvedValue({});
    const { getByText } = renderComponent();

    await waitFor(() => getByText('Task 1'));

    const completeButton = getByText('Complete');
    fireEvent.press(completeButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('completeTask/1'));
      expect(getByText('Success')).toBeTruthy();
    });
  }); */

  it('opens and closes the task detail modal', async () => {
    const { getByText, queryByText, getByTestId } = renderComponent();
  
    await waitFor(() => getByText('Task 1'));
  
    const task1 = getByText('Task 1');
    fireEvent.press(task1);
  
    await waitFor(() => {
      expect(getByTestId('task-description')).toBeTruthy();
    });
  
    /* const closeButton = getByTestId('modal-close-button');
    fireEvent.press(closeButton);
  
    await waitFor(() => {
      expect(getByTestId('task-detail-modal')).toBeFalsey();
    }); */
  });

  it('shows no tasks message when there are no tasks', async() => {

    const { getByText, getByLabelText } = renderComponent();

    const filterIcon = getByLabelText('filter-list');
    fireEvent.press(filterIcon);

    const applyFiltersButton = getByText('Apply Filters');
    fireEvent.press(applyFiltersButton);

    // This is a placeholder assertion to check if the theme affects the component's style
    // Adjust the styles and expectations based on your actual implementation
    //expect(getByText('Filter Tasks').parent.props.style.backgroundColor).toBe('#333');
    /* render(
        <NavigationContainer>
            <ThemeProvider>
            <HomeScreen />
            </ThemeProvider>
        </NavigationContainer>
      ); */
      await waitFor(() => {
        expect(screen.getByText('All tasks completed!')).toBeTruthy(); // Assuming this is the message shown when no tasks are present
    });
  });
});
