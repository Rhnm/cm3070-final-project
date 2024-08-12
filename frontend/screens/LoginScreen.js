import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';

const Login = ({ navigation,onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
        navigation.navigate('HomeTabs', {
          screen: 'Home',
          params: {
            userId: response.data.uid, // You can pass any parameters you need here
          },
        });
      } else {
        Alert.alert('Login Failed', 'Incorrect username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
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
