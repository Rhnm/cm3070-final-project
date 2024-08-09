import React, { useState,useEffect } from 'react'; 
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native'; 
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';

const NewTaskScreen = () => { // Define a functional component called NewTaskScreen
  // Initialize states for task title, description, duedate and priority using the useState hook
  const [title, setTitle] = useState(''); 
  const [description, setDescription] = useState(''); 
  const [dueDate, setDueDate] = useState(null); 
  const [priority, setPriority] = useState('Low'); 
  const [taskType, setTaskType] = useState('Personal'); 
  const [showDatePicker, setShowDatePicker] = useState(false); 
  const [taskTypes, setTaskTypes] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    // Fetch task types from the backend
    const fetchTaskTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}:3001/resources/tasktypes`);
        if (Array.isArray(response.data)) {
          setTaskTypes(response.data);
        } else {
          console.error('Task types data is not an array:', response.data);
          Alert.alert('Error', 'Unexpected data format for task types');
        }
      } catch (error) {
        console.error('Error fetching task types:', error);
        Alert.alert('Error', 'Failed to fetch task types');
      }
    };

    const fetchPriorities = async () => {
      try {
        const response = await axios.get(`${baseURL}:3001/resources/priority`);
        if (Array.isArray(response.data)) {
          setPriorities(response.data);
        } else {
          console.error('Priorities data is not an array:', response.data);
          Alert.alert('Error', 'Unexpected data format for priorities');
        }
      } catch (error) {
        console.error('Error fetching priorities:', error);
        Alert.alert('Error', 'Failed to fetch priorities');
      }
    };
    const fetchUserId = async () => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        if (uid !== null) {
          setUserId(uid); // Set the user ID in the state
          console.log('User ID:', uid);
        } else {
          console.log('No user ID found');
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchTaskTypes();
    fetchPriorities();
    fetchUserId();
  }, [userId]);

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
        // Log the description being sent for prediction
        console.log('Sending description for prediction:', description);
        
        // Send a POST request to the prediction API with the task description
        const response = await axios.post(`${baseURL}:3001/predict`, { description });
        
        // Log the received prediction response
        console.log('Received prediction:', response.data);
        
        // Set the priority state with the received prediction
        setPriority(response.data.priority);
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error:', error);

        // Show an alert to the user indicating that the prediction failed
        Alert.alert('Error', 'Failed to predict task priority: ' + error.message);
    }
};

const sanitizeData = async (data) => {
  // Basic sanitization: trimming whitespace and removing special characters
  return {
    ...data,
    title: data.title.trim(),
    description: data.description.trim(),
    user_id: userId,
  };
};

  const saveTask = async () => { 
    console.log('Task saved:', sanitizeData({title, description, dueDate, priority, taskType })); 
    const sanitizedData = sanitizeData({title, description, dueDate, priority, taskType });
    try {
      const response = await axios.post(`${baseURL}:3001/resources/savetask`, sanitizedData);
      console.log('Task saved Success:', response.data);
      if(response.data = "New data inserted !"){
        Alert.alert('Success', 'Task saved successfully');
        setTitle('');
        setDescription('');
        setDueDate(null);
        setPriority('Low');
        setTaskType('Personal');
        setShowDatePicker(false);
        setUserId('');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
    }
  };

  return ( 
    <View style={styles.container}> 
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Task Type</Text>
        <View style={styles.pickerContainer}>
          <Picker 
            selectedValue={taskType} 
            style={styles.picker} 
            onValueChange={(itemValue) => setTaskType(itemValue)}
          >
             {taskTypes.map((type) => (
              <Picker.Item key={type.id} label={type.name} value={type.name} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Task Priority</Text>
        <View style={styles.pickerContainer}>
          <Picker 
            selectedValue={priority} 
            style={styles.picker} 
            onValueChange={(itemValue) => setPriority(itemValue)}
          >
            {priorities.map((priority) => (
              <Picker.Item key={priority.id} label={priority.name} value={priority.name} />
            ))}
          </Picker>
        </View>
      </View>
      
      <TextInput 
        style={styles.input} 
        placeholder="Task Title" 
        value={title} 
        onChangeText={setTitle} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Task Description" 
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          
        }} 
        onEndEditing={(event)=>{
          predictTaskPriority(event.nativeEvent.text);
        }} 
        multiline 
      />
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Task Due Date</Text>
        <Button title="Select Due Date" onPress={openDatePicker} /> 
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            onChange={handleDateChange}
          />
        )}
        {dueDate && <Text>Selected Date: {dueDate.toDateString()}</Text>}
      </View>
      
      <Button title="Save Task" onPress={saveTask} />
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
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default NewTaskScreen;
