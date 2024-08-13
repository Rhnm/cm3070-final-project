import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import axios from 'axios';
import CheckBox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState([]);
  const [selectedType, setSelectedType] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [showOverdue, setShowOverdue] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const uid = await AsyncStorage.getItem('uid');
      setUserId(uid);
    };
    fetchUserId();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchTasks();
        fetchSharedTasks();
      }
    }, [userId, selectedPriority, selectedType, selectedDateRange, showOverdue])
  );

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getPendingTasks/${userId}`);
      const filteredTasks = filterTasks(response.data);
      setTasks(filteredTasks);
      console.log("GetPendingTasks:" + filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchSharedTasks = async () => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getSharedUsersTasks/${userId}`);
      const filteredSharedTasks = filterTasks(response.data);
      setSharedTasks(filteredSharedTasks);
      console.log("GetSharedTasks:" + filteredSharedTasks);
    } catch (error) {
      console.error('Error fetching shared tasks:', error);
    }
  };

  const filterTasks = (tasks) => {
    let filtered = tasks;

    // Example of logging dates to verify
    console.log('Current Date:', new Date());
      
    filtered.forEach(task => {
      console.log('Task Due Date:', new Date(task.due_date));
    });


    // Filter by priority
    if (selectedPriority.length > 0) {
      filtered = filtered.filter(task => selectedPriority.includes(task.priority));
    }

    // Filter by type
    if (selectedType.length > 0) {
      filtered = filtered.filter(task => selectedType.includes(task.type));
    }

    // Filter by date range
    if (selectedDateRange) {
      const now = new Date();
      const startDate = getStartDateForRange(selectedDateRange, now);
      filtered = filtered.filter(task => new Date(task.due_date) >= startDate);
    }

    // Filter overdue tasks
    if (showOverdue) {
      const now = new Date();
      console.log('Current Date:', now.toISOString());
      filtered = filtered.filter(task => {
        const dueDate = new Date(task.due_date);
        console.log('Task Due Date:', dueDate.toISOString());
        return dueDate < now && task.status === 'Pending';
      });
    }

    return filtered;
  };

  const getStartDateForRange = (range, now) => {
    switch (range) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'this_week':
        const startOfWeek = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1); // Adjust if today is Sunday
        return new Date(now.setDate(startOfWeek));
      case 'next_two_weeks':
        return new Date(now.setDate(now.getDate() + 14));
      case 'this_month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'next_month':
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      case 'next_two_months':
        return new Date(now.getFullYear(), now.getMonth() + 2, 1);
      case 'more_than_two_months':
        return new Date(now.setMonth(now.getMonth() + 2));
      default:
        return new Date(0); // Far past date
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

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const applyFilters = () => {
    fetchTasks(); // Refresh task list after applying filters
    fetchSharedTasks(); // Refresh shared task list after applying filters
    closeFilterModal();
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
      <Text style={styles.completeButton} onPress={() => completeTask(item.id)}>Complete</Text>
    </TouchableOpacity>
  );

  const combinedTasks = [...tasks.map(task => ({ ...task, isShared: false })), ...sharedTasks.map(task => ({ ...task, isShared: true }))];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openFilterModal} style={styles.filterIcon}>
        <MaterialIcons name="filter-list" size={30} color="black" />
      </TouchableOpacity>
      
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
              <Text style={styles.closeButton} onPress={closeModal}>Close</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeFilterModal}
      >
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModalContent}>
            <Text style={styles.filterModalTitle}>Filter Tasks</Text>
            
            <Text style={styles.filterModalSubtitle}>Priority</Text>
            {['High', 'Medium', 'Low'].map(priority => (
              <View key={priority} style={styles.filterCheckboxContainer}>
                <CheckBox
                  value={selectedPriority.includes(priority)}
                  onValueChange={() => {
                    setSelectedPriority(prev =>
                      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
                    );
                  }}
                />
                <Text style={styles.filterOptionText}>{priority}</Text>
              </View>
            ))}

            <Text style={styles.filterModalSubtitle}>Type</Text>
            {['Professional', 'Personal', 'Other'].map(type => (
              <View key={type} style={styles.filterCheckboxContainer}>
                <CheckBox
                  value={selectedType.includes(type)}
                  onValueChange={() => {
                    setSelectedType(prev =>
                      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                    );
                  }}
                />
                <Text style={styles.filterOptionText}>{type}</Text>
              </View>
            ))}
            
            <Text style={styles.filterModalSubtitle}>Date Range</Text>
            {['today', 'this_week', 'next_two_weeks', 'this_month', 'next_month', 'next_two_months', 'more_than_two_months'].map(range => (
              <View key={range} style={styles.filterCheckboxContainer}>
                <CheckBox
                  value={selectedDateRange === range}
                  onValueChange={() => setSelectedDateRange(selectedDateRange === range ? null : range)}
                />
                <Text style={styles.filterOptionText}>{range.replace(/_/g, ' ').toUpperCase()}</Text>
              </View>
            ))}

            <View style={styles.filterCheckboxContainer}>
              <CheckBox
                value={showOverdue}
                onValueChange={() => setShowOverdue(!showOverdue)}
              />
              <Text style={styles.filterOptionText}>Overdue</Text>
            </View>

            <TouchableOpacity onPress={applyFilters} style={styles.applyFiltersButton}>
              <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeFilterModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
  filterIcon: {
    alignSelf: 'flex-end',
    marginBottom: 10,
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
  filterModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterModalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  filterCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  filterOptionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  applyFiltersButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default HomeScreen;
