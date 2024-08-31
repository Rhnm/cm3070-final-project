// SplashScreen.test.js
import React from 'react';
import { View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from './SplashScreen';

// Simple mock for MaterialIcons using a View as a placeholder
const MockMaterialIcons = (props) => <View {...props} />;

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: MockMaterialIcons // Correctly assign the mock component to MaterialIcons
}));

describe('SplashScreen', () => {
  it('renders correctly', () => {
    render(
      <NavigationContainer>
        <SplashScreen />
      </NavigationContainer>
    );

    // Check if the title is rendered
    expect(screen.getByText("Task Management & To-Do List")).toBeTruthy();

    // Check if the button is rendered
    expect(screen.getByText("Let's Start")).toBeTruthy();
  });
});
