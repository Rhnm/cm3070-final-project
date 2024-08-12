import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TextInput, FlatList, Modal, Button, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { useNavigation,useFocusEffect } from '@react-navigation/native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig'; // Make sure this path is correct

const CalendarScreen = () => {
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
  const [userId,setUserId] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      if(userId!=null){
        const response = await axios.get(`${baseURL}:3001/resources/gettasks/${userId}`);
        const tasksFromDB = response.data;
        console.log(tasksFromDB);

        // Fetch shared tasks
        const sharedTasksResponse = await axios.get(`${baseURL}:3001/resources/getsharedtasks/${userId}`);
        const sharedTasksFromDB = sharedTasksResponse.data;
        console.log('Shared tasks from DB:', sharedTasksFromDB);

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
            markedDatesTemp[task.due_date] = { selected: true, marked: true, dotColor: task.isShared ? '#b60071' : 'orange' };
          }
        });
        setMarkedDates(markedDatesTemp);
  
        // Debugging: Check formatted tasks and marked dates
        console.log('Formatted Tasks:', formattedTasks);
        console.log('Formatted Shared Tasks:', formattedSharedTasks);
        console.log('Marked Dates:', markedDatesTemp);
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

  const onDayPress = (day) => {
    const tasksForDate = tasks.filter((task) => task.due_date === day.dateString);
    const sharedTasksForDate = sharedTasks.filter((task) => task.due_date === day.dateString);
    setSelectedDate([...tasksForDate, ...sharedTasksForDate]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleEdit = async () => {
    if (editedTask) {
      try {
        await axios.put(`${baseURL}:3001/resources/updatetask/${editedTask.id}`, {
          title,
          description,
          priority
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

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
      <ScrollView style={styles.scrollContainer}>
      {selectedDate.length > 0 && (
        <FlatList
        style={styles.regularList}
          data={regular_Tasks}
          keyExtractor={(item) => uniqueKey(item)}
          renderItem={({ item }) => (
            
            <View style={styles.taskCard}>
              <View>
                <Text style={styles.regularHeader}>REGULAR</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.priority}>Priority: {item.priority}</Text>
              <Text style={styles.priority}>TimeFrame: {item.timeframe} minutes</Text>
              <Text style={styles.taskType}>Task Type: {item.type}</Text>
              <Text style={[styles.taskStatus, item.status === 'Completed' ? styles.completedStatus : styles.pendingStatus]}>
                Task Status: {item.status}
              </Text>
              <View style={styles.buttonContainer}>
                <Button title="Delete" color="#c5705d" onPress={() => handleDelete(item.id)} />
                <Button title="Edit" color="#4CAF50" onPress={() => {
                  setEditModalVisible(true);
                  setEditedTask(item);
                  setTitle(item.title);
                  setDescription(item.description);
                  setPriority(item.priority);
                  setTimeframe(item.timeframe);
                }} />
              </View>
            </View>
          )}
        />
        
      )}
      {selectedDate.length > 0 && (
        <FlatList
          style={styles.sharedList}
          data={shared_Tasks}
          keyExtractor={(item) => uniqueKey(item)}
          renderItem={({ item }) => (
            
            <View style={styles.taskCard}>
              <View>
                <Text style={styles.sharedHeader}>SHARED</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.priority}>Priority: {item.priority}</Text>
              <Text style={styles.priority}>TimeFrame: {item.timeframe} minutes</Text>
              <Text style={styles.taskType}>Task Type: {item.type}</Text>
              <Text style={[styles.taskStatus, item.status === 'Completed' ? styles.completedStatus : styles.pendingStatus]}>
                Task Status: {item.status}
              </Text>
              <View style={styles.buttonContainer}>
                <Button title="Delete" color="#c5705d" onPress={() => handleDelete(item.id)} />
                <Button title="Edit" color="#4CAF50" onPress={() => {
                  setEditModalVisible(true);
                  setEditedTask(item);
                  setTitle(item.title);
                  setDescription(item.description);
                  setPriority(item.priority);
                  setTimeframe(item.timeframe);
                }} />
              </View>
            </View>
          )}
        />
        
      )}
      </ScrollView>
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Priority"
              value={priority}
              onChangeText={setPriority}
            />
            <View style={styles.buttonContainer}>
            <Button title="Cancel" color="#ef9c66" onPress={() => setEditModalVisible(false)} />
            <Button title="Save Changes" color="#78aba8"  onPress={handleEdit} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  taskCard: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    marginBottom: 10,
    color: '#666',
    fontSize: 12,
  },
  priority: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#888',
  },
  taskType: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#888',
  },
  taskStatus: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  completedStatus: {
    color: 'green',
  },
  pendingStatus: {
    color: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sharedHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  regularHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
  },
});

export default CalendarScreen;
