import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Modal, Button, TextInput } from 'react-native';
import CheckBox from 'expo-checkbox';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig'; // Make sure this path is correct

const PeopleScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState([]); // Ensure it's an array
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [userIdFrom, setUserIdFrom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('isLoggedIn');
        const uid = await AsyncStorage.getItem('uid');
        setUserIdFrom(uid);
        setIsLoggedIn(value === 'true');
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false); // Stop loading spinner even if there's an error
      }
    };

    checkLoginStatus();
  }, []);
  useFocusEffect(
    useCallback(() => {
      if (userIdFrom) {
        fetchTasks();
      fetchContacts();
      fetchSharedUsers();
      }
    }, [userIdFrom,fetchTasks,fetchSharedUsers])
  );

  /* useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
      fetchContacts();
      fetchSharedUsers();
    }
  }, [isLoggedIn, fetchTasks]);
 */
  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getUsers/${userIdFrom}`);
      setContacts(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } 
  };

  const fetchSharedUsers = async () => {
    try{
      const response = await axios.get(`${baseURL}:3001/resources/getSharedUsers/${userIdFrom}`);
      setSharedUsers(response.data);
      console.log(response.data);
    }catch(error){
      console.error('Error fetching shared users:',error);
    }
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      if (userIdFrom != null) {
        const response = await axios.get(`${baseURL}:3001/resources/gettasks/${userIdFrom}`);
        setTasks(response.data);
        console.log("in peoples tasks: " + response.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [userIdFrom]);

  const handlePress = (item) => {
    setSelectedContact(item);
    setModalVisible(true);
  };

  const handleShare = async () => {
    if (selectedTask.length === 0 || !selectedContact) {
      alert('Please select at least one task and an email to share.');
      return;
    }
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getUserIdByEmail/${selectedContact}`);
      const userIdTo = response.data.id;
      const responses = await Promise.all(
        selectedTask.map(taskId => 
          axios.post(`${baseURL}:3001/resources/shareTask`, {
            taskId,
            userIdFrom,
            userIdTo,
          })
        )
      );
      /* await Promise.all(
        selectedTask.map(taskId => 
          axios.post(${baseURL}:3001/resources/shareTask, {
            taskId,
            userIdFrom,
            userIdTo,
          })
        )
      ); */
      // Extracting the data (messages) from each response
      const responseData = responses.map(response => response.data);

      responseData.forEach(message => {
        alert(message); // Logs "Task shared successfully!" or "Task already shared!"
      });
      setModalVisible(false);
      setSelectedEmails([]);
      setEmailInput('');
      setSelectedTask([]);
    } catch (error) {
      console.error('Error sharing tasks:', error.message);
    }
  };

  const handleEmailInput = async (text) => {
    setEmailInput(text);
    if (text.length > 2) {
      try {
        const response = await axios.get(`${baseURL}:3001/resources/suggestions/${userIdFrom}`, { params: { email: text } });
        setEmailSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching email suggestions:', error);
      }
    } else {
      setEmailSuggestions([]);
    }
  };

  const handleSelectEmail = (email) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails([...selectedEmails, email]);
    }
    setEmailInput('');
    setEmailSuggestions([]);
    setModalVisible(true); // Show modal when an email is selected
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTask(prevSelectedTask => {
      if (prevSelectedTask.includes(taskId)) {
        return prevSelectedTask.filter(id => id !== taskId);
      } else {
        return [...prevSelectedTask, taskId];
      }
    });
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity style={styles.taskItem}>
      <CheckBox
        style={styles.checkbox}
        value={selectedTask.includes(item.id)}
        onValueChange={() => toggleTaskSelection(item.id)}
      />
      <Text style={styles.taskTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>You need to be logged in to view your tasks.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.emailInput}
        value={emailInput}
        onChangeText={handleEmailInput}
        placeholder="Enter email to share task"
      />
      {emailSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={emailSuggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectEmail(item)}>
                <Text style={styles.suggestion}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      <View style={styles.selectedEmailsContainer}>
        {selectedEmails.map((email, index) => (
          <TouchableOpacity style={styles.personContainer} key={index} onPress={() => handlePress(email)}>
            <Text style={styles.selectedEmail}>{email}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.selectedEmailsContainer}>
        {sharedUsers.map((user, index) => (
          <TouchableOpacity style={styles.personContainer} key={index} onPress={() => handlePress(user.email)}>
            <Text style={styles.selectedEmail}>{user.email}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {selectedContact && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.selectedContactName}>{selectedContact.name}</Text>
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTaskItem}
                contentContainerStyle={styles.taskListContainer}
              />
              <View style={styles.buttonContainer}>
                <Button title="Share Task" color="#ef9c66" onPress={handleShare} />
                <Button title="Close" color="#78aba8" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    alignItems: 'flex-start',
  },
  personContainer: {
    alignItems: 'left',
    marginRight: 20,
    marginBottom: 20,
    width: "100%",
    backgroundColor:"#e0e5b6",
  },
  personImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  personName: {
    fontSize: 14,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedContactName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskListContainer: {
    width: '100%',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  checkbox: {
    margin: 8,
  },
  taskTitle: {
    fontSize: 16,
  },
  emailInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  suggestionsContainer: {
    marginBottom: 10,
  },
  suggestion: {
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  selectedEmailsContainer: {
    marginVertical: 10,
  },
  selectedEmail: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
});

export default PeopleScreen;