import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, Modal, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  useEffect(() => {
  const fetchUserId = async () => {
    const uid = await AsyncStorage.getItem('uid');
    setUserId(uid);
  };
  fetchUserId();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchTasks();
        fetchSharedTasks();
      }
    }, [userId,fetchTasks])
  );

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getPendingTasks/${userId}`);
      setTasks(response.data);
      console.log("GetPendingTasks:" + response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchSharedTasks = async () => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getSharedUsersTasks/${userId}`);
      setSharedTasks(response.data);
      console.log("GetSharedTasks:" + response.data);
    } catch (error) {
      console.error('Error fetching shared tasks:', error);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await axios.put(`${baseURL}:3001/resources/completeTask/${taskId}`);
      Alert.alert('Success', 'Task marked as completed!');
      fetchTasks(); // Refresh task list after completing a task
      fetchSharedTasks(); // Refresh shared task list after completing a task
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const openModal = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTask(null);
  };

  const formatDueDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderItem = ({ item, isShared }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => openModal(item)}>
      <View style={styles.taskHeader}>
        <Text style={styles.title}>{item.title}</Text>
        {isShared && <MaterialIcons name="share" size={24} color="blue" />}
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.dueDate}>TimeFrame: {item.timeframe} minutes</Text>
      <Text style={styles.dueDate}>Due Date: {formatDueDate(item.due_date)}</Text>
      <Button
        title="Complete"
        onPress={() => completeTask(item.id)}
        color="#4CAF50"
      />
    </TouchableOpacity>
  );

  const combinedTasks = [...tasks.map(task => ({ ...task, isShared: false })), ...sharedTasks.map(task => ({ ...task, isShared: true }))];

  return (
    <View style={styles.container}>
      {combinedTasks.length === 0 ? (
        <View style={styles.noTasksContainer}>
          <FontAwesome5 name="tasks" size={48} color="green" />
          <Text style={styles.noTasksText}>All tasks completed!</Text>
        </View>
      ) : (
        <FlatList
          data={combinedTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderItem({ item, isShared: item.isShared })}
        />
      )}
      {combinedTasks.length === 0 && (
        <FontAwesome5 name="tasks" size={30} color="gray" style={styles.zeroTasksIcon} />
      )}

      {/* Modal for Task Details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          {selectedTask && (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedTask.title}</Text>
              <Text style={styles.modalDescription}>{selectedTask.description}</Text>
              <Text style={styles.modalDueDate}>Due Date: {formatDueDate(selectedTask.due_date)}</Text>
              <Button title="Close" onPress={closeModal} color="#d9534f" />
            </View>
          )}
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
  taskCard: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  dueDate: {
    marginBottom: 5,
    color: '#888',
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTasksText: {
    fontSize: 20,
    color: '#333',
    marginTop: 10,
  },
  zeroTasksIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    marginBottom: 10,
  },
  modalDueDate: {
    marginBottom: 20,
    color: '#888',
  },
});

export default HomeScreen;
