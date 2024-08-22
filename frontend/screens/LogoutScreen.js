import React from 'react';
import { StyleSheet, View, Button, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';

const LogoutScreen = ({ navigation,onLogout }) => {
  const { theme } = useTheme();
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('uid');
      onLogout(); // Notify App.js about the logout
      navigation.navigate('Login'); // Navigate to the 'Login' screen
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <View style={[styles.container,{ backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default LogoutScreen;