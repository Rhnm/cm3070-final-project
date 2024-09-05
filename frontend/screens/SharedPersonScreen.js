import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView,Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; 
import { baseURL } from '../apiConfig';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

const SharedPersonScreen = () => {
    const { theme } = useTheme();
    const [sharedTasks, setSharedTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    
        const fetchSharedTasks = async () => {
            try {
                const response = await axios.get(`${baseURL}:3001/resources/sharedpersonslist`);
                setSharedTasks(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching shared tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchSharedTasks();
        }, []);
        
    /* useFocusEffect(
        useCallback(() => {
            fetchSharedTasks();
        }, [fetchSharedTasks])
      ); */

    const handleDelete = async (taskId,userIdTo,userName) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${userName} from this task?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const response = await axios.delete(`${baseURL}:3001/resources/sharedtasks/${taskId}/${userIdTo}`);
                            Alert.alert(response.data);
                            // Remove the specific user from the local state
                            setSharedTasks(prevTasks =>
                                prevTasks.reduce((acc, task) => {
                                    if (task.task_id === taskId) {
                                        const updatedNames = task.user_to_names.split(',').filter(name => name.trim() !== userName).join(',');
                                        if (updatedNames) {
                                            // If there are still names left, update the task
                                            acc.push({ ...task, user_to_names: updatedNames });
                                        }
                                    } else {
                                        // If it's not the task that was affected, just add it to the result
                                        acc.push(task);
                                    }
                                    return acc;
                                }, [])
                            );
                        } catch (error) {
                            console.error('Error deleting user:', error);
                        }
                    }
                }
            ]
        );
    };


    const renderTaskItem = ({ item }) => {
        // Split concatenated user names and dates into arrays
        const userToNames = item.user_to_names.split(',').filter(name => name.trim() !== '');
        const userToIds = item.user_to_ids.split(',').filter(id => id.trim() !== '');

        return (
            <View style={[styles.taskContainer,{backgroundColor: theme === 'dark' ? '#333' : '#fff'}]}>
                <Text style={[styles.taskTitle,{color: theme === 'dark' ? '#fff' : '#000'}]}>{item.task_title}</Text>
                
                {/* Display the user who created the task */}
                <Text style={[styles.sectionTitle,{color: theme === 'dark' ? '#fff' : '#000'}]}>Assigned By:</Text>
                <Text style={[styles.userInfo,{color: theme === 'dark' ? '#fff' : '#000'}]}>{item.user_from_names}</Text>
                
                {/* Display users the task is assigned to */}
                {userToNames.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle,{color: theme === 'dark' ? '#fff' : '#000'}]}>Assigned To:</Text>
                        {userToNames.map((name, index) => (
                            <View key={`to-${index}`} style={[styles.userContainer,{color: theme === 'dark' ? '#fff' : '#000'}]}>
                                <Text style={[styles.userInfo,{color: theme === 'dark' ? '#fff' : '#000'}]}>
                                {name}</Text>
                                    <TouchableOpacity onPress={() => handleDelete(item.task_id,userToIds[index], name)}>
                                        <Ionicons name="remove-circle-outline" size={24} color="red" />
                                    </TouchableOpacity>
                                
                            </View>
                        ))}
                    </>
                )}
                
                {/* Display shared date */}
                {item.shared_ats && (
                    <>
                        <Text style={[styles.sectionTitle,{color: theme === 'dark' ? '#fff' : '#000'}]}>Shared At:</Text>
                        <Text style={[styles.sharedAt,{color: theme === 'dark' ? '#fff' : '#000'}]}>{new Date(item.shared_ats).toLocaleString()}</Text>
                    </>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" testID='loading-spinner'/>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container,{backgroundColor: theme === 'dark' ? '#333' : '#fff'}]} horizontal>
            <FlatList
                data={sharedTasks}
                keyExtractor={(item) => item.task_id.toString()}
                renderItem={renderTaskItem}
                contentContainerStyle={styles.listContainer}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingVertical: 10,
    },
    taskContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginVertical: 8,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    userInfo: {
        fontSize: 14,
        color: '#555',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sharedAt: {
        marginTop: 5,
        fontSize: 12,
        color: '#888',
    },
});

export default SharedPersonScreen;
