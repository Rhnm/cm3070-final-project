import React, { useState,useEffect,useCallback } from 'react'; 
import { View, TextInput, Button, StyleSheet,Image, ActivityIndicator,FlatList, Platform,TouchableOpacity,Modal, Text, Alert, ScrollView } from 'react-native'; 
import { Picker } from '@react-native-picker/picker';
import CheckBox from 'expo-checkbox';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';
import { useTheme } from './ThemeContext';
import { Ionicons,FontAwesome } from '@expo/vector-icons';

const NewTaskScreen = () => { 
  // Initializing states using the useState hook
  const [title, setTitle] = useState(''); 
  const { theme } = useTheme();
  const [description, setDescription] = useState(''); 
  const [dueDate, setDueDate] = useState(null); 
  const [priority, setPriority] = useState('Low'); 
  const [timeframe, setTimeframe] = useState(''); 
  const [taskType, setTaskType] = useState('Personal'); 
  const [showDatePicker, setShowDatePicker] = useState(false); 
  const [taskTypes, setTaskTypes] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userIdFrom, setUserIdFrom] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState([]); 
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const [idSuggestions, setIdSuggestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [imageSuggestions, setImageSuggestions] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);

  const [isVisible, setIsVisible] = useState(false);
  const [taskId, setTaskId] = useState('');


  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('isLoggedIn');
        const uid = await AsyncStorage.getItem('uid');
        setUserIdFrom(uid);
        setIsLoggedIn(value === 'true');
      } catch (error) {
        Alert.alert('Error checking login status:', error);
      } finally {
        setLoading(false); // Stopping loading spinner even if there's an error
      }
    };

    checkLoginStatus();
  }, []);
  
  useEffect(() => {
    // Fetching task types from the backend
    const fetchTaskTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}:3001/resources/tasktypes`);
        if (Array.isArray(response.data)) {
          setTaskTypes(response.data);
        } else {
          Alert.alert('Error', 'Unexpected data format for task types');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch task types');
      }
    };

    const fetchPriorities = async () => {
      try {
        const response = await axios.get(`${baseURL}:3001/resources/priority`);
        if (Array.isArray(response.data)) {
          setPriorities(response.data);
        } else {
          Alert.alert('Error', 'Unexpected data format for priorities');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch priorities');
      }
    };
    const fetchUserId = async () => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        if (uid !== null) {
          setUserId(uid); 
        } else {
          Alert.alert('No user ID found');
        }
      } catch (error) {
        Alert.alert('Error fetching user ID:', error);
      }
    };

    fetchTaskTypes();
    fetchPriorities();
    fetchUserId();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userIdFrom) {
        fetchTasks();
      fetchContacts();
      fetchSharedUsers();
      }
    }, [userIdFrom,fetchTasks,fetchSharedUsers])
  );

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getUsers/${userIdFrom}`);
      setContacts(response.data);
    } catch (error) {
      Alert.alert('Error fetching contacts:', error);
    } 
  };

  const fetchSharedUsers = async () => {
    try{
      const response = await axios.get(`${baseURL}:3001/resources/getSharedUsers/${userIdFrom}`);
      setSharedUsers(response.data);
    }catch(error){
      Alert.alert('Error fetching shared users:',error);
    }
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      if (userIdFrom != null) {
        const response = await axios.get(`${baseURL}:3001/resources/gettasks/${userIdFrom}`);
        setTasks(response.data);
      }
    } catch (error) {
      Alert.alert('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [userIdFrom]);

  const openDatePicker = () => { 
    setShowDatePicker(true); 
  };

  const handleDateChange = (event, selectedDate) => { 
    setShowDatePicker(false); 
    if (selectedDate) { 
      setDueDate(selectedDate); 
    }
  };

  const predictTaskPriority = async (description) => {
    try {
        // Sending a POST request to the prediction API with the task description
        const response = await axios.post(`${baseURL}:3001/predict`, { description });
        
        // Setting the priority state with the received prediction
        setPriority(response.data.priority);
    } catch (error) {
        // Showing an alert to the user indicating that the prediction failed
        Alert.alert('Error', 'Failed to predict task priority: ' + error.message);
    }
};

const predictTaskTimeframe = async (description) => {
  try {
      // Sending a POST request to the prediction API with the task description
      const response = await axios.post(`${baseURL}:3001/predictTimeframe`, { description });
      
      // Getting the predicted timeframe
      let predictedTimeframe = response.data.timeframe;

      // Rounding off to the nearest whole number and ensure it's a positive value
      const roundedTimeframe = Math.abs(Math.round(predictedTimeframe));

      // Setting the rounded timeframe
      setTimeframe(roundedTimeframe);
      
  } catch (error) {
      Alert.alert('Error', 'Failed to predict task priority: ' + error.message);
  }
};

const sanitizeData = async (data) => {
  // Trimming whitespace and removing special characters
  return {
    ...data,
    title: data.title.trim(),
    description: data.description.trim(),
    user_id: userId,
    timeframe: timeframe,
  };
};

const validateInput = () => {
  if (title.trim() === '') {
    Alert.alert('Validation Error', 'Task Title is required.');
    return false;
  }
  if (description.trim() === '') {
    Alert.alert('Validation Error', 'Task Description is required.');
    return false;
  }
  if (dueDate === null) {
    Alert.alert('Validation Error', 'Task Due Date is required.');
    return false;
  }
  if (taskType.trim() === '') {
    Alert.alert('Validation Error', 'Task Type is required.');
    return false;
  }
  return true;
};

  const saveTask = async () => { 
    const sanitizedData = sanitizeData({title, description, dueDate, priority, taskType, timeframe });
    try {
      if (validateInput()) {
        const response = await axios.post(`${baseURL}:3001/resources/savetask`, sanitizedData);
        if(response.data.message === "Data inserted successfully!"){
          setTaskId(response.data.taskId);
          if(selectedIds){
            await handleShare(response.data.taskId);
          }
          Alert.alert('Success', 'Task saved successfully');
          setTitle('');
          setDescription('');
          setDueDate(null);
          setPriority('Low');
          setTaskType('Personal');
          setShowDatePicker(false);
          setUserId('');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
    }
  };

  const handleShare = async (taskId) => {
    try {
        const response = await axios.post(`${baseURL}:3001/resources/shareTask`, {
            taskId,
            userIdFrom,
            selectedIds,
          });
      
      setSelectedEmails([]);
      setSelectedIds([]);
      setSelectedImages([]);
      setSelectedNames([]);
      setSelectedContact([]);
      setEmailInput('');
      setSelectedTask([]);
    } catch (error) {
      Alert.alert('Error sharing tasks:', error.message);
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
        Alert.alert('Error fetching email suggestions:', error);
      }
    } else {
      setIdSuggestions([]);
      setEmailSuggestions([]);
      setNameSuggestions([]);
      setImageSuggestions([]);
    }
  };

  const handleSelectEmail = (email) => {

    // Finding the index of the selected email in the suggestions list
    const index = emailSuggestions.indexOf(email);
    if (selectedEmails.includes(email)) {
      Alert.alert('Already Added', 'This email has already been added.');
    } else {
      if (index !== -1) {
        // Getting the corresponding name and image using the index
        const selectedId = idSuggestions[index];
        const selectedName = nameSuggestions[index];
        const selectedImage = imageSuggestions[index];

        // Updating state for selected emails, names, and images
        setSelectedIds([...selectedIds, selectedId]);
        setSelectedEmails([...selectedEmails, email]);
        setSelectedNames([...selectedNames, selectedName]);
        setSelectedImages([...selectedImages, selectedImage]);
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

    // Removing the item at the specified index
    updatedEmails.splice(index, 1);
    updatedNames.splice(index, 1);
    updatedImages.splice(index, 1);
    updatedIds.splice(index, 1);

    // Updating the state with the new arrays
    setEmailSuggestions(updatedEmails);
    setNameSuggestions(updatedNames);
    setImageSuggestions(updatedImages);
    setIdSuggestions(updatedIds);

    // Updating the state with the new selected arrays
    setSelectedEmails(updatedEmails);
    setSelectedNames(updatedNames);
    setSelectedImages(updatedImages);
    setSelectedIds(updatedIds);    
  };

  const toggleVisibility  = () => {
    setIsVisible(!isVisible);
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
        <ActivityIndicator size="large" color="#0000ff" testID="loadingIndicator" />
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
    <ScrollView style={[styles.scrollContainer,{backgroundColor: theme === 'dark' ? '#333' : '#fff', }]}>
      <View style={[styles.container,{backgroundColor: theme === 'dark' ? '#333' : '#fff', }]}> 
        <View style={styles.labelContainer}>
          
          {/* Plus icon to show/hide email input */}
          <TouchableOpacity style={styles.iconContainer} onPress={toggleVisibility}>
            <Ionicons name={isVisible ? 'remove-circle-outline' : 'add-circle-outline'} size={24} color="#4630EB" />
            <Text style={[styles.iconLabel,{color: theme === 'dark' ? '#fff' : '#000'}]}>Assign Tasks:</Text>
          </TouchableOpacity>
          {/* Conditionally rendering the email input field */}
          {isVisible && (
            <TextInput
              style={[styles.emailInput,{color: theme === 'dark' ? '#fff' : '#000'}]}
              value={emailInput}
              onChangeText={handleEmailInput}
              placeholder="Enter email to share task"
              placeholderTextColor={theme === 'dark' ? '#fff' : '#000'}
            />
          )}
          {emailSuggestions.length > 0 && (
            <View style={[styles.suggestionsContainer,{color: theme === 'dark' ? '#fff' : '#000'}]}>
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
        </View>

        <View style={[styles.selectedEmailsContainer,{backgroundColor: theme === 'dark' ? 'transparent' : 'transparent'}]}>
          {selectedEmails.map((email, index) => (
            <View key={index} style={styles.selectedContainer}>
              <Image source={{ uri: selectedImages[index] }} style={styles.selectedImage} />
              <Text style={styles.selectedName}>{selectedNames[index]}</Text>
              <TouchableOpacity onPress={() => removeSelectedItem(index)} style={styles.removeButton}>
                <Ionicons name="remove-circle-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.labelContainer}>
          <Text style={[styles.label,{color: theme === 'dark' ? '#fff' : '#000'}]}>Task Type</Text>
          <View style={styles.pickerContainer}>
            <Picker 
              selectedValue={taskType} 
              style={[styles.picker,{color: theme === 'dark' ? '#fff' : '#000'}]} 
              onValueChange={(itemValue) => setTaskType(itemValue)}
              testID='taskTypePicker'
            >
              {taskTypes.map((type) => (
                <Picker.Item key={type.id} label={type.name} value={type.name} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={[styles.labelContainer,{color: theme === 'dark' ? '#fff' : '#000'}]}>
          <Text style={[styles.label,{color: theme === 'dark' ? '#fff' : '#000'}]}>Task Priority</Text>
          <View style={styles.pickerContainer}>
            <Picker 
              selectedValue={priority} 
              style={[styles.picker,{color: theme === 'dark' ? '#fff' : '#000'}]} 
              onValueChange={(itemValue) => setPriority(itemValue)}
            >
              {priorities.map((priority) => (
                <Picker.Item key={priority.id} label={priority.name} value={priority.name} />
              ))}
            </Picker>
          </View>
        </View>
        
        <TextInput 
          style={[styles.input,{color: theme === 'dark' ? '#fff' : '#000'}]} 
          placeholder="Task Title" 
          value={title} 
          placeholderTextColor={theme === 'dark' ? '#fff' : '#000'}
          onChangeText={setTitle} 
        />
        <TextInput 
          style={[styles.input,{color: theme === 'dark' ? '#fff' : '#000'}]} 
          placeholder="Task Description" 
          placeholderTextColor={theme === 'dark' ? '#fff' : '#000'}
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            
          }} 
          onEndEditing={(event)=>{
            predictTaskPriority(event.nativeEvent.text);
            predictTaskTimeframe(event.nativeEvent.text);
          }} 
          multiline 
        />
        <View style={styles.labelContainer}>
          <Text style={[styles.label,{color: theme === 'dark' ? '#fff' : '#000'}]}>Task Due Date</Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme === 'dark' ? '#fff' : '#7E64FF' }]} 
            onPress={openDatePicker}
          >
            <Text style={[styles.buttonText, { color: theme === 'dark' ? '#000' : '#fff' }]}>Select Due Date</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              backgroundColor={theme === 'dark' ? '#fff' : '#000'}
              mode="date"
              onChange={handleDateChange}
            />
          )}
          {dueDate && <Text>Selected Date: {dueDate.toDateString()}</Text>}
        </View>

        <View style={styles.labelContainer}>

          <Text style={[styles.label,{color: theme === 'dark' ? '#fff' : '#000'}]}><FontAwesome name='microchip' size={15} color="#7E64FF" /> AI Predicted Timeframe</Text>
          <Text style={[styles.timeframeText,{color: theme === 'dark' ? '#fff' : '#000'}]}>
            {timeframe ? `${timeframe} minutes` : 'Not predicted yet'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme === 'dark' ? '#fff' : '#7E64FF' }]} 
          onPress={saveTask}
        >
          <Text style={[styles.buttonText, { color: theme === 'dark' ? '#000' : '#fff' }]}>Save Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
  },
  scrollContainer: {
    flex: 1,
    
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 5, 
    padding: 10, 
    marginVertical: 10, 
    width: '100%', 
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
    ...Platform.select({
      ios: {
        height: 200,
        marginBottom: 10,
      },
    }),
  },
  picker: { 
    height: 50, 
    width: '100%', 
  },
  labelContainer: {
    width: '100%',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    alignItems: 'flex-start',
  },
  personContainer: {
    alignItems: 'left',
    width: "100%",
    backgroundColor:"#ccc",
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
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconLabel: {
    marginLeft: 8,
    fontSize: 16,
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
    position: 'absolute', 
    top: 50, 
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 1000, 
    width:'80%',
  },
  suggestion: {
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  selectedEmailsContainer: {
    width: '100%',
  },
  selectedEmail: {
    fontSize: 16,
    marginBottom: 5,
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d3d3d3',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
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
  selectedEmail: {
      fontSize: 14,
      color: '#666',
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
  button: {
    padding: 10,             
    borderRadius: 5,         
    alignItems: 'center',    
    justifyContent: 'center', 
    marginVertical: 10,      
  },
  buttonText: {
    color: '#fff',           
    fontSize: 16,            
    fontWeight: 'bold',      
  },
});

export default NewTaskScreen;
