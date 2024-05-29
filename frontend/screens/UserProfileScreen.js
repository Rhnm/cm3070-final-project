import * as React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = React.useState(require('./assets/profile-placeholder.png'));
  const [username, setUsername] = React.useState('John Doe');
  const [email, setEmail] = React.useState('john.doe@example.com');

  // Image Picker Handling (Add permissions handling)
  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Enforce square aspect ratio
      quality: 0.8,
    });

    if (!result.cancelled) {
      setProfileImage({ uri: result.uri });
    }
  };

  return (
    <ScrollView style={styles.container}>
     
      <View style={styles.imageContainer}>
        <Image source={profileImage} style={styles.profileImage} />
        <TouchableOpacity style={styles.editIconContainer} onPress={handleImageUpload}>
          <AntDesign name="edit" size={20} color="white" />
        </TouchableOpacity>
      </View>

     
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.email}>{email}</Text>

    
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
  
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Rounds up the image
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4287f5', // Theme color
    borderRadius: 10,
    padding: 5,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4287f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default UserProfileScreen;
