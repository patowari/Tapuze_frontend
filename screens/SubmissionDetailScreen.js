import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SubmissionDetailScreen({ navigation, route }) {
  const { submission, assignment } = route.params;
  const { getSubmissionEvaluation } = useAuth();
  
  // Get evaluation if it exists
  const evaluation = getSubmissionEvaluation(submission.id);

  const handleEvaluate = () => {
    navigation.navigate('ManualEvaluation', { submission, assignment });
  };

  const handleDownload = (file) => {
    Alert.alert(
      "Download",
      `Download ${file.name} feature will be implemented soon!`,
      [
        {
          text: "OK",
          style: "default"
        }
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileItem = ({ item, index }) => (
    <View style={styles.fileItem}>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>{item.name}</Text>
        <Text style={styles.fileDetails}>
          {item.type.toUpperCase()} • {formatFileSize(item.size)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => handleDownload(item)}
      >
        <Text style={styles.downloadButtonText}>Download</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Submission Details</Text>

        <View style={styles.assignmentInfo}>
          <Text style={styles.sectionTitle}>Assignment</Text>
          <Text style={styles.assignmentName}>{assignment.title}</Text>
          <Text style={styles.dueDate}>Due: {assignment.dueDate}</Text>
        </View>

        <View style={styles.studentInfo}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          <Text style={styles.infoText}>Name: {submission.studentName}</Text>
          <Text style={styles.infoText}>ID: {submission.studentId}</Text>
        </View>

        <View style={styles.submissionInfo}>
          <Text style={styles.sectionTitle}>Submission Details</Text>
          <Text style={styles.infoText}>Files: {submission.files.length}</Text>
          <Text style={styles.infoText}>Submitted: {new Date(submission.submittedAt).toLocaleString()}</Text>
          <Text style={styles.infoText}>Status: {submission.status}</Text>
        </View>

        {/* AI Evaluation Results Section */}
        {evaluation ? (
          <View style={styles.evaluationSection}>
            <Text style={styles.sectionTitle}>Evaluation Results</Text>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>Score: {evaluation.overallScore}%</Text>
              <Text style={styles.evaluationDate}>
                Evaluated on: {new Date(evaluation.evaluatedAt).toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.feedbackTitle}>Feedback:</Text>
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>{evaluation.feedback}</Text>
            </View>

            <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
            {evaluation.parts.map((part, index) => (
              <View key={index} style={styles.partEvaluation}>
                <View style={styles.partHeader}>
                  <Text style={styles.partName}>{part.part}</Text>
                  <Text style={styles.partScore}>{part.score}/{part.maxScore}</Text>
                </View>
                <Text style={styles.partFeedback}>{part.feedback}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Improvement Tips</Text>
            <View style={styles.tipsContainer}>
              {evaluation.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.notEvaluatedContainer}>
            <Text style={styles.notEvaluatedText}>This submission hasn't been evaluated yet.</Text>
            <Text style={styles.notEvaluatedSubtext}>
              You can manually evaluate this submission or get AI assistance.
            </Text>
          </View>
        )}

        <View style={styles.filesSection}>
          <Text style={styles.sectionTitle}>Submitted Files</Text>
          <FlatList
            data={submission.files}
            renderItem={renderFileItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>File Previews</Text>
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewText}>File previews will be displayed here</Text>
            <Text style={styles.previewHint}>Multiple file viewer integration coming soon</Text>
          </View>
        </View>
      </ScrollView>

      {!evaluation && (
        <TouchableOpacity style={styles.evaluateButton} onPress={handleEvaluate}>
          <Text style={styles.evaluateButtonText}>Evaluate</Text>
        </TouchableOpacity>
      )}
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
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  assignmentInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
  },
  studentInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submissionInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  evaluationSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  evaluationDate: {
    fontSize: 12,
    color: '#666',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  feedbackBox: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
    marginBottom: 15,
  },
  feedbackText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  partEvaluation: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4a90e2',
  },
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  partScore: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  partFeedback: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  tipsContainer: {
    backgroundColor: '#fff8e1',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#ff8f00',
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  notEvaluatedContainer: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    alignItems: 'center',
  },
  notEvaluatedText: {
    fontSize: 16,
    color: '#856404',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notEvaluatedSubtext: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  filesSection: {
    marginBottom: 15,
  },
  fileItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
  },
  downloadButton: {
    backgroundColor: '#4a90e2',
    padding: 8,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewSection: {
    marginBottom: 15,
  },
  previewPlaceholder: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  previewHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  evaluateButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
  },
  evaluateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});