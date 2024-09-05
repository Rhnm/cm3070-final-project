import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from './ThemeContext'; // Adjust the import path accordingly
import { Text, Button } from 'react-native';

// A simple component to consume the ThemeContext
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <Text testID="theme-text">{theme}</Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </>
  );
};

describe('ThemeProvider', () => {
  it('should use light theme as the default theme', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themeText = getByTestId('theme-text');
    expect(themeText.props.children).toBe('light');
  });
});
