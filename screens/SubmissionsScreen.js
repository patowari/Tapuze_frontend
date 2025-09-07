import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SubmissionsScreen({ navigation, route }) {
  const { assignment } = route.params;
  const { getSubmissionsForAssignment } = useAuth();

  // Get real submissions for this assignment
  const submissions = getSubmissionsForAssignment(assignment.id);

  const renderSubmission = ({ item }) => (
    <TouchableOpacity 
      style={styles.submissionCard}
      onPress={() => navigation.navigate('SubmissionDetail', { 
        submission: item,
        assignment: assignment
      })}
    >
      <View style={styles.submissionInfo}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.studentId}>ID: {item.studentId}</Text>
        <Text style={styles.fileName}>{item.fileName}</Text>
        <Text style={styles.fileDetails}>
          {Math.round(item.fileSize / 1024)} KB • {new Date(item.submittedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={[styles.status, styles[item.status]]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submissions for {assignment.title}</Text>
      <Text style={styles.subtitle}>
        {submissions.length} of {assignment.totalStudents || 25} students submitted
      </Text>

      {submissions.length > 0 ? (
        <FlatList
          data={submissions}
          renderItem={renderSubmission}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noSubmissionsText}>No submissions yet for this assignment.</Text>
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
    marginBottom: 5,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  noSubmissionsText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontStyle: 'italic',
    fontSize: 16,
  },
  submissionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submissionInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#333',
  },
  studentId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  fileName: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 2,
  },
  fileDetails: {
    fontSize: 12,
    color: '#888',
  },
  statusContainer: {
    marginLeft: 10,
  },
  status: {
    padding: 5,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 80,
  },
  submitted: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  },
  graded: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
  late: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  },
});