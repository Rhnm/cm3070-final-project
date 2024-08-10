import React, { useState } from 'react'; // Import the useState hook
import { View, TextInput, Button, StyleSheet } from 'react-native'; // Import necessary components from react-native

const TaskType = ({ onAddTaskType }) => {
  const [taskTypeName, setTaskTypeName] = useState('');

  const handleAddTaskType = () => {
    if (taskTypeName.trim() === '') {
      alert('Task type name cannot be empty');
      return;
    }
    onAddTaskType(taskTypeName);
    setTaskTypeName('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Task Type Name"
        value={taskTypeName}
        onChangeText={setTaskTypeName}
      />
      <Button title="Add Task Type" onPress={handleAddTaskType} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default TaskType;
