import React, { useState } from 'react';
import { StyleSheet,Image, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { baseURL } from '../apiConfig';
import { useTheme } from './ThemeContext';

const Register = ({ navigation }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg,setmsg] = useState('');

  const validateInput = () => {
    if (username.trim() === '') {
      Alert.alert('Validation Error', 'Username is required.');
      return false;
    }
    if (password.trim() === '') {
      Alert.alert('Validation Error', 'Password is required.');
      return false;
    }
    if (email.trim() === '') {
      Alert.alert('Validation Error', 'Email is required.');
      return false;
    }
    if (name.trim() === '') {
      Alert.alert('Validation Error', 'Name is required.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    try {
      if(validateInput()){
      const response = await axios.post(`${baseURL}:3001/main/register`, {
        name,
        email,
        username,
        password,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'User registered successfully');
        setmsg('User registered successfully');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Failed to register');
        setmsg('User registration failed');
      }
    }
    } catch (error) {
      setmsg('User registration failed');
      Alert.alert('Error', 'Failed to register');
    }
  };

  return (
    <View style={[styles.container,{ backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <TextInput
        style={[styles.input,{borderColor:theme === 'dark' ? '#fff' : '#000'}]}
        placeholder="Name"
        placeholderTextColor={theme === 'dark' ? '#fff' : '#000'}
        color={theme === 'dark' ? '#fff' : '#000'}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input,{borderColor:theme === 'dark' ? '#fff' : '#000'}]}
        placeholder="Email"
        placeholderTextColor={theme === 'dark' ? '#fff' : '#000'}
        color={theme === 'dark' ? '#fff' : '#000'}
        value={email}
        onChangeText={setEmail}
      />
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
      <TouchableOpacity style={[styles.button,{backgroundColor:theme === 'dark' ? '#fff' : '#000'},]} onPress={handleRegister}>
        <Text style={[styles.buttonText,{color:theme === 'dark' ? '#000' : '#fff'}]}>Register</Text>
      </TouchableOpacity>
      <Text style={styles.msgText}>{msg}</Text>
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

export default Register;
