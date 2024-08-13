import React, {useState,useEffect,useCallback} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,RefreshControl, Alert } from 'react-native';
import { useNavigation,useFocusEffect } from '@react-navigation/native'; 
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [username, setUsername] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [userId, setUserId] = useState('');
  const [getImageUri,setImageUri] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        if (uid !== null) {
          setUserId(uid);
        } else {
          navigation.navigate('Login');
          console.log('No user ID found');
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };
    
    fetchUserId();
  }, [userId]);
  
  /* useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
      getImage(userId);
    }
  }, [userId]); */

   // Fetch user details and profile image when the screen gains focus
   useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchUserDetails(userId);
        getImage(userId);
      }
    }, [userId,getImage])
  );

  const fetchUserDetails = async (userId) => {
    try{
      const response = await axios.get(`${baseURL}:3001/resources/getUserDetails/${userId}`);
      if (response.data.length > 0) {
        setUsername(response.data[0].name);
        setEmail(response.data[0].email);
      } else {
        console.log('No user details found');
      }
    } 
    catch (error) {
      console.error('Error fetching profile data:', error);
    } 
  };
  const getImage = async(userId) => {
    try{
      const response = await axios.get(`${baseURL}:3001/resources/getProfileImage/${userId}`);
      if (response.data.length > 0) {
        const imageName = response.data[0].image;
        const imageUri = FileSystem.documentDirectory + imageName;
        // Check if the image exists at the path
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        if (fileInfo.exists) {
          setProfileImage(imageName);
          setImageUri(imageUri);
        }
        console.log("Image Name: " + profileImage);
        console.log('Image URI: ' + getImageUri);
      } else {
        console.log('No image found for the user');
      }
    } 
    catch (error) {
      console.error('Error fetching profile image:', error);
    } 
  }

  // Image Picker Handling (Add permissions handling)
  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Enforce square aspect ratio
      quality: 0.8,
    });
    console.log('Image Picker Result:',  JSON.stringify(result)); // Log the entire result
    if (result.canceled) {
      Alert.alert('Image picking was cancelled');
      return;
    }
  
    // Extract URI from the assets array
    const asset = result.assets[0];
    const uri = asset.uri;
  
    if (!uri) {
      Alert.alert('Error', 'Image URI is undefined');
      return;
    }
  
    // Extract image name from URI
    const imageName = uri.split('/').pop() || `image_${new Date().getTime()}.jpg`;
  
    // Construct new path
    const newPath = FileSystem.documentDirectory + imageName;
  
    try {
      // Save the image locally in the app's document directory
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
  
      // Send image name to the backend
      uploadImage(imageName);
    } catch (error) {
      console.error('Error handling image upload:', error);
      Alert.alert('Error', 'Failed to handle image upload');
    }
  };

  const uploadImage = async (imageName) => {
    if(userId == 0){
      navigation.navigate('Login');
    }
    try {
      Alert.alert("uploading...");
      const response = await axios.post(`${baseURL}:3001/resources/saveProfileImage`, { imageName, userId });
      Alert.alert('Success', 'Image name uploaded successfully');
    } catch (error) {
      console.error('Error uploading image name:', error);
      Alert.alert('Error', 'Failed to upload image name');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      alert("Updating User with id: "+userId);
      await fetchUserDetails(userId); // Fetch user details on refresh
      await getImage(userId);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);
  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
     
      <View style={styles.imageContainer}>
      {getImageUri ? (
        <Image
          source={{ uri: getImageUri }}
          style={styles.profileImage}
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>No image available</Text>
        </View>
      )}
        <TouchableOpacity style={styles.editIconContainer} onPress={handleImageUpload}>
          <AntDesign name="edit" size={20} color="white" />
        </TouchableOpacity>
      </View>

     
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.email}>{email}</Text>

    
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditUserProfile')}>
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
    borderRadius: 60, // Makes image circular
    borderWidth: 2,
    borderColor: '#000',
  },
  noImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#f0f0f0', // Light gray background for better visibility
  },
  noImageText: {
    textAlign: 'center',
    color: '#888', // Gray text color
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4287f5', // Theme color
    borderRadius: 20,
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
