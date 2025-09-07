import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { gradeHomeworkWithAI, updateSubmissionEvaluation } from '../services/apiService';
import Spinner from '../components/Spinner';
import SparklesIcon from '../components/icons/SparklesIcon';
import PlusIcon from '../components/icons/PlusIcon';
import GradeDonutChart from '../components/GradeDonutChart';
import ProblemAccordionItem from '../components/ProblemAccordionItem';
import InfoBanner from '../components/InfoBanner';

const EvaluationScreen = ({ navigation, route }) => {
  const { submission, assignment, classroom, userRole } = route.params || {};
  
  // Mock data for interface display
  const mockEvaluation = {
    overall_score: 85,
    problem_breakdown: [
      {
        problem_description: { en: 'Problem 1: Basic Calculation', he: 'שאלה 1: חישוב בסיסי' },
        score: 20,
        max_score: 25,
        feedback: { 
          en: 'Good work on the basic calculation, but there are some minor errors.',
          he: 'עבודה טובה על החישוב הבסיסי, אך יש כמה שגיאות קטנות.'
        },
        teacher_recommendation: { 
          en: 'Review the calculation steps carefully.',
          he: 'בדוק את שלבי החישוב בקפידה.'
        },
        errors: [
          {
            error_type: 'minor_slip',
            deduction: 5,
            explanation: { 
              en: 'Minor calculation error in step 2.',
              he: 'שגיאת חישוב קטנה בשלב 2.'
            },
            hint: { 
              en: 'Double-check your arithmetic.',
              he: 'בדוק שוב את החשבון שלך.'
            },
            boundingBox: { x: 0.1, y: 0.2, width: 0.3, height: 0.1 }
          }
        ]
      },
      {
        problem_description: { en: 'Problem 2: Word Problem', he: 'שאלה 2: בעיית מילים' },
        score: 22,
        max_score: 25,
        feedback: { 
          en: 'Excellent understanding of the word problem.',
          he: 'הבנה מעולה של בעיית המילים.'
        },
        teacher_recommendation: { 
          en: 'Keep up the good work!',
          he: 'המשך בעבודה הטובה!'
        },
        errors: []
      }
    ]
  };

  // Mock assignment and submission data for interface
  const mockAssignment = assignment || {
    title: 'Mathematics Assignment #1',
    id: '1'
  };

  const mockSubmission = submission || {
    studentId: 'student123',
    fileName: 'homework.pdf',
    fileData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // Small placeholder image
    id: '1'
  };

  const [manualEvaluation, setManualEvaluation] = useState(mockEvaluation);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');
  const [activeError, setActiveError] = useState(null);
  
  useEffect(() => {
    // Always show the evaluation interface for demo purposes
    setManualEvaluation(mockEvaluation);
  }, []);

  const handleEvaluate = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await gradeHomeworkWithAI(submission.fileData);
      setManualEvaluation(result);
    } catch (e) {
      console.error("Evaluation failed:", e);
      setError(`Evaluation failed. ${e.message || 'An unknown error occurred.'} Please check the console for details and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFinalScore = (breakdown) => {
    const totalScore = breakdown.reduce((acc, prob) => acc + (Number(prob.score) || 0), 0);
    const totalMaxScore = breakdown.reduce((acc, prob) => acc + (Number(prob.max_score) || 0), 0);
    return totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
  };

  const handleProblemChange = (index, field, value, subfield) => {
    setManualEvaluation(prev => {
        if (!prev) return null;
        const newBreakdown = [...prev.problem_breakdown];
        const problemToUpdate = { ...newBreakdown[index] };

        if (subfield && typeof problemToUpdate[field] === 'object') {
            problemToUpdate[field][subfield] = value;
        } else {
            problemToUpdate[field] = value;
        }
        newBreakdown[index] = problemToUpdate;
        
        return { ...prev, overall_score: calculateFinalScore(newBreakdown), problem_breakdown: newBreakdown };
    });
  };

  const handleErrorChange = (problemIndex, errorIndex, field, value, subfield) => {
      setManualEvaluation(prev => {
          if (!prev) return null;
          const newBreakdown = [...prev.problem_breakdown];
          const problemToUpdate = { ...newBreakdown[problemIndex] };
          const newErrors = [...problemToUpdate.errors];
          const errorToUpdate = { ...newErrors[errorIndex] };

          if (subfield && typeof errorToUpdate[field] === 'object') {
              errorToUpdate[field][subfield] = value;
          } else {
              errorToUpdate[field] = value;
          }
          newErrors[errorIndex] = errorToUpdate;
          problemToUpdate.errors = newErrors;
          newBreakdown[problemIndex] = problemToUpdate;
          return { ...prev, problem_breakdown: newBreakdown };
      });
  };

  const handleAddError = (problemIndex) => {
      const newError = {
          error_type: 'minor_slip',
          deduction: 1,
          explanation: { en: 'New error explanation.', he: 'הסבר שגיאה חדש.' },
          hint: { en: 'New hint.', he: 'רמז חדש.' },
          boundingBox: { x: 0, y: 0, width: 0.1, height: 0.1 },
      };
      setManualEvaluation(prev => {
          if (!prev) return null;
          const newBreakdown = [...prev.problem_breakdown];
          const problemToUpdate = { ...newBreakdown[problemIndex] };
          problemToUpdate.errors = [...problemToUpdate.errors, newError];
          newBreakdown[problemIndex] = problemToUpdate;
          return { ...prev, problem_breakdown: newBreakdown };
      });
  };

  const handleRemoveError = (problemIndex, errorIndex) => {
      setManualEvaluation(prev => {
          if (!prev) return null;
          const newBreakdown = [...prev.problem_breakdown];
          const problemToUpdate = { ...newBreakdown[problemIndex] };
          problemToUpdate.errors = problemToUpdate.errors.filter((_, idx) => idx !== errorIndex);
          newBreakdown[problemIndex] = problemToUpdate;
          return { ...prev, problem_breakdown: newBreakdown };
      });
  };

  const handleOverallScoreChange = (newScore) => {
      if (!isNaN(newScore) && newScore >= 0 && newScore <= 100) {
          setManualEvaluation(prev => prev ? {...prev, overall_score: newScore} : null);
      }
  }

  const handleAddProblem = () => {
    const newProblem = {
        problem_description: { en: 'New Question', he: 'שאלה חדשה' },
        score: 0,
        max_score: 25,
        feedback: { en: '', he: '' },
        teacher_recommendation: { en: '', he: '' },
        errors: [],
    };
    setManualEvaluation(prev => {
        const newBreakdown = prev ? [...prev.problem_breakdown, newProblem] : [newProblem];
        const newScore = calculateFinalScore(newBreakdown);
        return { overall_score: newScore, problem_breakdown: newBreakdown };
    });
  };

  const handleSaveAndSubmit = async () => {
    if (!manualEvaluation) return;

    try {
        await updateSubmissionEvaluation(classroom.id, assignment.id, submission.id, manualEvaluation);
        Alert.alert('Success', 'Grade has been submitted to the student!');
        navigation.goBack();
    } catch (err) {
        Alert.alert('Error', 'Failed to save and submit the grade. Please try again.');
        console.error(err);
    }
  };

  const onBack = () => {
    navigation.goBack();
  };

  const isTeacher = userRole === 'Teacher' || true; // Always show as teacher for demo

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Classroom</Text>
        </TouchableOpacity>
        
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{mockAssignment.title}</Text>
            <Text style={styles.subtitle}>
              Submission by: {mockSubmission.studentId} ({mockSubmission.fileName})
            </Text>
          </View>
          
          <InfoBanner>
            <Text style={styles.bannerTitle}>Beta Version: Scoring Assistant</Text>
            <Text style={styles.bannerText}>
              This is a scoring assistant, not an auto-grader. The AI provides suggestions for mistakes and scores, but the final grade must be determined by the teacher.
            </Text>
          </InfoBanner>

          <View style={styles.mainContent}>
            <View style={styles.imageContainer}>
              {/* PDF Preview Placeholder */}
              <View style={styles.pdfPreview}>
                <Text style={styles.pdfPlaceholderTitle}>📄 PDF Document Preview</Text>
                <Text style={styles.pdfPlaceholderText}>Mathematics Assignment #1</Text>
                <Text style={styles.pdfPlaceholderText}>Student: John Doe</Text>
                <View style={styles.pdfContent}>
                  <Text style={styles.pdfContentText}>1. Calculate: 2 + 3 × 4 = ?</Text>
                  <Text style={styles.pdfContentText}>   Answer: 14 ✓</Text>
                  <Text style={styles.pdfContentText}></Text>
                  <Text style={styles.pdfContentText}>2. Word Problem:</Text>
                  <Text style={styles.pdfContentText}>   A store has 24 apples...</Text>
                  <Text style={styles.pdfContentText}>   Answer: 18 apples ✓</Text>
                  <Text style={styles.pdfContentText}></Text>
                  <Text style={styles.pdfContentText}>3. Geometry:</Text>
                  <Text style={styles.pdfContentText}>   Area = length × width</Text>
                  <Text style={styles.pdfContentText}>   Answer: 45 cm² ✗</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.evaluationContainer}>
              {/* Always show evaluation interface for demo */}
              {manualEvaluation && (
                <View style={styles.evaluationResult}>
                  <View style={styles.evaluationHeader}>
                    <View>
                      <Text style={styles.evaluationTitle}>
                        {isTeacher ? "Evaluation & Grading" : "Evaluation Result"}
                      </Text>
                      <Text style={styles.evaluationSubtitle}>
                        Review the score and feedback below
                      </Text>
                    </View>
                    <View style={styles.languageToggle}>
                      <TouchableOpacity
                        style={[styles.languageButton, language === 'en' && styles.activeLanguage]}
                        onPress={() => setLanguage('en')}
                      >
                        <Text style={styles.languageText}>EN</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.languageButton, language === 'he' && styles.activeLanguage]}
                        onPress={() => setLanguage('he')}
                      >
                        <Text style={styles.languageText}>HE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.chartContainer}>
                    <GradeDonutChart 
                      score={manualEvaluation.overall_score}
                      isEditable={isTeacher}
                      onScoreChange={handleOverallScoreChange}
                    />
                  </View>
                  
                  <View style={styles.problemsContainer}>
                    <Text style={styles.problemsTitle}>Score Breakdown</Text>
                    {manualEvaluation.problem_breakdown.map((problem, idx) => (
                      <ProblemAccordionItem
                        key={idx}
                        problem={problem}
                        language={language}
                        onHoverError={setActiveError}
                        isEditable={isTeacher}
                        onProblemChange={(field, value, subfield) => handleProblemChange(idx, field, value, subfield)}
                        onErrorChange={(errorIdx, field, value, subfield) => handleErrorChange(idx, errorIdx, field, value, subfield)}
                        onAddError={() => handleAddError(idx)}
                        onRemoveError={(errorIdx) => handleRemoveError(idx, errorIdx)}
                      />
                    ))}
                  </View>

                  {isTeacher && (
                    <View style={styles.footer}>
                      <TouchableOpacity style={styles.addQuestionButton} onPress={handleAddProblem}>
                        <PlusIcon style={styles.buttonIcon} />
                        <Text style={styles.addQuestionText}>Add Missing Question</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.submitButton} onPress={handleSaveAndSubmit}>
                        <Text style={styles.submitButtonText}>Save & Submit to Student</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  bannerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
  },
  mainContent: {
    marginTop: 16,
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    height: 300,
    marginBottom: 16,
  },
  submissionImage: {
    width: '100%',
    height: '100%',
  },
  pdfPreview: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
  },
  pdfPlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  pdfPlaceholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  pdfContent: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pdfContentText: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'monospace',
    lineHeight: 18,
    marginBottom: 2,
  },
  evaluationContainer: {
    flex: 1,
  },
  readyToGrade: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  sparkleIcon: {
    marginBottom: 16,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  readyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
  },
  manualButtonText: {
    color: '#1d4ed8',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonIcon: {
    width: 20,
    height: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  evaluationResult: {
    flex: 1,
  },
  evaluationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  evaluationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  evaluationSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    padding: 4,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeLanguage: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageText: {
    fontSize: 14,
    color: '#374151',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  problemsContainer: {
    marginVertical: 16,
  },
  problemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  addQuestionText: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EvaluationScreen;
