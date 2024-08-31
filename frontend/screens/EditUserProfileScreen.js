import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';

const EditUserProfileScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [error,setError] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        if (uid !== null) {
          setUserId(uid);
          fetchUserDetails(uid);
        } else {
          navigation.navigate('Login');
          console.log('No user ID found');
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getUserDetails/${userId}`);
      if (response.data.length > 0) {
        setUsername(response.data[0].name);
        setEmail(response.data[0].email);
      } else {
        console.log('No user details found');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleSave = async () => {
    if (!username || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post(`${baseURL}:3001/resources/updateUserProfile`, {
        userId,
        name: username,
        email
      });

      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
        setError('');
      } else {
        //Alert.alert('Error', 'Failed to update profile');
        Alert.alert('Error', response.data.message || 'Failed to update profile');
        setError('User not found');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('User not found');
      //Alert.alert('Error', 'Failed to update profile');
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Username:</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter your username"
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>Error: {error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4287f5',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default EditUserProfileScreen;
