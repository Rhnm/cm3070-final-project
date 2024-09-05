import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TextInput, FlatList, Modal, Button,RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { baseURL } from '../apiConfig'; // Make sure this path is correct
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from './ThemeContext';

const CalendarScreen = () => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [type, setType] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      if(userId != null){
        const response = await axios.get(`${baseURL}:3001/resources/gettasks/${userId}`);
        const tasksFromDB = response.data;

        // Fetch shared tasks
        const sharedTasksResponse = await axios.get(`${baseURL}:3001/resources/getsharedtasks/${userId}`);
        const sharedTasksFromDB = sharedTasksResponse.data;

        // Combine tasks and shared tasks
        const allTasks = [...tasksFromDB, ...sharedTasksFromDB];
  
        // Format dates to YYYY-MM-DD
        const formattedTasks = tasksFromDB.map(task => {
          const dueDate = new Date(task.due_date);
          const formattedDate = dueDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
          return { ...task, due_date: formattedDate };
        });

        // Format dates to YYYY-MM-DD for shared tasks
        const formattedSharedTasks = sharedTasksFromDB.map(task => {
          const dueDate = new Date(task.due_date);
          const formattedDate = dueDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
          return { ...task, due_date: formattedDate, isShared: true };
        });

  
        setTasks(formattedTasks);
        setSharedTasks(formattedSharedTasks);
  
        // Prepare marked dates
        const markedDatesTemp = {};
        [...formattedTasks, ...formattedSharedTasks].forEach((task) => {
          if (task.due_date) {
            // Initialize or update the entry for the date
            if (!markedDatesTemp[task.due_date]) {
              markedDatesTemp[task.due_date] = {
                selected: true,
                marked: true,
                dots: [] // Use an array to hold multiple dots
              };
            }
            
            // Add the appropriate dot color based on whether the task is shared
            const dotColor = task.isShared ? '#b60071' : 'orange';
            if (!markedDatesTemp[task.due_date].dots.some(dot => dot.color === dotColor)) {
              markedDatesTemp[task.due_date].dots.push({ color: dotColor });
            }
          }
        });
        setMarkedDates(markedDatesTemp);
  
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refreshing when done
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('isLoggedIn');
        const uid = await AsyncStorage.getItem('uid');
        setUserId(uid);
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
      if (userId) {
        fetchTasks();
      }
    }, [userId,fetchTasks])
  );

  /* useEffect(() => {
    // Initial fetch on component mount
    if (userId) {
      fetchTasks();
    }
  }, [userId]); */

  const onDayPress = (day) => {
    const tasksForDate = tasks.filter((task) => task.due_date === day.dateString);
    const sharedTasksForDate = sharedTasks.filter((task) => task.due_date === day.dateString);
    setSelectedDate([...tasksForDate, ...sharedTasksForDate]);
  };

  

  const handleEdit = async () => {
    if (editedTask) {
      try {
        await axios.put(`${baseURL}:3001/resources/updatetask/${editedTask.id}`, {
          title,
          description,
          priority,
          timeframe,
          type,
          dueDate: dueDate.toISOString().split('T')[0] // Format date to YYYY-MM-DD
        });
        Alert.alert('Success', 'Task updated successfully!');
        setEditModalVisible(false);
        fetchTasks(); // Refresh tasks
      } catch (error) {
        console.error('Error updating task:', error);
        Alert.alert('Error', 'Failed to update task');
      }
    }
  };

  const handleDelete = async (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await axios.delete(`${baseURL}:3001/resources/deletetask/${taskId}`);
              Alert.alert('Success', 'Task deleted successfully!');
              setSelectedDate(prev => prev.filter(task => task.id !== taskId)); // Remove from selected tasks
              fetchTasks(); // Refresh tasks
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };




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

  const sortedSelectedDate = selectedDate.sort((a, b) => {
    if (a.isShared && !b.isShared) {
      return -1; // Move shared items to the top
    } else if (!a.isShared && b.isShared) {
      return 1; // Keep regular items below shared items
    } else {
      return 0; // Keep original order for items with the same type
    }
  });

  const shared_Tasks = selectedDate.filter(task => task.isShared);
  const regular_Tasks = selectedDate.filter(task => !task.isShared);

  const uniqueKey = (item) => {
    // Generate a unique key by combining id and a timestamp
    return item.id + "_" + new Date().getTime();
  };

  const allTasks = [
    ...regular_Tasks.map(task => ({ ...task, isShared: false })),  // Mark regular tasks
    ...shared_Tasks.map(task => ({ ...task, isShared: true }))     // Mark shared tasks
  ];
  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

   /* const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (userId) {
        fetchTasks();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [userId]); */
  
  

  return (
    <View style={[styles.container,{backgroundColor: theme === 'dark' ? '#333' : '#fff', }]}>
    <View style={styles.legendContainer}>
      <View style={styles.legendItem}>
        <View style={[styles.legendColorBox, { backgroundColor: 'orange' }]} />
        <Text style={[styles.legendText,{color: theme === 'dark' ? '#fff' : '#000', }]}>Regular Task</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendColorBox, { backgroundColor: '#b60071' }]} />
        <Text style={[styles.legendText,{color: theme === 'dark' ? '#fff' : '#000', }]}>Shared Task</Text>
      </View>
    </View>
    <View style={[styles.container,{backgroundColor: theme === 'dark' ? '#333' : '#fff', }]} testID="loaded-calendar">
      <View key={theme.mode}>
      <Calendar
        onDayPress={onDayPress}
        backgroundColor={theme === 'dark' ? '#333' : '#fff'}
        calendarBackground={theme === 'dark' ? '#333' : '#fff'}
        markedDates={markedDates}
        markingType={'multi-dot'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        theme={{
          backgroundColor: theme === 'dark' ? '#333' : '#fff',
          calendarBackground: theme === 'dark' ? '#333' : '#fff',
          textSectionTitleColor: theme === 'dark' ? '#fff' : '#000',
          dayTextColor: theme === 'dark' ? '#fff' : '#000',
          todayTextColor: theme === 'dark' ? '#ff6347' : '#ff6347',
          selectedDayBackgroundColor: theme === 'dark' ? '#555' : '#ddd',
          selectedDayTextColor: theme === 'dark' ? '#fff' : '#000',
          monthTextColor: theme === 'dark' ? '#fff' : '#000',
          arrowColor: theme === 'dark' ? '#fff' : '#000',
          textDisabledColor: theme === 'dark' ? '#555' : '#d9e1e8',
          dotColor: theme === 'dark' ? '#fff' : '#000',
          selectedDotColor: theme === 'dark' ? '#fff' : '#000',
        }}
      />
      </View>
      
      <FlatList
  style={styles.taskList}
  data={allTasks}
  keyExtractor={(item) => uniqueKey(item)}
  renderItem={({ item }) => (
    <View style={[styles.taskCard, { backgroundColor: theme === 'dark' ? '#333' : '#fff3da' },{ borderColor: theme === 'dark' ? '#fff' : '#7E64FF' },{ shadowColor: theme === 'dark' ? '#fff' : '#7E64FF' }]}>
      <View>
        <Text style={item.isShared ? styles.sharedHeader : styles.regularHeader}>
          {item.isShared ? 'SHARED' : 'REGULAR'}
        </Text>
      </View>
      <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#000' }]}>{item.title}</Text>
      <Text style={[styles.description, { color: theme === 'dark' ? '#fff' : '#000' }]}>{item.description}</Text>
      <Text style={[styles.priority, { color: theme === 'dark' ? '#fff' : '#000' }]}>Priority: {item.priority}</Text>
      <Text style={[styles.priority, { color: theme === 'dark' ? '#fff' : '#000' }]}>TimeFrame: {item.timeframe} minutes</Text>
      <Text style={[styles.taskType, { color: theme === 'dark' ? '#fff' : '#000' }]}>Task Type: {item.type}</Text>
      <Text style={[styles.taskStatus, item.status === 'Completed' ? styles.completed : styles.pending]}>
        Status: {item.status}
      </Text>
      <Text style={[styles.dueDate,{ color: theme === 'dark' ? '#fff' : '#000' }]}>Due Date: {item.due_date}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <FontAwesome5 name="trash" size={30} color="#d9534f" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          setEditedTask(item);
          setTitle(item.title);
          setDescription(item.description);
          setPriority(item.priority);
          setTimeframe(item.timeframe);
          setType(item.type);
          setDueDate(new Date(item.due_date)); // Convert to Date object
          setEditModalVisible(true);
        }} style={styles.iconContainer}>
          <FontAwesome5 name="edit" size={30} color="#7E64FF" />
        </TouchableOpacity>
      </View>
    </View>
  )}
