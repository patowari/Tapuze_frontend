import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ManualEvaluationScreen({ navigation, route }) {
  const { submission, assignment } = route.params;
  const { updateSubmissionWithEvaluation } = useAuth();
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleAIAssistance = () => {
    navigation.navigate('AIEvaluation', { submission, assignment });
  };

  const submitEvaluation = () => {
    if (!score || !feedback) {
      Alert.alert('Error', 'Please provide both score and feedback');
      return;
    }

    const evaluation = {
      overallScore: parseInt(score),
      totalPoints: 100,
      feedback: feedback,
      parts: [
        {
          part: "Overall Assessment",
          score: parseInt(score),
          maxScore: 100,
          feedback: feedback
        }
      ],
      tips: [
        "Review the feedback provided",
        "Consider the scoring criteria carefully"
      ],
      evaluatedAt: new Date().toISOString()
    };

    updateSubmissionWithEvaluation(submission.id, evaluation);
    Alert.alert('Success', 'Evaluation submitted successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Evaluate Submission</Text>
        
        <View style={styles.assignmentInfo}>
          <Text style={styles.sectionTitle}>Assignment: {assignment.title}</Text>
          <Text style={styles.studentInfo}>Student: {submission.studentName}</Text>
          <Text style={styles.fileInfo}>File: {submission.files[0]?.name}</Text>
        </View>

        <View style={styles.evaluationForm}>
          <Text style={styles.sectionTitle}>Manual Evaluation</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.label}>Score (0-100):</Text>
            <TextInput
              style={styles.scoreInput}
              value={score}
              onChangeText={setScore}
              keyboardType="numeric"
              placeholder="Enter score"
              maxLength={3}
            />
          </View>

          <Text style={styles.label}>Feedback:</Text>
          <TextInput
            style={styles.feedbackInput}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Provide detailed feedback for the student"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={submitEvaluation}
          >
            <Text style={styles.submitButtonText}>Submit Evaluation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aiAssistanceSection}>
          <Text style={styles.sectionTitle}>Need Help with Evaluation?</Text>
          <Text style={styles.aiDescription}>
            Get AI assistance to help you evaluate this submission. The AI will provide:
          </Text>
          <View style={styles.aiBenefits}>
            <Text style={styles.benefit}>• Detailed scoring breakdown</Text>
            <Text style={styles.benefit}>• Comprehensive feedback suggestions</Text>
            <Text style={styles.benefit}>• Improvement tips for the student</Text>
            <Text style={styles.benefit}>• Consistency with grading standards</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.aiAssistanceButton}
            onPress={handleAIAssistance}
          >
            <Text style={styles.aiAssistanceButtonText}>Get AI Assistance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  assignmentInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  studentInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  fileInfo: {
    fontSize: 14,
    color: '#888',
  },
  evaluationForm: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 80,
    marginLeft: 10,
    textAlign: 'center',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiAssistanceSection: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  aiDescription: {
    fontSize: 16,
    color: '#1976d2',
    marginBottom: 15,
    lineHeight: 22,
  },
  aiBenefits: {
    marginBottom: 20,
  },
  benefit: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 8,
  },
  aiAssistanceButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  aiAssistanceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});