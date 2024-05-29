import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';

const NotesScreen = () => {
  const [note, setNote] = useState('');
  const [notesList, setNotesList] = useState([
    'Demo Note 1',
    'Demo Note 2',
    'Demo Note 3',
  ]);

  const addNote = () => {
    if (note.trim() !== '') {
      setNotesList([...notesList, note]);
      setNote('');
    }
  };

  const renderNotes = () => {
    return notesList.map((item, index) => (
      <TouchableOpacity
        key={index}
        style={styles.noteItem}
        onPress={() => alert(item)} // Replace with your pop-out logic
      >
        <Text>{item}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Write a note..."
        multiline
        value={note}
        onChangeText={setNote}
      />
      <Button title="Save Note" onPress={addNote} />
      <View style={styles.notesList}>
        <Text style={styles.heading}>Demo Notes</Text>
        {renderNotes()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  notesList: {
    marginTop: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noteItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
});

export default NotesScreen;
