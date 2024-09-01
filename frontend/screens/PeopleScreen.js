import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet,Image, ActivityIndicator,ScrollView, FlatList, TouchableOpacity, Modal, Alert, Button, TextInput } from 'react-native';
import CheckBox from 'expo-checkbox';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig'; // Make sure this path is correct
import { Ionicons } from '@expo/vector-icons';

const PeopleScreen = () => {
  const [contacts, setContacts] = useState([]);

  const [sharedUsers, setSharedUsers] = useState([]);

  const [sharedEmails, setSharedEmails] = useState([]);
  const [sharedIds, setSharedIds] = useState([]);
  const [sharedNames, setSharedNames] = useState([]);
  const [sharedImages, setSharedImages] = useState([]);

  const [selectedContact, setSelectedContact] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState([]); // Ensure it's an array
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [idSuggestions, setIdSuggestions] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [imageSuggestions, setImageSuggestions] = useState([]);

  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

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
      console.log("Data from people test: ",response.data);
      const ids = response.data.map(item => item.id);
      const emails = response.data.map(item => item.email);
      const names = response.data.map(item => item.name);
      const images = response.data.map(item => FileSystem.documentDirectory + item.image);

      setSharedIds(ids);
      setSharedEmails(emails);
      setSharedImages(images);
      setSharedNames(names);

      /* setSelectedIds(ids);
      setSelectedEmails(emails);
      setSelectedNames(names);
      setSelectedImages(images); */

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
      setSelectedIds(response.data);
      const getUserId = response.data;
      console.log("Getting id: ",response.data);
      console.log("Selected Ids: ",selectedIds);
      const responses = await Promise.all(
        selectedTask.map(taskId => 
          axios.post(`${baseURL}:3001/resources/shareTasks`, {
            taskId,
            userIdFrom,
            getUserId,
          })
        )
      );
      responses.forEach((response) => {
        Alert.alert(response.data.message);
        console.log("Getting data from sharetasks:", response.data.message);
      });
      
      setModalVisible(false);
      setSelectedEmails([]);
      setSelectedIds([]);
      setSelectedImages([]);
      setSelectedNames([]);
      setSelectedContact([]);
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
        
        const ids = response.data.map(item => item.id);
        const emails = response.data.map(item => item.email);
        const names = response.data.map(item => item.name);
        const images = response.data.map(item => FileSystem.documentDirectory + item.image);
    
        setIdSuggestions(ids);
        setEmailSuggestions(emails);
        setNameSuggestions(names);
        setImageSuggestions(images);

      } catch (error) {
        console.error('Error fetching email suggestions:', error);
      }
    } else {
      setIdSuggestions([]);
      setEmailSuggestions([]);
      setNameSuggestions([]);
      setImageSuggestions([]);
    }
  };

  const handleSelectEmail = (email) => {

    // Find the index of the selected email in the suggestions list
    const index = emailSuggestions.indexOf(email);


    if (selectedEmails.includes(email) || sharedEmails.includes(email)) {
      // If it is, show an alert
      Alert.alert('Already Added', 'This email has already been added.');
    } else {
      if (index !== -1) {
        // Get the corresponding name and image using the index
        const selectedId = idSuggestions[index];
        const selectedName = nameSuggestions[index];
        const selectedImage = imageSuggestions[index];

        // Update state for selected emails, names, and images
        setSelectedIds([...selectedIds, selectedId]);
        setSelectedEmails([...selectedEmails, email]);
        setSelectedNames([...selectedNames, selectedName]);
        setSelectedImages([...selectedImages, selectedImage]);
        setModalVisible(true); // Show modal when an email is selected
      }
    }

    setEmailInput('');
    setEmailSuggestions([]);
    
  };

  const removeSelectedItem = (index) => {
    const updatedEmails = [...selectedEmails];
    const updatedNames = [...selectedNames];
    const updatedImages = [...selectedImages];
    const updatedIds = [...selectedIds];

    // Remove the item at the specified index
    updatedEmails.splice(index, 1);
    updatedNames.splice(index, 1);
    updatedImages.splice(index, 1);
    updatedIds.splice(index, 1);

    // Update the state with the new arrays
    setEmailSuggestions(updatedEmails);
    setNameSuggestions(updatedNames);
    setImageSuggestions(updatedImages);
    setIdSuggestions(updatedIds);

    // Update the state with the new selected arrays
    setSelectedEmails(updatedEmails);
    setSelectedNames(updatedNames);
    setSelectedImages(updatedImages);
    setSelectedIds(updatedIds);    
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
        <ActivityIndicator size="large" color="#0000ff" testID="loadingIndicator"/>
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
    <ScrollView style={styles.scrollContainer}>
    <View style={styles.container}>
      <TextInput
        style={styles.emailInput}
        value={emailInput}
        onChangeText={handleEmailInput}
        placeholder="Enter email to share task"
        testID='getTestEmail'
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
            horizontal
          />
        </View>
      )}
      <View style={styles.selectedEmailsContainer}>
        {selectedEmails.map((email, index) => (
          <View key={index} style={styles.selectedContainer}>
            
              <Image source={{ uri: selectedImages[index] }} style={styles.selectedImage} />
              <Text style={styles.selectedName}>{selectedNames[index]}</Text>
              <TouchableOpacity onPress={() => removeSelectedItem(index)} style={styles.removeButton}>
                <Ionicons name="remove-circle-outline" size={24} color="red" />
              </TouchableOpacity>
            
            <TouchableOpacity style={styles.emailContainer} key={index} onPress={() => handlePress(email)}>
              <Text style={styles.selectedEmail}>Assign</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.selectedEmailsContainer}>
        {sharedEmails.map((email, indexx) => (
          <View key={indexx} style={styles.selectedContainer}>
          
            <Image source={{ uri: sharedImages[indexx] }} style={styles.selectedImage} />
            <Text style={styles.selectedName} testID='getSharedTestEmail'>{sharedNames[indexx]}</Text>
         
          <TouchableOpacity testID='testing-assign' style={styles.emailContainer} key={indexx} onPress={() => handlePress(email)}>
            <Text style={styles.selectedEmail}>Assign</Text>
          </TouchableOpacity>
        </View>
        ))}
      </View>
      
      {selectedContact && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          testID="test-modal"
        >
          <ScrollView testID="modal-scroll">
          <View style={styles.modalContainer} testID="modal-container">
            <View style={styles.modalContent}>
              <Text style={styles.selectedContactName} testID="modal-contact-name">{selectedContact.name}</Text>
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTaskItem}
                contentContainerStyle={styles.taskListContainer}
                testID="modal-task-list"
              />
              <View style={styles.buttonContainer} testID="modal-buttons">
                <Button title="Share Task" color="#ef9c66" onPress={handleShare} testID="share-button" />
                <Button title="Close" color="#78aba8" onPress={() => setModalVisible(false)} testID="close-button" />
              </View>
            </View>
          </View>
          </ScrollView>
        </Modal>
      )}
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 10,
  },
  listContainer: {
    alignItems: 'flex-start',
  },
  personDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
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
  emailContainer: {
    flexDirection: 'row',
    borderColor: '#cce0ac',
    backgroundColor:'#cce0ac',
    borderWidth: 2,
    width:'20%',
    margin: '1%',
    padding: '2%',
    fontWeight: '400',
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d3d3d3',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,

    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  selectedImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginRight: 5,
  },
  selectedEmailsContainer: {
    flexDirection: 'column',
    margin: 10,
    marginVertical: 10,
  },
  selectedEmail: {
    fontSize: 10,
    fontWeight:'bold',
    marginBottom: 5,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  removeButton: {
    marginLeft: 10,
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
});

export default PeopleScreen;