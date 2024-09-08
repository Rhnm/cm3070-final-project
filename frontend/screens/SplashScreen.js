import React,{useEffect} from 'react';
import { View, Text,Image, StyleSheet, Animated,TouchableOpacity } from 'react-native';


const SplashScreen = () => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Starting the fade-in animation when the component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]} accessible accessibilityLabel="Splash screen logo">
      <View style={styles.container}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Task Management & To-Do List</Text>
        
          <TouchableOpacity  style={styles.button}>
            <Text style={styles.buttonText}>Let's Start</Text>
            
          </TouchableOpacity>
        
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', 
  },
  logo: {
    width: 200, 
    height: 200, 
    resizeMode: 'contain', 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7E64FF', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    marginRight: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
