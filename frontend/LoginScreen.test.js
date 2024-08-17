/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from './screens/LoginScreen';

describe('LoginScreen', () => {
  it('renders login form', () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Login')).toBeTruthy();
  });

  it('shows error message on failed login', async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Username'), { target: { value: 'wronguser' } });
    fireEvent.changeText(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Incorrect username or password')).toBeTruthy();
    });
  });
});
