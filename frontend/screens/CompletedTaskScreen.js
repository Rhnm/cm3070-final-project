import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

const CompletedTaskScreen = () => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);



  const fetchCompletedTasks = async () => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getCompletedTasks/${userId}`);
      setTasks(response.data);
    } catch (error) {
      Alert.alert('Error fetching completed tasks:', error);
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const uid = await AsyncStorage.getItem('uid');
      setUserId(uid);
    };
    fetchUserId();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCompletedTasks();
    }
  }, [userId]);

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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}
      onPress={() => openModal(item)}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <MaterialIcons name="done" size={24} color="green" />
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.dueDate}>Task Priority: {item.priority}</Text>
      <Text style={styles.dueDate}>Task type: {item.type}</Text>
      <Text style={styles.dueDate}>TimeFrame: {item.timeframe} minutes</Text>
      <Text style={styles.dueDate}>Due Date: {formatDueDate(item.due_date)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
      {tasks.length === 0 ? (
        <View style={[styles.noTasksContainer, { backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
          <FontAwesome5 name="tasks" size={48} color="green" />
          <Text style={styles.noTasksText}>No completed tasks yet!</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
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
              <Text style={styles.dueDate}>Task Priority: {selectedTask.priority}</Text>
              <Text style={styles.dueDate}>Task type: {selectedTask.type}</Text>
              <Text style={styles.dueDate}>TimeFrame: {selectedTask.timeframe} minutes</Text>
              <Text style={styles.modalDueDate}>Due Date: {formatDueDate(selectedTask.due_date)}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    elevation: 2,
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
    color: '#666',
  },
  description: {
    marginBottom: 10,
    fontSize: 14,
    color: '#666',
  },
  dueDate: {
    marginBottom: 5,
    fontSize: 14,
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
  closeButton: {
    marginTop: 10,
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CompletedTaskScreen;
