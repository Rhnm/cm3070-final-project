import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import EditUserProfileScreen from './screens/EditUserProfileScreen';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from './apiConfig';


jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');

const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};


describe('EditUserProfileScreen', () => {
  it('handles validation errors', async () => {
    renderWithNavigation(<EditUserProfileScreen />);
    const mockNavigation = { goBack: jest.fn() };
    const mockUserId = '12345';
    
    beforeEach(() => {
      AsyncStorage.getItem.mockResolvedValue(mockUserId);
      axios.get.mockResolvedValue({
        data: [{ name: 'John Doe', email: 'john.doe@example.com' }]
      });
      axios.post.mockResolvedValue({ data: { success: true } });
    });

    test('renders user profile details correctly', async () => {
      render(<EditUserProfileScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeTruthy();
        expect(screen.getByDisplayValue('john.doe@example.com')).toBeTruthy();
      });
    });

    test('handles saving profile changes', async () => {
      render(<EditUserProfileScreen navigation={mockNavigation} />);

      fireEvent.changeText(screen.getByPlaceholderText('Enter your username'), 'Jane Doe');
      fireEvent.changeText(screen.getByPlaceholderText('Enter your email'), 'jane.doe@example.com');
      fireEvent.press(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(`${baseURL}:3001/resources/updateUserProfile`, {
          userId: mockUserId,
          name: 'Jane Doe',
          email: 'jane.doe@example.com'
        });
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });

    test('handles validation errors', async () => {
      render(<EditUserProfileScreen navigation={mockNavigation} />);

      fireEvent.press(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeTruthy();
      });
    });
  });
});
