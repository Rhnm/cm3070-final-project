import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import NotesScreen from './screens/NotesScreen';
import PeopleScreen from './screens/PeopleScreen';
import NewTaskScreen from './screens/NewTaskScreen';
import SplashScreen from './screens/SplashScreen';
import UserProfileScreen from './screens/UserProfileScreen';

/* const Settings = () => {
  return <Text>Settings</Text>;
}; */

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();



const MainTabs = () => {
  return (
  <TouchableOpacity
    style={{
      top: -35,
      justifyContent: 'center',
      alignItems: 'center',
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#603ae1',
      borderColor: '#603ae1',
      borderWidth: 3,
      color: "#fff"
    }}
    
  >
    {children}
  </TouchableOpacity>
);
};

export default function App() {
  const [isAppReady, setAppReady] = useState(true);

  useEffect(() => {
    // Simulate loading time (you can replace this with actual loading logic)
    setTimeout(() => {
      setAppReady(false);
    }, 2000); // Adjust the timeout duration as needed
  }, []);
  if (isAppReady) {
    mainComponent = <SplashScreen onAnimationComplete={() => setAppReady(false)} />;
  } else {
    mainComponent = (
      <NavigationContainer>
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
            component={NewTaskScreen} // Use NewTaskScreen directly as the component
            options={{
              tabBarIcon: ({ color, size}) => (
                <View style={[styles.tabIconBackground,{backgroundColor:'#fff'}]}>
                  <FontAwesome5 name="plus" size={size * 1.8} color={color}  style={styles.iconStyle} />
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
          name="Profile" // Name of the tab
          component={UserProfileScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="user-alt" size={size} color={color} /> // Use appropriate icon
            ),
          }}
        />

      <Tab.Screen
          name="Profile" // Name of the tab
          component={UserProfileScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="user-alt" size={size} color={color} /> // Use appropriate icon
            ),
          }}
        />
    
    </Tab.Navigator>
      </NavigationContainer>
    )
  }
  
  return mainComponent;
};

const styles = StyleSheet.create({
  tabIconBackground: {
    width: 70, // Adjust according to your preference
    height: 70, // Adjust according to your preference
    borderRadius: 50, // Make it a circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    marginBottom: 15, // Adjust the margin according to your preference
  },
});
