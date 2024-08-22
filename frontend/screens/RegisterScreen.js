import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { baseURL } from '../apiConfig';
import { useTheme } from './ThemeContext';

const Register = ({ navigation }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${baseURL}:3001/main/register`, {
        name,
        email,
        username,
        password,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'User registered successfully');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Failed to register');
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Error', 'Failed to register');
    }
  };

  return (
    <View style={[styles.container,{ backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor={theme === 'dark' ? '#fff' : '#ccc'}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme === 'dark' ? '#fff' : '#ccc'}
        value={email}
        onChangeText={setEmail}
      />
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
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
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

export default Register;
