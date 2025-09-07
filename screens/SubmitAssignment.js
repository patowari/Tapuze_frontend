import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../contexts/AuthContext';

export default function SubmitAssignment({ navigation, route }) {
  const { assignment, classroom } = route.params;
  const [files, setFiles] = useState([]);
  const { user, addSubmission } = useAuth();

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      
      console.log('Document picker result:', result); // Debug log
      
      // Handle the result based on the actual structure
      if (!result.canceled) {
        // In newer versions, it's result.assets, in older versions it might be direct properties
        let selectedFile;
        
        if (result.assets && result.assets.length > 0) {
          // Newer version with assets array
          selectedFile = result.assets[0];
        } else if (result.uri) {
          // Older version with direct properties
          selectedFile = result;
        }
        
        if (selectedFile && selectedFile.uri) {
          setFiles([{
            type: 'document',
            name: selectedFile.name,
            size: selectedFile.size,
            uri: selectedFile.uri,
            mimeType: selectedFile.mimeType || selectedFile.type
          }]);
          Alert.alert('Success', 'File selected successfully!');
        } else {
          console.log('No valid file found in result');
          Alert.alert('Error', 'No valid file selected');
        }
      } else {
        console.log('Document picker cancelled');
      }
    } catch (err) {
      console.error('Document picker error:', err);
      Alert.alert('Error', 'Failed to pick document: ' + err.message);
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      Alert.alert('Error', 'Please select a file to submit');
      return;
    }

    try {
      const submissionData = {
        assignmentId: assignment.id,
        classroomId: classroom.id,
        assignmentName: assignment.title,
        classroomName: classroom.name,
        studentId: user.userId,
        studentName: user.name,
        files: files,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };

      addSubmission(submissionData);
      
      Alert.alert('Success', `Assignment "${assignment.title}" submitted successfully!`);
      navigation.goBack();
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to submit assignment: ' + error.message);
    }
  };

  const clearSelection = () => {
    setFiles([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Assignment</Text>
      <Text style={styles.assignmentTitle}>{assignment.title}</Text>
      <Text style={styles.classroomName}>For: {classroom.name}</Text>
      <Text style={styles.studentInfo}>Student: {user.name} ({user.userId})</Text>
      
      <TouchableOpacity style={styles.uploadButton} onPress={pickDocuments}>
        <Text style={styles.uploadButtonText}>
          {files.length > 0 ? 'Change Document' : 'Select Document'}
        </Text>
      </TouchableOpacity>

      {files.length > 0 ? (
        <View style={styles.fileContainer}>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>{files[0].name}</Text>
            <Text style={styles.fileDetails}>
              {files[0].mimeType || 'Document'} • {Math.round(files[0].size / 1024)} KB
            </Text>
          </View>
          <TouchableOpacity style={styles.removeButton} onPress={clearSelection}>
            <Text style={styles.removeText}>×</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noFileText}>No file selected</Text>
      )}

      <Text style={styles.supportedFormats}>
        Supported formats: PDF, DOC, DOCX
      </Text>
      
      <TouchableOpacity 
        style={[styles.submitButton, files.length === 0 && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={files.length === 0}
      >
        <Text style={styles.submitButtonText}>
          {files.length > 0 ? 'Submit Assignment' : 'Select a file to submit'}
        </Text>
      </TouchableOpacity>
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
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
    color: '#444',
  },
  classroomName: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
    color: '#666',
  },
  studentInfo: {
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  uploadButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  fileDetails: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 4,
    backgroundColor: '#ff4757',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  removeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  noFileText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  supportedFormats: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});