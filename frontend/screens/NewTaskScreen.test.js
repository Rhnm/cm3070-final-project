import React from 'react';
import { render,screen, fireEvent, waitFor, act } from '@testing-library/react-native';
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

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

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


// Mock AsyncStorage for testing purposes
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
    AsyncStorage.getItem.mockResolvedValueOnce('true'); // Mock isLoggedIn
    AsyncStorage.getItem.mockResolvedValueOnce('123'); // Mock user ID

    const { getByPlaceholderText, getByText } = render(<NewTaskScreen />);

    await waitFor(() => {
      expect(getByText('Save Task')).toBeTruthy();
      expect(getByPlaceholderText('Task Title')).toBeTruthy();
      expect(getByPlaceholderText('Task Description')).toBeTruthy();
    });
  }); 


  test('displays login message when not logged in', async() => {
    // Mock the useState hook to set isLoggedIn to false
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [false, jest.fn()]) // isLoggedIn
      .mockImplementationOnce(() => [null, jest.fn()]); // userIdFrom
  
      render(
        <NavigationContainer>
            <NewTaskScreen />
        </NavigationContainer>
        );
  
    


    // Check if loading indicator is displayed
  expect(screen.getByTestId('loadingIndicator')).toBeTruthy();

  // Wait for loading to complete
  await waitFor(() => {
      expect(screen.getByText('You need to be logged in to view your tasks.')).toBeTruthy();
    });
  });

  test('fetches and displays task types and priorities', async () => {
    // Mock task types response
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Personal' },
        { id: 2, name: 'Work' },
        { id: 3, name: 'Urgent' },
      ],
    });

    const { getByTestId, getByText } = render(<NewTaskScreen />);

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
    expect(screen.getByTestId('loadingIndicator')).toBeTruthy();
    console.log("loading completed!");
  });

    await waitFor(() => {
      
      expect(screen.getByText('Task Due Date')).toBeTruthy();
      
    });
  });

  
  test('should update task type when a new type is selected', async () => {
    // Mock task types response
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Personal' },
        { id: 2, name: 'Work' },
        { id: 3, name: 'Urgent' },
      ],
    });

    const { getByTestId, getByText } = render(<NewTaskScreen />);

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
    
    await waitFor(() => {
      expect(screen.getByTestId('loadingIndicator')).toBeTruthy();
      console.log("loading completed!");
    });

    // Check if the picker is present
    const taskTypePicker = getByTestId('taskTypePicker');
    expect(taskTypePicker).toBeTruthy();

    // Select a new task type
    fireEvent(taskTypePicker, 'onValueChange', 'Work');

    // Verify the task type is updated
    expect(getByTestId('taskTypePicker')).toBeTruthy();
  });


  /* test('should call saveTask when Save Task button is pressed with valid data', async () => {
    const { getByPlaceholderText, getByText } = render(<NewTaskScreen />);

    // Input task title
    const titleInput = getByPlaceholderText('Task Title');
    act(() => {
      fireEvent.changeText(titleInput, 'Test Task Title');
    });

    // Input task description
    const descriptionInput = getByPlaceholderText('Task Description');
    act(() => {
      fireEvent.changeText(descriptionInput, 'This is a test task description.');
    });

    // Press Save Task button
    const saveTaskButton = getByText('Save Task');
    await act(async () => {
      fireEvent.press(saveTaskButton);
    });

    // Wait for the task to be saved
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    // Verify the saveTask function is called with correct data
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/resources/savetask'),
      expect.objectContaining({
        user_id: '1',
        title: 'Test Task Title',
        description: 'This is a test task description.',
        priority: 'Low',
        dueDate: '2024-09-15',
        taskType: 'Personal',
        timeframe: '2 hours',
      })
    );
  }); */


});