/>
        

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide">
        <ScrollView style={[styles.scrollContainer,{backgroundColor: theme === 'dark' ? '#333' : '#fff'}]}>
          <View style={[styles.modalContainer,{ backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
            <Text style={[styles.modalTitle,{ color: theme === 'dark' ? '#fff' : '#000' }]}>Edit Task</Text>
            <TextInput
              style={[styles.input,{ color: theme === 'dark' ? '#fff' : '#000' }]}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input,{ color: theme === 'dark' ? '#fff' : '#000' }]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />
            <Picker
              selectedValue={priority}
              style={[styles.pickerContainer,{ color: theme === 'dark' ? '#fff' : '#000' }]}
              onValueChange={(itemValue) => setPriority(itemValue)}
              itemStyle = {{backgroundColor: theme === 'dark' ? '#ccc' : '#fff'}}
            >
              <Picker.Item 
              label="Low" 
              value="Low" 
              itemStyle = {{backgroundColor: theme === 'dark' ? '#ccc' : '#fff'}}
              />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>
            <Picker
              selectedValue={type}
              style={[styles.pickerContainer,{ color: theme === 'dark' ? '#fff' : '#000' }]}
              onValueChange={(itemValue) => setType(itemValue)}
            >
              <Picker.Item label="Professional" value="Professional" />
              <Picker.Item label="Personal" value="Personal" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
            <TextInput
              style={[styles.input,{ color: theme === 'dark' ? '#fff' : '#000' }]}
              placeholder="Timeframe (minutes)"
              value={timeframe}
              keyboardType="numeric"
              onChangeText={setTimeframe}
            />
            <View>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={[styles.datePickerText,{ color: theme === 'dark' ? '#fff' : '#000' }]}>Due Date: {dueDate.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  textColor={theme === 'dark' ? '#fff' : '#ccc '}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDueDate(selectedDate);
                  }}
                  style={{
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                  }}
                />
              )}
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Cancel" color="#ef9c66" onPress={() => setEditModalVisible(false)} />
              <Button title="Save" color="#78aba8" onPress={handleEdit} />
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  completecontainer:{
    flexDirection:'row',
    justifyContent:'space-between',
  },
  completeButton: {
    marginTop: 10,
    fontWeight: 'bold',
    padding: 10,
    borderRadius:5,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection:'row',
    justifyContent:'space-between',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
  },
  datePickerText: {
    fontSize: 18,
    color: 'blue',
    marginBottom: 20,
    borderWidth:1,
    borderColor: '#ccc',
    padding:15,
  },
  scrollContainer: {
    flexGrow:1,
    
    width:"100%",
  },
  flatListContainer: {
    flex:1,
    width: '100%', // Ensures the FlatList takes up the full width
  },
  taskCard: {
    marginBottom: 20,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  priority: {
    fontSize: 14,
    marginBottom: 5,
    color: '#888',
  },
  dueDate: {
    fontSize: 14,
    marginBottom: 5,
  },
  taskType: {
    fontSize: 14,
    marginBottom: 5,
    color: '#888',
  },
  taskStatus: {
    fontSize: 14,
    marginBottom: 5,
  },
  completed: {
    color: 'green',
  },
  pending: {
    color: 'red',
  },
  sharedHeader: {
    backgroundColor: '#c0c78c',
    padding: 4,
    marginBottom: 5,
    color: 'white',
    borderRadius:5,
  },
  regularHeader: {
    backgroundColor: '#7e64ff',
    padding: 4,
    marginBottom: 5,
    color: 'white',
    borderRadius:5,
  },
  legendContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    padding: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendColorBox: {
    width: 10,
    height: 10,
    borderRadius: 10, // To make it a circle
    marginRight: 5,
  },
  legendText: {
    fontSize: 10,
  },
});

export default CalendarScreen;
