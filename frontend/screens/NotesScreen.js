import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, FlatList, Image, Modal, Pressable } from 'react-native';
import axios from 'axios';
import { useNavigation,useFocusEffect } from '@react-navigation/native'; 
import { baseURL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const NotesScreen = () => {
  const [note, setNote] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const uid = await AsyncStorage.getItem('uid');
      setUserId(uid);
      fetchNotes(uid);
    };
    fetchUserId();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchNotes(userId);
      }
    }, [fetchNotes,userId])
  );

  const fetchNotes = async (userId) => {
    try {
      const response = await axios.get(`${baseURL}:3001/resources/getnotes/${userId}`);
      const notesWithAttachments = await Promise.all(response.data.map(async (note) => {
        if (note.attachment) {
          const attachmentUri = FileSystem.documentDirectory + note.attachment;
          const fileInfo = await FileSystem.getInfoAsync(attachmentUri);
          if (fileInfo.exists) {
            return { ...note, attachmentUri }; // Update with the local path
          }
        }
        return note;
      }));
      setNotesList(notesWithAttachments);
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
      let attachmentName = null;

      if (attachment) {
        attachmentName = attachment.split('/').pop() || `attachment_${new Date().getTime()}.jpg`;
        const newPath = FileSystem.documentDirectory + attachmentName;
        if (attachment !== newPath) {
          await FileSystem.copyAsync({
            from: attachment,
            to: newPath,
          });
        } else {
          // If source and destination are the same, use the existing path
          attachmentName = attachment.split('/').pop();
        }
      }

      if (editingNote) {
        // Edit existing note
        alert(note);
        await axios.put(`${baseURL}:3001/resources/editnote/${editingNote.id}`, {
          note_text: note,
          attachment: attachmentName,
        });
        setNotesList(notesList.map((n) =>
          n.id === editingNote.id
            ? { ...n, note_text: note, attachment: attachmentName }
            : n
        ));
        setEditingNote(null);
        setIsEditing(false); // Reset edit mode
      } else {
        // Add new note
        const response = await axios.post(`${baseURL}:3001/resources/notes`, {
          user_id: userId,
          note_text: note,
          attachment: attachmentName,
        });
        setNotesList([response.data, ...notesList]);
      }

      setNote('');
      setAttachment(null);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleAttachment = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    setAttachment(result.assets[0].uri);
  };

  const deleteNote = async (noteId) => {
    try {
      await axios.delete(`${baseURL}:3001/resources/deletenote/${noteId}`);
      setNotesList(notesList.filter((item) => item.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const startEditNote = (note) => {
    setNote(note.note_text);
    setAttachment(note.attachment ? FileSystem.documentDirectory + note.attachment : null);
    setEditingNote(note);
    setIsEditing(true); // Set edit mode
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setNote('');
    setAttachment(null);
    setIsEditing(false);
  };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity onPress={() => showNoteModal(item)} style={styles.noteItem}>
      <View style={styles.noteTextContainer}>
        <Text style={styles.noteText}>{item.note_text}</Text>
        {item.attachment && (
          <Image source={{ uri: FileSystem.documentDirectory + item.attachment }} style={styles.attachmentImage} />
        )}
      </View>
      <View style={styles.noteActions}>
        <TouchableOpacity onPress={() => startEditNote(item)} style={styles.iconContainer}>
          <FontAwesome5 name="edit" size={30} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <FontAwesome5 name="trash" size={30} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const showNoteModal = (note) => {
    setSelectedNote(note);
    setIsModalVisible(true);
  };
  
  const hideNoteModal = () => {
    setIsModalVisible(false);
    setSelectedNote(null);
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
      {attachment && (
          <Image source={{ uri: attachment }} style={styles.attachmentPreview} />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Add Attachment" color="#bec6a0" onPress={handleAttachment} />  
        {isEditing ? (
          <>
            <Button title="Cancel" color="#d9534f" onPress={cancelEdit} />
            <Button title="Update Note" color="#9ca986" onPress={addNote} />
          </>
        ) : (
          <Button title="Save Note" color="#9ca986" onPress={addNote} />
        )}
      </View>
      
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
      {/* Modal Component */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={hideNoteModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalNoteText}>{selectedNote?.note_text}</Text>
            {selectedNote?.attachment && (
              <Image
                source={{ uri: FileSystem.documentDirectory + selectedNote.attachment }}
                style={styles.modalAttachmentImage}
              />
            )}
            <Pressable onPress={hideNoteModal} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
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
  noteTextContainer:{
    flex:1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  attachmentImage: {
    width: 50,
    height: 50,
    marginTop: 10,
    borderRadius: 5,
  },
  attachmentPreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 5,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
  },
  iconContainer: {
    marginRight: 15, // Adjust this value to your preference
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%', // Increased width to make the modal larger
    maxHeight: '80%', // Set a max height for the modal
    alignItems: 'center',
  },
  modalNoteText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalAttachmentImage: {
    width: '100%',
    minHeight: 250,
    marginVertical: 10,
    borderRadius: 5,
    resizeMode: 'contain',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  modalCloseText: {
    color: '#333',
  },
});

export default NotesScreen;