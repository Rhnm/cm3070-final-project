import React from 'react';
import { render,screen, fireEvent,getByPlaceholderText, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import RegisterScreen from './RegisterScreen';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeContext } from './ThemeContext';
import { baseURL } from '../apiConfig';

// Mocking the navigation prop
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

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
// Mocking axios
jest.mock('axios');

describe('RegisterScreen', () => {
  it('renders the Register screen correctly', () => {
    render(
        <NavigationContainer>
          
            <RegisterScreen />
          
        </NavigationContainer>
      );

    expect(screen.getByPlaceholderText('Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Register')).toBeTruthy();
  });

  it('handles successful registration', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 }); // Mocking axios response

    render(
      <NavigationContainer>
        <RegisterScreen navigation={mockNavigation} />
      </NavigationContainer>
    );

    fireEvent.changeText(screen.getByPlaceholderText('Name'), 'Test User');
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');

    fireEvent.press(screen.getByText('Register'));

    // checking for success message
    await waitFor(() => {
      expect(screen.getByText('User registered successfully')).toBeTruthy();
    });

    expect(axios.post).toHaveBeenCalledWith(`${baseURL}:3001/main/register`, {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });
  });

  it('handles registration error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to register')); // Mocking axios error

    render(
        <NavigationContainer>
          
            <RegisterScreen />
          
        </NavigationContainer>
      );

    fireEvent.changeText(screen.getByPlaceholderText('Name'), 'Test User');
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');

    fireEvent.press(screen.getByText('Register'));

    // Checking success message
    await waitFor(() => {
        expect(screen.getByText('User registration failed')).toBeTruthy();
      });
    
    expect(axios.post).toHaveBeenCalledWith(`${baseURL}:3001/main/register`, {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });
  });
});
