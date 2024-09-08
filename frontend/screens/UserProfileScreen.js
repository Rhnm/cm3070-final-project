import React, {useState,useEffect,useCallback} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,RefreshControl, Alert } from 'react-native';
import { useNavigation,useFocusEffect } from '@react-navigation/native'; 
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../apiConfig';
import { useTheme } from './ThemeContext';

const UserProfileScreen = () => {
  const { theme } = useTheme();
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
        }
      } catch (error) {
        Alert.alert('Error fetching user ID:', error);
      }
    };
    
    fetchUserId();
  }, [userId]);

   // Fetching user details and profile image when the screen gains focus
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
        Alert.alert('No user details found');
      }
    } 
    catch (error) {
      Alert.alert('Error fetching profile data:', error);
    } 
  };
  const getImage = async(userId) => {
    try{
      const response = await axios.get(`${baseURL}:3001/resources/getProfileImage/${userId}`);
      if (response.status === 200) {
        if (response.data.length > 0) {
          const imageName = response.data[0].image;
          const imageUri = FileSystem.documentDirectory + imageName;
          // Checking if the image exists at the path
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          if (fileInfo.exists) {
            setProfileImage(imageName);
            setImageUri(imageUri);
          }else{
            // Handling the case where file does not exist
            setImageUri('');
            Alert.alert('Image Error', 'Image file does not exist.');
          }
        } else {
          setImageUri('');
          Alert.alert('No Image Found', 'No image found for the user.');
        }
      }else{
        Alert.alert('Error', 'Unexpected response from server.');
      }
    }
    catch (error) {
      if (error.response && error.response.status === 404) {
        // Handling 404 error from the server
        Alert.alert('Not Found', 'No image found for the user.');
      } else {
          Alert.alert('Error', 'Failed to fetch profile image.');
      }
    } 
  };

  // Image Picker Handling
  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Enforcing square aspect ratio
      quality: 0.8,
    });
    if (result.canceled) {
      Alert.alert('Image picking was cancelled');
      return;
    }
  
    // Extracting URI from the assets array
    const asset = result.assets[0];
    const uri = asset.uri;
  
    if (!uri) {
      Alert.alert('Error', 'Image URI is undefined');
      return;
    }
  
    // Extracting image name from URI
    const imageName = uri.split('/').pop() || `image_${new Date().getTime()}.jpg`;
  
    // Constructing new path
    const newPath = FileSystem.documentDirectory + imageName;
  
    try {
      // Saving the image locally in the app's document directory
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
  
      // Sending image name to the backend
      uploadImage(imageName);
    } catch (error) {
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
      Alert.alert('Error', 'Failed to upload image name');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (userId) {
        await fetchUserDetails(userId); // Fetching user details on refresh
        await getImage(userId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [userId]);
  return (
    <ScrollView 
      style={[styles.container,{backgroundColor: theme === 'dark' ? '#333' : '#fff', }]} 
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
        <TouchableOpacity style={[styles.editIconContainer,{backgroundColor: theme === 'dark' ? '#fff' : '#7E64FF' }]} onPress={handleImageUpload}>
          <AntDesign name="edit" size={20} style={[{backgroundColor: theme === 'dark' ? '#fff' : '#7E64FF', },{color: theme === 'dark' ? '#000' : '#fff', }]} />
        </TouchableOpacity>
      </View>

     
      <Text style={[styles.username,{color: theme === 'dark' ? '#fff' : '#000', }]}>{username}</Text>
      <Text style={[styles.email,{color: theme === 'dark' ? '#fff' : '#000', }]}>{email}</Text>

    
      <TouchableOpacity style={[styles.button,{backgroundColor: theme === 'dark' ? '#fff' : '#7E64FF', }]} onPress={() => navigation.navigate('EditUserProfile')}>
        <Text style={[styles.buttonText,{color: theme === 'dark' ? '#000' : '#fff', }]}>Edit Profile</Text>
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
    borderRadius: 60,
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
    backgroundColor: '#f0f0f0', 
  },
  noImageText: {
    textAlign: 'center',
    color: '#888', 
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4287f5', 
    borderRadius: 20,
    padding: 5,
    marginRight:2,
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
