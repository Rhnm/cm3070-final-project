import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';

const HomeScreen = () => {
  return (
    <ImageBackground 
      source={{ uri: 'https://via.placeholder.com/800x600' }} // Pattern background URL
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Task Manager</Text>
        </View>
        <View style={styles.infographics}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/400x200' }} // Demo image URL
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Add Task</Text>
          <Text style={styles.infoText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Calendar</Text>
          <Text style={styles.infoText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Notes</Text>
          <Text style={styles.infoText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white background
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  infographics: {
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: 200,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
