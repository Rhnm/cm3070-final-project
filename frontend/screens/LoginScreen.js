import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';
import { useTheme } from './ThemeContext';

const Login = ({ navigation,onLogin }) => {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${baseURL}:3001/main/login`, {
        username,
        password,
      });
      // Ensure the response structure is as expected
      console.log('Login response:', response.data);

      if (response.data.Login) {
        // Navigate to the Home screen or another authenticated screen
        console.log('User ID:', response.data.uid);
        await AsyncStorage.setItem('isLoggedIn', JSON.stringify(response.data.Login));
        await AsyncStorage.setItem('uid',JSON.stringify(response.data.uid));
        onLogin(); // Notify App.js about the login
        setError('');
        navigation.navigate('HomePage', {
          screen: 'Home',
          params: {
            userId: response.data.uid, // You can pass any parameters you need here
          },
        });
      } else {
        Alert.alert('Login Failed', 'Incorrect username or password');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login');
    }
  };

  return (
    <View style={[styles.container,{ backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={theme === 'dark' ? '#fff' : '#ccc'}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={theme === 'dark' ? '#fff' : '#ccc'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#603ae1',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Login;
