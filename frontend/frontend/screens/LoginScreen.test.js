import React from 'react';
import { render, screen, fireEvent,getAllByText, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useTheme } from './ThemeContext';
import axios from 'axios'; // Import axios
import LoginScreen from './LoginScreen';

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

describe('LoginScreen', () => {
  it('renders login form', () => {
    render(
      <NavigationContainer>
        
          <LoginScreen />
        
      </NavigationContainer>
    );
    expect(screen.getByPlaceholderText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Login')).toBeTruthy();
  });
  it('should update username state when input is changed', () => {
    const { getByPlaceholderText } = render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
    const usernameInput = getByPlaceholderText('Username');
    fireEvent.changeText(usernameInput, 'testuser');
    
  });
  it('should show an error message on incorrect login', async () => {
    // Mock axios post to simulate a failed login attempt
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid username or password' } },
    });

    render(
      <NavigationContainer>
        
          <LoginScreen />
        
      </NavigationContainer>
    );

    // Fill in username and password
    fireEvent.changeText(screen.getByPlaceholderText('Username'), 'wronguser');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrongpass');
    
    // Trigger the login
    fireEvent.press(screen.getByText('Login'));

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeTruthy();
    });
  });
});
