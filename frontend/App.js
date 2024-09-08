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
import SharedPersonScreen from './screens/SharedPersonScreen';
import CompletedTaskScreen from './screens/CompletedTaskScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const AuthStack = createStackNavigator();
const UserProfileStack = createStackNavigator();

// Stack Navigator for User Profile and Edit User Profile Screens
const UserProfileStackScreen = () => (
  <UserProfileStack.Navigator>
    <UserProfileStack.Screen name="UserProfile" options={{ headerShown: false }}  component={UserProfileScreen} />
    <UserProfileStack.Screen name="EditUserProfile" component={EditUserProfileScreen} options={{headerShown: false }} />
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
    //Created to use the activeTab value for later improvements
  }, [activeTab, onTabChange]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: theme === 'dark' ? '#333' : '#fff' }, 
        tabBarActiveTintColor: theme === 'dark' ? '#fff' : '#7E64FF', 
        tabBarInactiveTintColor: theme === 'dark' ? '#888' : '#000', 
      })}
      
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size*1.2} color={color} />
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
            <FontAwesome5 name="calendar-alt" size={size*1.2} color={color} />
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
            <FontAwesome5 name="sticky-note" size={size*1.2} color={color} />
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
            <FontAwesome5 name="users" size={size*1.2} color={color} />
          ),
        }}
        listeners={{
          focus: () => handleTabFocus('People'),
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

      {/* Rendering the default drawer items */}
      <DrawerItemList {...props} />


      <View style={styles.darkMode}>
        <Text style={[styles.darkModetxt,{color: theme === 'dark' ? '#fff' : '#000'}]}>Dark Mode</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
        />
      </View>
      </DrawerContentScrollView>
    </View>
  );
};

const App = () => {
  const [isAppReady, setAppReady] = useState(true);
  const [userisLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  useEffect(() => {
    setTimeout(() => {
      setAppReady(false);
    }, 2000); 

    // Checking login status from AsyncStorage when the app starts
    const checkLoginStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('isLoggedIn');
        
        if (value !== null) {
          setIsLoggedIn(value === 'true');
        }
      } catch (error) {
        Alert.alert('Login Status could not be validated - ', error);
        setAppReady(false);
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
            const { theme } = useTheme(); 
            return {
              headerStyle: {
                backgroundColor: theme === 'dark' ? '#333' : '#fff',
              },
              headerTintColor: theme === 'dark' ? '#fff' : '#000',
              headerTitleStyle: {
                fontWeight: 'bold', 
                fontSize: 18, 
                backgroundColor: theme === 'dark' ? 'transparent' : 'transparent',
              },
              drawerActiveTintColor: theme === 'dark' ? '#fff' : '#7E64ff',
              drawerStyle: {
                color: theme === 'dark' ? '#333' : '#fff',
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
            <Drawer.Screen name="Home Page" options={{headerTitle:activeTab}} >
              {props => <MainTabs {...props} onTabChange={setActiveTab} />}
            </Drawer.Screen>
            
              <Drawer.Screen 
              name = "Shared Tasks" 
              component={SharedPersonScreen} 
              options={{
                headerTitle: 'Shared Tasks',
              }}
              />
              <Drawer.Screen 
              name = "Completed Tasks" 
              component={CompletedTaskScreen} 
              options={{
                headerTitle: 'Completed Tasks',
              }}
              />
              <Drawer.Screen 
              name = "Profile" 
              component={UserProfileStackScreen} 
              options={{
                headerTitle: 'Profile',
              }}
              />
              <Drawer.Screen
                name="Logout"
                children={props => (
                  <LogoutScreen {...props} onLogout={() => setIsLoggedIn(false)} />
                )}
                
                options={{
                  headerTitle: 'Logout',
                }}
              />
            </>
          ) : (
          <>
          <Drawer.Screen
                name="Login"
                children={props => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
                options={{
                  headerTitle: 'Login',
                }}
              />
          <Drawer.Screen name="Register" component={RegisterScreen} options={{headerTitle:'Register',}} />
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
    width: 70, 
    height: 70, 
    borderRadius: 50, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'white',
    color:'black',
  },
  iconStyle: {
    marginBottom:30, 
  },
  darkMode: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  darkModetxt: {
    fontSize: 14,
    fontWeight:'bold',
  },
});
