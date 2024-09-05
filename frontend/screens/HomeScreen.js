import React, { useEffect, useState, useCallback } from 'react';
import { View, Text,Image, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import axios from 'axios';
import { Audio } from 'expo-av';
import CheckBox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from './ThemeContext';
import { getAccessibilityCheckedState } from '@testing-library/react-native/build/helpers/accessibility';
import WeatherScreen from './WeatherScreen';
import { ScrollView } from 'react-native-gesture-handler';


const HomeScreen = () => {
  const { theme } = useTheme();
  const [sound, setSound] = useState(null);
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
  const [dbDuedate, setdbDuedate] = useState(null);

  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesAttachment, setNotesAttachment] = useState('');
  
  const [pomodoroTask, setPomodoroTask] = useState('');
  const [pomodoroTime, setPomodoroTime] = useState(25*60); // timeframe minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const [weatherModalVisible, setweatherModalVisible] = useState(false);


  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getPendingTasks/${userId}`);
      const filteredTasks = filterTasks(response.data);
      setTasks(filteredTasks);
      //console.log("GetPendingTasks:" + filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchSharedTasks = async () => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getSharedUsersTasks/${userId}`);
      const filteredSharedTasks = filterTasks(response.data);
      setSharedTasks(filteredSharedTasks);
      //console.log("GetSharedTasks:" + filteredSharedTasks);
    } catch (error) {
      console.error('Error fetching shared tasks:', error);
    }
  };

  const fetchTaskNotes = async (taskId) => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getNotesByTask/${taskId}`);
      if (response.status === 200) {
        console.log(response.data.note_text);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching task notes:', error);
    }
    return '';
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const uid = await AsyncStorage.getItem('uid');
      setUserId(uid);
      setPomodoroTask(null); // Resetting pomodoroTask on load
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTasks();
      fetchSharedTasks();
    }
  }, [userId,fetchTasks,fetchSharedTasks, selectedPriority, selectedType, selectedDateRange, showOverdue]);

  useEffect(() => {
    if (pomodoroTask) {
      handleStartTimer();
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pomodoroTask]);

  useFocusEffect(
    useCallback(() => {
      if (pomodoroTask) {
        handleStartTimer();
      }
    }, [setPomodoroTask])
  );

  

  const filterTasks = (tasks) => {
    let filtered = tasks;

    // Example of logging dates to verify
    //console.log('Current Date:', new Date());
      
    filtered.forEach(task => {
      setdbDuedate(new Date(task.due_date));
      //console.log('Task Due Date:', new Date(task.due_date));
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
      console.log("selected date range:" + selectedDateRange);
      const now = new Date();
      console.log("Now: " + now);

      // Get the start and end dates for the selected date range
      const { startDate, endDate } = getStartDateForRange(selectedDateRange, now);

      if (selectedDateRange === 'today') {
        const nowStartOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        
        filtered = filtered.filter(task => {
          const dbDueDate = new Date(task.due_date);
          const dueDateStartOfDay = new Date(Date.UTC(dbDueDate.getUTCFullYear(), dbDueDate.getUTCMonth(), dbDueDate.getUTCDate()));
          
          return dueDateStartOfDay.getTime() === nowStartOfDay.getTime();
        });
      } else {
        filtered = filtered.filter(task => {
          const dbDueDate = new Date(task.due_date);
          return dbDueDate >= startDate && dbDueDate <= endDate;
        });
      }
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
    const currentDate = new Date(now); // Use current date
    let startDate;
    let endDate;
  
    switch (range) {
      case 'today':
        startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
        endDate = startDate; // Today is both start and end date
        break;
  
      case 'this_week':
        const dayOfWeek = currentDate.getUTCDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        const startOfWeek = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))); // Monday start
        const endOfWeek = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), startOfWeek.getUTCDate() + 6)); // Sunday end
        startDate = startOfWeek;
        endDate = endOfWeek;
        break;
  
      case 'next_two_weeks':
        const nextWeekStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() + (7 - currentDate.getUTCDay()) + 1)); // Start of next week
        const nextTwoWeeksEnd = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), nextWeekStart.getUTCDate() + 13)); // End of next two weeks
        startDate = nextWeekStart;
        endDate = nextTwoWeeksEnd;
        break;
  
      case 'this_month':
        startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
        endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0)); // Last day of the current month
        break;
  
      case 'next_month':
        startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 1));
        endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 2, 0)); // Last day of the next month
        break;
  
      case 'next_two_months':
        startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 2, 1));
        endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 3, 0)); // Last day of the month two months later
        break;
  
      case 'more_than_two_months':
        startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 2));
        endDate = new Date(Date.UTC(currentDate.getUTCFullYear() + 1, currentDate.getUTCMonth() + 2, 0)); // End of the year + two months
        break;
  
      default:
        startDate = new Date(Date.UTC(0)); // Epoch start date
        endDate = new Date(Date.UTC(0)); // Epoch end date
    }
  
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
  
    return { startDate, endDate };
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

  const playSound = async () => {
    try {
      const { sound: soundObject } = await Audio.Sound.createAsync(
        require('../assets/sound/pomodoro_end.mp3') // Ensure you have a sound file in this path
      );
      setSound(soundObject);
      await soundObject.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const openModal = (task) => {
    setSelectedTask(task);
    setPomodoroTask(task);
    setPomodoroTime(task.timeframe * 60);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTask(null);
    setPomodoroTask(null);
    setPomodoroTime(null);
    resetTimer();
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
    <TouchableOpacity style={[styles.taskCard, { backgroundColor: theme === 'dark' ? '#333' : '#fff' }]} onPress={() => openModal(item)}>
      <View style={styles.taskHeader}>
        <Text style={styles.title}>{item.title}</Text>
        {isShared && <MaterialIcons name="share" size={24} color="blue" />}
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.dueDate}>Task Priority: {item.priority}</Text>
      <Text style={styles.dueDate}>Task type: {item.type}</Text>
      <Text style={styles.dueDate}>TimeFrame: {item.timeframe} minutes</Text>
      <Text style={styles.dueDate}>Due Date: {formatDueDate(item.due_date)}</Text>
      <Text style={styles.completeButton} onPress={() => completeTask(item.id)}>Complete</Text>
    </TouchableOpacity>
  );

  const combinedTasks = [...tasks.map(task => ({ ...task, isShared: false })), ...sharedTasks.map(task => ({ ...task, isShared: true }))];

  const startTimer = () => {
    if (timerRunning) return;
    setTimerRunning(true);
    const id = setInterval(() => {
      setPomodoroTime(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setTimerRunning(false);
          playSound(); // Play sound
          Alert.alert('Pomodoro Finished!', 'Great job!');
          return pomodoroTask ? pomodoroTask.timeframe * 60 : 25 * 60; // Default to 25 minutes if pomodoroTask is not set
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };
  
  const pauseTimer = () => {
    if (!timerRunning) return;
    clearInterval(intervalId);
    setTimerRunning(false);
  };
  
  const resetTimer = () => {
   
    setTimerRunning(false);
    if (pomodoroTask) {
      setPomodoroTime(pomodoroTask.timeframe * 60);
    }
    
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    startTimer();
  };

  


  const PomodoroTimer = () => (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>PulseTimer AI</Text>
      <Text style={styles.timerDisplay}>{formatTime(pomodoroTime)}</Text>
      <View style={styles.timerButtons}>
        <TouchableOpacity onPress={startTimer} style={styles.timerButton}>
          <Text style={styles.timerButtonText}>{timerRunning ? 'Running' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pauseTimer} style={styles.timerButton}>
          <Text style={styles.timerButtonText}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetTimer} style={styles.timerButton}>
          <Text style={styles.timerButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  const renderItemPomodoro = ({ item, isShared }) => (
    <TouchableOpacity testID='taskCard' style={[styles.taskCard, { backgroundColor: theme === 'dark' ? '#333' : '#fff3da' },{borderColor:theme === 'dark' ? '#555' : '#7E64FF'},{shadowColor:theme === 'dark' ? '#000' : '#7E64FF'}]} onPress={() => openModal(item)}>
      <View style={styles.taskHeader}>
        <Text style={[styles.title,{color: theme === 'dark' ? '#fff' : '#000'}]}>{item.title}</Text>
        {isShared && <MaterialIcons name="share" size={24} color={theme === 'dark' ? '#fff' : '#000'} />}
      </View>
      <Text style={[styles.description,{color: theme === 'dark' ? '#fff' : '#000'}]}>{item.description}</Text>
      <Text style={[styles.dueDate,{color: theme === 'dark' ? '#fff' : '#000'}]}><Text style={styles.initialTxt}>Task Priority:</Text>{item.priority}</Text>
      <Text style={[styles.dueDate,{color: theme === 'dark' ? '#fff' : '#000'}]}><Text style={styles.initialTxt}>Task type:</Text> {item.type}</Text>
      <Text style={[styles.dueDate,{color: theme === 'dark' ? '#fff' : '#000'}]}><Text style={styles.initialTxt}>TimeFrame:</Text> {item.timeframe} minutes</Text>
      <Text style={[styles.dueDate,{color: theme === 'dark' ? '#fff' : '#000'}]}><Text style={styles.initialTxt}>Due Date:</Text> {formatDueDate(item.due_date)}</Text>
      <View style={styles.completecontainer}>
      <TouchableOpacity onPress={() => completeTask(item.id)}>
        <Text style={[styles.completeButton,{backgroundColor:theme === 'dark' ? '#fff' : '#7E64FF'},{color:theme === 'dark' ? '#000' : '#fff'}]}> ✓ Complete</Text>
      </TouchableOpacity>
      <TouchableOpacity testId="notes-button-1" onPress={() => openNotesModal(item)}>
          <Text style={[styles.notesButton,{backgroundColor:theme === 'dark' ? '#fff' : '#C0C78C'},{color:theme === 'dark' ? '#000' : '#000'}]}>🖊 Notes</Text>
        </TouchableOpacity>
      </View>
        
    </TouchableOpacity>
  );

  const openNotesModal = async(item) => {
    // Fetch task notes and update state
    const notes = await fetchTaskNotes(item.id);
    const notesArray = notes;
      if (Array.isArray(notesArray) && notesArray.length > 0) {
        // Combine all note_text entries into a single string
        const notesText = notesArray.map(note => note.note_text).join('\n\n');
        const notesAttachment = notesArray.map(note => note.attachment);
       if(notesText != null){
          setNotes(notesText);
          setNotesAttachment(notesAttachment);
          setNotesModalVisible(true);
        }
      }
  };
  
  const closeNotesModal = () => {
    setNotesModalVisible(false);
    setNotes('');
  };

  const handleShowWeather = async () => {
    setweatherModalVisible(true);
  };

  const handleCloseModal = () => {
    setweatherModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={openFilterModal} accessibilityLabel="filter-list" style={styles.filterIcon}>
          <MaterialIcons name="filter-list" size={30}  color= {theme === 'dark' ? '#fff' : '#000'}  />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleShowWeather}
          accessible='true'
          accessibilityLabel="Show weather information"
          testID='weatherInfo'
        >
          <MaterialIcons name="cloud" size={30}  color= {theme === 'dark' ? '#fff' : '#000'}  />
        </TouchableOpacity>
      </View>
      <Modal
        visible={weatherModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.weathermodalContainer}>
          <View style={styles.weathermodalContent}>
            <ScrollView>
            <WeatherScreen />
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
              accessible
              accessibilityLabel="Close weather information"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
      {combinedTasks.length === 0 ? (
        <View style={[styles.noTasksContainer, { backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
          <FontAwesome5 name="tasks" size={48} color="green" />
          <Text style={styles.noTasksText}>All tasks completed!</Text>
        </View>
      ) : (
        <FlatList
          data={combinedTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderItemPomodoro({ item, isShared: item.isShared })}
        />
        
      )}
      {combinedTasks.length === 0 && (
        <FontAwesome5 name="tasks" size={30} color="gray" style={styles.zeroTasksIcon} />
      )}


      {/* Modal for Notes Details */}
      <Modal
        visible={notesModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeNotesModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Task Notes</Text>
            <Text style={styles.modalDescription}>{notes}</Text>
            {notesAttachment && (
              <Image source={{ uri: FileSystem.documentDirectory + notesAttachment }} style={styles.attachmentImage} />
            )}
            <TouchableOpacity onPress={closeNotesModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Task Details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
       
        <View style={styles.modalContainer}>
        {pomodoroTask && <PomodoroTimer />}
          {selectedTask && (
            <View style={styles.modalContent} testID="task-detail-modal">
              <Text style={styles.title}>{selectedTask.title}</Text>
              <Text style={styles.description} testID="task-description">{selectedTask.description}</Text>
              <Text style={styles.dueDate}><Text style={styles.initialTxt}>Task Priority:</Text> {selectedTask.priority}</Text>
              <Text style={styles.dueDate}><Text style={styles.initialTxt}>Task type:</Text> {selectedTask.type}</Text>
              <Text style={styles.dueDate}><Text style={styles.initialTxt}>TimeFrame:</Text> {selectedTask.timeframe} minutes</Text>
              <Text style={styles.dueDate}><Text style={styles.initialTxt}>Due Date:</Text> {formatDueDate(selectedTask.due_date)}</Text>
              <Text style={styles.closeButton} onPress={closeModal} testID="modal-close-button">Close</Text>
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
        style={[{backgroundColor: theme === 'dark' ? '#333' : '#fff'}]}
      >
        <View style={styles.filterModalContainer}>
          <View style={[styles.filterModalContent,{backgroundColor: theme === 'dark' ? '#333' : '#fff', }]}>
            <Text style={[styles.filterModalTitle]}>Filter Tasks</Text>
            
            <Text style={[styles.filterModalSubtitle]}>Priority</Text>
            {['High', 'Medium', 'Low'].map(priority => (
              <View key={priority} style={[styles.filterCheckboxContainer,{color:theme === 'dark' ? '#fff' : '#000'}]}>
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

            <TouchableOpacity onPress={applyFilters} style={styles.applyFiltersButton} accessibilityLabel="Apply filters" accessible={true}>
              <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeFilterModal} style={styles.closeButton} accessibilityLabel="Close Button" accessible={true}>
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
  
  taskCard: {
    marginBottom: 20,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 5,
    elevation: 4,
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
  },
  description: {
    marginBottom: 10,
    marginVertical: 8,
    fontSize: 14,
  },
  dueDate: {
    marginBottom: 5,
    fontSize: 14,
  },
  initialTxt: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: 'bold',
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
    color:'#fff',
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
  timerContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  timerButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  timerButton: {
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  timerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  pomodoroButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FF6347',
    borderRadius: 5,
  },
  pomodoroButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  notesButton: {
    marginTop: 10,
    fontWeight: 'bold',
    padding: 10,
    borderRadius:5,
  },
  attachmentImage: {
    width: 150,
    height: 150,
    marginTop: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection:'row',
    justifyContent:'space-between',
  },
  filterIcon: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    color: '#000',
    fontSize: 15,
  },
  weatherbuttonText: {
    alignSelf: 'flex-start',
    color: '#000',
    fontSize: 20,

  },
  weathermodalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Semi-transparent background
    height:'auto',
  },
  weathermodalContent: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight:'90%',
    alignItems: 'center',
  },
});

export default HomeScreen;
