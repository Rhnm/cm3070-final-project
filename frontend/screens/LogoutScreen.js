import React from 'react';
import { StyleSheet, View,Text,TouchableOpacity, Button, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';
import { useEffect } from 'react';

const LogoutScreen = ({ navigation,onLogout }) => {
  const { theme } = useTheme();
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('uid');
      onLogout(); // Notifying App.js about the logout
      navigation.navigate('Login'); // Navigate to the 'Login' screen
    } catch (error) {
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <View style={[styles.container,{ backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
        <Text style={[styles.buttonText,{color: theme === 'dark' ? '#000' : '#fff', }]}>Logging out...</Text>
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
  button: {
    backgroundColor: '#4287f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LogoutScreen;