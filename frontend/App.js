import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text,Button, Switch } from 'react-native';
import React, { useState, useEffect } from 'react';
import { NavigationContainer,useNavigation,useFocusEffect,DrawerActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator,DrawerContentScrollView,DrawerItemList  } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider, useTheme } from './screens/ThemeContext';

import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import NotesScreen from './screens/NotesScreen';
import PeopleScreen from './screens/PeopleScreen';
import NewTaskScreen from './screens/NewTaskScreen';
import SplashScreen from './screens/SplashScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import EditUserProfileScreen from './screens/EditUserProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import LogoutScreen from './screens/LogoutScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const AuthStack = createStackNavigator();
const UserProfileStack = createStackNavigator();

// Stack Navigator for User Profile and Edit User Profile Screens
const UserProfileStackScreen = () => (
  <UserProfileStack.Navigator>
    <UserProfileStack.Screen name="UserProfile" options={{ headerShown: false }}  component={UserProfileScreen} />
    <UserProfileStack.Screen name="EditUserProfile" component={EditUserProfileScreen} />
  </UserProfileStack.Navigator>
);


const MainTabs = ({ onTabChange }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('');

  const handleTabFocus = (tabName) => {
    setActiveTab(tabName);
    if (onTabChange) onTabChange(tabName);
  };

  useEffect(() => {
    if (onTabChange) onTabChange(activeTab);
    console.log("Active Tab1:", activeTab);
  }, [activeTab, onTabChange]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: theme === 'dark' ? '#333' : '#fff' }, // Set the tab bar color based on theme
        tabBarActiveTintColor: theme === 'dark' ? '#fff' : '#000', // Set the active tab color
        tabBarInactiveTintColor: theme === 'dark' ? '#888' : '#999', // Set the inactive tab color
      })}
      
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
        listeners={{
          focus: () => handleTabFocus('Home'),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="calendar-alt" size={size} color={color} />
          ),
        }}
        listeners={{
          focus: () => handleTabFocus('Calendar'),
        }}
      />
      <Tab.Screen
        name="AddTask"
        component={NewTaskScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.tabIconBackground, { backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
              <FontAwesome5 name="plus" size={size * 1.8} color={color} style={styles.iconStyle} />
            </View>
          ),
        }}
        listeners={{
          focus: () => handleTabFocus('AddTask'),
        }}
      />
      <Tab.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="sticky-note" size={size} color={color} />
          ),
        }}
        listeners={{
          focus: () => handleTabFocus('Notes'),
        }}
      />
      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="users" size={size} color={color} />
          ),
        }}
        listeners={{
          focus: () => handleTabFocus('People'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfileStackScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-alt" size={size} color={color} />
          ),
        }}
        listeners={{
          focus: () => handleTabFocus('Profile'),
        }}
      />
    </Tab.Navigator>
  );
};

const CustomDrawerContent = (props) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={{ flex: 1, height:"30%", }}>
      <DrawerContentScrollView {...props}>

      {/* Render the default drawer items */}
      <DrawerItemList {...props} />


      <View style={styles.darkMode}>
        <Text style={[styles.darkModetxt,{color: theme === 'dark' ? '#fff' : '#000'}]}>Dark Mode</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
        />
      </View>
      {/* Add other drawer items here if needed */}
      </DrawerContentScrollView>
    </View>
  );
};

const App = () => {
  const [isAppReady, setAppReady] = useState(true);
  const [userisLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  //const { theme } = useTheme();

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
    <ThemeProvider>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={({ route }) => {
            const { theme } = useTheme();  // Access the theme from context
            return {
              headerStyle: {
                backgroundColor: theme === 'dark' ? '#333' : '#fff',
              },
              headerTintColor: theme === 'dark' ? '#fff' : '#000',
              headerTitleStyle: {
                fontWeight: 'bold', // Adjust text styles as needed
                fontSize: 18, // Ensure title fits well within the header
                backgroundColor: theme === 'dark' ? 'transparent' : 'transparent',
              },
              drawerStyle: {
                backgroundColor: theme === 'dark' ? '#333' : '#fff',
              },
              drawerLabelStyle: {
                color: theme === 'dark' ? '#fff' : '#333',
              },
              headerTitle: activeTab,
            };
          }}
        >
          {userisLoggedIn ? (
            <>
            <Drawer.Screen name="HomePage" options={{headerTitle:activeTab}} >
              {props => <MainTabs {...props} onTabChange={setActiveTab} />}
            </Drawer.Screen>
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
    </ThemeProvider>
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
  darkMode: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically in the center
    justifyContent: 'space-between',
  },
  darkModetxt: {
    fontSize: 14,
    fontWeight:'bold',
  },
});
