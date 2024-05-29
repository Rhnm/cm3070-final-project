import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Share } from 'react-native';
import * as Contacts from 'expo-contacts';

const PeopleScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        });

        if (data.length > 0) {
          const formattedData = data.map((contact) => ({
            id: contact.id,
            name: contact.name,
            phone: contact.phoneNumbers ? contact.phoneNumbers[0]?.number : 'N/A',
            image: contact.image ? contact.image.uri : null,
          }));
          setContacts(formattedData);
        }
      }
    })();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.personContainer} onPress={() => handlePress(item)}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/50' }} 
        style={styles.personImage}
      />
      <Text style={styles.personName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handlePress = (item) => {
    setSelectedContact(item);
  };

  const handleShare = async (phone) => {
    try {
      const shareOptions = {
        message: 'Share a task with you!',
        url: 'https://yourtaskurl.com',
        title: 'Share Task',
      };
      await Share.share({
        message: `Task shared via Task Manager: ${shareOptions.message} ${shareOptions.url}`,
        url: shareOptions.url,
        title: shareOptions.title,
      });
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        numColumns={4} // Display in 4 columns
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
      {selectedContact && (
        <View style={styles.selectedContactContainer}>
          <Image 
            source={{ uri: selectedContact.image || 'https://via.placeholder.com/50' }} 
            style={styles.selectedContactImage}
          />
          <Text style={styles.selectedContactName}>{selectedContact.name}</Text>
          <Text style={styles.selectedContactPhone}>{selectedContact.phone}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={() => handleShare(selectedContact.phone)}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
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
  listContainer: {
    alignItems: 'flex-start',
  },
  personContainer: {
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 20,
    width: 60,
  },
  personImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  personName: {
    fontSize: 14,
    color: '#333',
  },
  selectedContactContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  selectedContactImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  selectedContactName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedContactPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  shareButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PeopleScreen;
