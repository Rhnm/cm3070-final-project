import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text,Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import { NavigationContainer,useNavigation,useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import NotesScreen from './screens/NotesScreen';
import PeopleScreen from './screens/PeopleScreen';
import NewTaskScreen from './screens/NewTaskScreen';
import SplashScreen from './screens/SplashScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import LogoutScreen from './screens/LogoutScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const AuthStack = createStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="calendar-alt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTask"
        component={NewTaskScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.tabIconBackground, { backgroundColor: '#fff' }]}>
              <FontAwesome5 name="plus" size={size * 1.8} color={color} style={styles.iconStyle} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="sticky-note" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="users" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-alt" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isAppReady, setAppReady] = useState(true);
  const [userisLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Simulate loading time (you can replace this with actual loading logic)
    setTimeout(() => {
      setAppReady(false);
    }, 2000); // Adjust the timeout duration as needed

    // Check login status from AsyncStorage when the app starts
    const checkLoginStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('isLoggedIn');
        
        if (value !== null) {
          setIsLoggedIn(value === 'true');
        }
        //setAppReady(false); // Set app ready state after checking login status
      } catch (error) {
        console.error('Error reading login status', error);
        setAppReady(false); // Set app ready state even if there's an error
      }
    };
    checkLoginStatus();
  }, []);

  if (isAppReady) {
    return <SplashScreen onAnimationComplete={() => setAppReady(false)} />;
  } 
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        {userisLoggedIn ? (
          <>
          <Drawer.Screen name="HomeTabs" component={MainTabs} />
          <Drawer.Screen
              name="Logout"
              children={props => (
                <LogoutScreen {...props} onLogout={() => setIsLoggedIn(false)} />
              )}
            />
          </>
        ) : (
        <>
        <Drawer.Screen
              name="Login"
              children={props => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
            />
        <Drawer.Screen name="Register" component={RegisterScreen} />
        </>
        )}
    </Drawer.Navigator>
    </NavigationContainer>
  );
};
export default App;

const styles = StyleSheet.create({
  tabIconBackground: {
    width: 70, // Adjust according to your preference
    height: 70, // Adjust according to your preference
    borderRadius: 50, // Make it a circle
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'white',
    color:'black',
  },
  iconStyle: {
    marginBottom:30, // Adjust the margin according to your preference
  },
});
