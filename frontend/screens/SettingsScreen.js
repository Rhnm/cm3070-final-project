import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const SettingsScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Settings</Text>
            {/* Add settings options here */}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default SettingsScreen;
