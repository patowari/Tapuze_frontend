import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ClassroomCard from '../components/ClassroomCard';
import { useAuth } from '../contexts/AuthContext';

export default function LecturerDashboard({ navigation }) {
  const { user, classrooms, assignments, logout, deleteClassroom } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => logout() 
        }
      ]
    );
  };

  const handleCreateClassroom = () => {
    navigation.navigate('CreateClassroom');
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const handleDeleteClassroom = (classroomId) => {
    deleteClassroom(classroomId);
    Alert.alert('Success', 'Classroom deleted successfully');
  };

  const renderClassroom = ({ item }) => (
    <ClassroomCard 
      classroom={item} 
      onPress={() => navigation.navigate('Classroom', { 
        classroom: item,
        assignments: assignments.filter(a => a.classroomId === item.id)
      })}
      showStudentCount
      onDelete={handleDeleteClassroom}
    />
  );

  // Set header options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity 
            onPress={navigateToProfile} 
            style={styles.profileButton}
            accessibilityLabel="Go to profile"
          >
            <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lecturer Dashboard</Text>
      <Text style={styles.welcome}>Welcome, {user?.name}!</Text>
      
      <TouchableOpacity 
        style={styles.createButton}
        onPress={handleCreateClassroom}
      >
        <Text style={styles.createButtonText}>Create New Classroom</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Classrooms</Text>
      
      {classrooms.length > 0 ? (
        <FlatList
          data={classrooms}
          renderItem={renderClassroom}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noClassesText}>You haven't created any classrooms yet. Create your first classroom to get started!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  welcome: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  noClassesText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  profileButton: {
    padding: 5,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#ff4757',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});