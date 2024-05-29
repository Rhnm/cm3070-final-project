import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState([
    {
      date: '2024-04-15',
      title: 'Task 1',
      description: 'Description for Task 1',
      priority: 'Low',
      taskType: 'Type A',
    },
    {
      date: '2024-04-20',
      title: 'Task 2',
      description: 'Description for Task 2',
      priority: 'Medium',
      taskType: 'Type B',
    },
  ]);

  const markedDates = {};

  tasks.forEach((task) => {
    markedDates[task.date] = { selected: true, marked: true };
  });

  const onDayPress = (day) => {
    const task = tasks.find((task) => task.date === day.dateString);
    setSelectedDate(task);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
      />
      {selectedDate && (
        <View style={styles.taskDetails}>
          <Text style={styles.title}>{selectedDate.title}</Text>
          <Text style={styles.description}>{selectedDate.description}</Text>
          <Text style={styles.priority}>Priority: {selectedDate.priority}</Text>
          <Text style={styles.taskType}>Task Type: {selectedDate.taskType}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  taskDetails: {
    marginTop: 20,
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
    fontSize:12,
  },
  priority: {
    marginBottom: 5,
    fontWeight:'bold',
    color: '#888',
  },
  taskType: {
    marginBottom: 5,
    fontWeight:'bold',
    color: '#888',
  },
});

export default CalendarScreen;
