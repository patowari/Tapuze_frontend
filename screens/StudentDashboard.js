import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Alert, Clipboard } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ClassroomCard from '../components/ClassroomCard';
import { useAuth } from '../contexts/AuthContext';

export default function StudentDashboard({ navigation }) {
  const [joinCode, setJoinCode] = useState('');
  const { user, classrooms, joinClassroom, logout, submissions } = useAuth();

  // Get classrooms that the student has joined
  const studentClassrooms = classrooms.filter(classroom => 
    user?.joinedClassrooms?.includes(classroom.code)
  );

  // Get evaluation status for each classroom
  const classroomsWithStatus = studentClassrooms.map(classroom => {
    // Find submissions for this classroom
    const classroomSubmissions = submissions.filter(sub => 
      sub.classroomId === classroom.id && sub.studentId === user.userId
    );
    
    // Get the latest submission for each assignment
    const latestSubmissions = classroomSubmissions.reduce((acc, submission) => {
      if (!acc[submission.assignmentId] || new Date(submission.submittedAt) > new Date(acc[submission.assignmentId].submittedAt)) {
        acc[submission.assignmentId] = submission;
      }
      return acc;
    }, {});
    
    const submissionsArray = Object.values(latestSubmissions);
    const evaluatedCount = submissionsArray.filter(sub => sub.evaluation).length;
    const totalAssignments = submissionsArray.length;
    
    return {
      ...classroom,
      evaluationStatus: totalAssignments > 0 ? 
        `${evaluatedCount}/${totalAssignments} assignments evaluated` : 
        'No submissions yet'
    };
  });

  const handleJoinClassroom = () => {
    if (joinCode.trim()) {
      // Check if classroom exists
      const classroomExists = classrooms.some(c => c.code === joinCode);
      
      if (classroomExists) {
        joinClassroom(joinCode);
        Alert.alert('Success', `Joined classroom with code: ${joinCode}`);
      } else {
        Alert.alert('Error', `No classroom found with code: ${joinCode}`);
      }
      setJoinCode('');
    } else {
      Alert.alert('Error', 'Please enter a classroom code');
    }
  };

  const handlePasteCode = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent) {
        setJoinCode(clipboardContent.trim());
      } else {
        Alert.alert('Clipboard', 'No text found in clipboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access clipboard');
    }
  };

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

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const renderClassroom = ({ item }) => (
    <ClassroomCard 
      classroom={item} 
      onPress={() => navigation.navigate('Classroom', { classroom: item })}
      evaluationStatus={item.evaluationStatus}
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
      <Text style={styles.title}>Student Dashboard</Text>
      <Text style={styles.welcome}>Welcome, {user?.name}!</Text>
      
      <View style={styles.joinSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.codeInput}
            placeholder="Enter classroom code"
            value={joinCode}
            onChangeText={setJoinCode}
          />
          <TouchableOpacity 
            style={styles.pasteButton} 
            onPress={handlePasteCode}
            accessibilityLabel="Paste code from clipboard"
          >
            <Text style={styles.pasteText}>Paste</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinClassroom}>
          <Text style={styles.joinButtonText}>Join Classroom</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your Classrooms</Text>
      
      {classroomsWithStatus.length > 0 ? (
        <FlatList
          data={classroomsWithStatus}
          renderItem={renderClassroom}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noClassesText}>You haven't joined any classrooms yet. Use a code from your lecturer to join a classroom.</Text>
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
  joinSection: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  codeInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
  },
  pasteButton: {
    padding: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  pasteText: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
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