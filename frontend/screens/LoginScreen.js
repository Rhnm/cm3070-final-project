import React, { useState } from 'react';
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';
import { useTheme } from './ThemeContext';

const Login = ({ navigation,onLogin }) => {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateInput = () => {
    if (username.trim() === '') {
      Alert.alert('Validation Error', 'Username is required.');
      return false;
    }
    if (password.trim() === '') {
      Alert.alert('Validation Error', 'Password is required.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    try {
      if(validateInput()){
        const response = await axios.post(`${baseURL}:3001/main/login`, {
          username,
          password,
        });

        if (response.data.Login) {
          
          await AsyncStorage.setItem('isLoggedIn', JSON.stringify(response.data.Login));
          await AsyncStorage.setItem('uid',JSON.stringify(response.data.uid));
          onLogin(); // Notifying App.js about the login
          setError('');
          // Navigate to the Home screen
          navigation.navigate('Home Page', {
            screen: 'Home',
            params: {
              userId: response.data.uid,
            },
          });
        } else {
          Alert.alert('Login Failed', 'Incorrect username or password');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      Alert.alert('Error', 'Failed to login');
    }
  };

  return (
    <View style={[styles.container,{ backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
      
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <TextInput
        style={[styles.input,{borderColor:theme === 'dark' ? '#fff' : '#000'}]}
        placeholder="Username"
        placeholderTextColor={theme === 'dark' ? '#fff' : '#000'}
        color={theme === 'dark' ? '#fff' : '#000'}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={[styles.input,{borderColor:theme === 'dark' ? '#fff' : '#000'}]}
        placeholder="Password"
        placeholderTextColor={theme === 'dark' ? '#fff' : '#000'}
        color={theme === 'dark' ? '#fff' : '#000'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={[styles.button,{backgroundColor:theme === 'dark' ? '#fff' : '#000'},]} onPress={handleLogin}>
        <Text style={[styles.buttonText,{color:theme === 'dark' ? '#000' : '#fff'}]}>Login</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logo: {
    width: 200, 
    height: 200, 
    resizeMode: 'contain', 
    marginBottom: "10%",
  },
  input: {
    width: '80%',
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 5,
  },
  button: {
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
