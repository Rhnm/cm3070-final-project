import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import axios from 'axios';
import { baseURL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

const NotesScreen = () => {
  const [note, setNote] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Fetch user ID from AsyncStorage
    const fetchUserId = async () => {
      const uid = await AsyncStorage.getItem('uid');
      setUserId(uid);
      fetchNotes(uid);
    };
    fetchUserId();
  }, []);

  const fetchNotes = async (uid) => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getnotes/${uid}`);
      setNotesList(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (note.trim() === '') {
      Alert.alert('Error', 'Note cannot be empty');
      return;
    }
    try {
      const response = await axios.post(`${baseURL}:3001/resources/notes`, {
        user_id: userId,
        note_text: note,
      });
      setNotesList([response.data, ...notesList]);
      setNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await axios.delete(`${baseURL}:3001/resources/deletenote/${noteId}`);
      setNotesList(notesList.filter((item) => item.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const renderNoteItem = ({ item }) => (
    <View style={styles.noteItem}>
      <Text style={styles.noteText}>{item.note_text}</Text>
      <TouchableOpacity onPress={() => deleteNote(item.id)}>
        <FontAwesome5 name="trash" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.heading}>Your Notes</Text>
        {notesList.length === 0 ? (
          <Text style={styles.noNotesText}>No notes available.</Text>
        ) : (
          <FlatList
            data={notesList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderNoteItem}
          />
        )}
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
    minHeight: 60,
    textAlignVertical: 'top',
  },
  notesList: {
    marginTop: 20,
    flex: 1,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noNotesText: {
    fontStyle: 'italic',
    color: '#777',
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  noteText: {
    flex: 1,
    marginRight: 10,
  },
});

export default NotesScreen;
