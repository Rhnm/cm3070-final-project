import React, { useState } from 'react'; 
import { View, TextInput, Button, StyleSheet, DatePickerAndroid, Picker } from 'react-native'; 

const NewTaskScreen = () => { // Define a functional component called NewTaskScreen
  // Initialize states for task title, description, duedate and priority using the useState hook
  const [title, setTitle] = useState(''); 
  const [description, setDescription] = useState(''); 
  const [dueDate, setDueDate] = useState(null); 
  const [priority, setPriority] = useState('Low'); 

const openDatePicker = async () => { // Define a function to open the date picker
    try { // Try to open the date picker
      const { action, year, month, day } = await DatePickerAndroid.open({ // Await the result of opening the date picker
        date: new Date(), // Set the initial date of the date picker to the current date
      });
      if (action !== DatePickerAndroid.dismissedAction) { // If the date picker action is not dismissed
        const selectedDate = new Date(year, month, day); // Create a new date object with the selected date
        setDueDate(selectedDate); // Set the due date state to the selected date
      }
    } catch ({ code, message }) { // Catch any errors that occur while opening the date picker
      console.warn('Cannot open date picker', message); // Log a warning message if the date picker cannot be opened
    }
  };

  const saveTask = () => { 
    console.log('Task saved:', { title, description, dueDate, priority, taskType }); 
  };

  return ( 
    <View style={styles.container}> 
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Task Type</Text>
        <View style={styles.pickerContainer}>
          <Picker 
            selectedValue={taskType} 
            style={styles.picker} 
            onValueChange={(itemValue, itemIndex) => setTaskType(itemValue)} 
          >
            <Picker.Item label="Type A" value="Type A" /> 
            <Picker.Item label="Type B" value="Type B" /> 
            <Picker.Item label="Type C" value="Type C" /> 
          </Picker>
        </View>
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Task Priority</Text>
        <View style={styles.pickerContainer}>
          <Picker 
            selectedValue={priority} 
            style={styles.picker} 
            onValueChange={(itemValue, itemIndex) => setPriority(itemValue)} 
          >
            <Picker.Item label="Low" value="Low" /> 
            <Picker.Item label="Medium" value="Medium" /> 
            <Picker.Item label="High" value="High" /> 
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
        onChangeText={setDescription} 
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
