import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, Linking, Dimensions, TextInput, I18nManager } from 'react-native';
import { WebView } from 'react-native-webview'; // Using WebView for PDF display instead

const EvaluationScreen = ({ navigation, route }) => {
  const { submission, assignment, classroom, userRole } = route.params || {};
  
  // Mock data matching the interface in the image
  const mockEvaluation = {
    overall_score: 93,
    total_points: 100,
    problem_breakdown: [
      {
        id: 1,
        title: 'Data Analysis',
        score: 17,
        max_score: 17,
        status: 'correct', // correct, partial, incorrect
        student_feedback: 'Perfect score! You accurately identified all possible outcomes and calculated probabilities for various scenarios involving two',
        teacher_recommendations: 'Excellent work on identifying all outcomes. The student has a comprehensive understanding of fundamental concepts, including sample space and calculating',
        errors: [],
        hints: [],
        expanded: false
      },
      {
        id: 2,
        title: 'Probability',
        score: 12,
        max_score: 17,
        status: 'partial',
        student_feedback: '',
        teacher_recommendations: '',
        errors: [
          {
            id: 1,
            type: 'calculation_error',
            description: 'Minor calculation error in step 3',
            hint: 'Double-check your fraction simplification',
            points_deducted: 3
          }
        ],
        hints: [],
        expanded: false
      },
      {
        id: 3,
        title: 'Circle Circles',
        score: 17,
        max_score: 17,
        status: 'correct',
        student_feedback: 'Outstanding! You successfully set up the equations for the rectangle\'s perimeter, solved for the unknown side length, and correctly',
        teacher_recommendations: 'The student shows remarkable skills in setting up and solving equations from word problems, and a solid understanding of',
        errors: [],
        hints: [],
        expanded: false
      },
      {
        id: 4,
        title: 'Rectangle',
        score: 15,
        max_score: 17,
        status: 'partial',
        student_feedback: '',
        teacher_recommendations: '',
        errors: [],
        hints: [],
        expanded: false
      },
      {
        id: 5,
        title: 'Data Integration',
        score: 16,
        max_score: 16,
        status: 'correct',
        student_feedback: '',
        teacher_recommendations: '',
        errors: [],
        hints: [],
        expanded: false
      },
      {
        id: 6,
        title: 'Word Problem',
        score: 16,
        max_score: 16,
        status: 'correct',
        student_feedback: 'Excellent work on this word problem! You correctly found initial total, calculated the difference, and accurately',
        teacher_recommendations: 'The student excels at translating real-world scenarios into mathematical problems, performing calculations, and creating',
        errors: [],
        hints: [],
        expanded: false
      }
    ]
  };

  // Mock assignment and submission data for interface
  const mockAssignment = assignment || {
    title: 'Chapter 3',
    id: '1'
  };

  // Enhanced submission data with better PDF handling
  const mockSubmission = submission || {
    studentId: 'student@example.com',
    fileName: 'chapter3_homework.pdf',
    fileData: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileUri: submission?.fileUri || submission?.fileData || submission?.filePath || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: submission?.fileSize || '2.3 MB',
    submittedAt: submission?.submittedAt || '2025-09-08 14:30',
    id: submission?.id || '1'
  };

  // Function to get the PDF source based on the submission data
  const getPdfSource = () => {
    if (submission?.fileUri) {
      // If it's a remote URL
      if (submission.fileUri.startsWith('http')) {
        return { uri: submission.fileUri };
      }
      // If it's a local file path
      return { uri: `file://${submission.fileUri}` };
    }
    
    // Fallback to mock data
    return { uri: mockSubmission.fileUri };
  };

  const [evaluation, setEvaluation] = useState(mockEvaluation);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [editingProblem, setEditingProblem] = useState(null);
  const [editingError, setEditingError] = useState(null);
  const [pdfError, setPdfError] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [editingOverallGrade, setEditingOverallGrade] = useState(false);
  const [tempOverallGrade, setTempOverallGrade] = useState('');
  const [editingQuestionGrade, setEditingQuestionGrade] = useState(null);
  const [tempQuestionGrade, setTempQuestionGrade] = useState('');
  
  const isTeacher = userRole === 'Teacher' || true; // Always show as teacher for demo

  // Language support
  const translations = {
    en: {
      aiMathGrader: '🤖 AI Math Grader',
      loggedInAs: 'Logged in as: Teacher',
      logout: 'Logout',
      backToClassroom: '← Back to Classroom',
      betaTitle: 'ℹ️ Beta Version: Scoring Assistant',
      betaText: 'This is a scoring assistant, not an auto-grader. The AI provides suggestions for mistakes and scores, but the final grade must be determined by the teacher.',
      studentSubmission: '📄 Student Submission',
      student: 'Student',
      size: 'Size',
      submitted: 'Submitted',
      downloadPdf: '📥 Download PDF',
      pdfDocumentPreview: '📄 PDF Document Preview',
      fullscreen: '⛶ Fullscreen',
      loadingPdf: 'Loading PDF...',
      failedToLoadPdf: 'Failed to load PDF preview',
      tryDownloading: 'Try downloading the file or opening in an external app',
      retry: '🔄 Retry',
      openExternal: '📱 Open External',
      noPdfAvailable: 'No PDF available',
      evaluationGrading: 'Evaluation & Grading',
      overallGrade: 'Overall Grade',
      editOverallGrade: '✏️ Edit Overall Grade',
      scoreBreakdown: 'Score Breakdown',
      question: 'Question',
      studentFeedback: 'Student Feedback',
      teacherRecommendations: 'Teacher Recommendations',
      errors: 'Errors',
      addError: '+ Add Error',
      saveSubmitToStudent: 'Save & Submit to Student',
      enterFeedbackForStudent: 'Enter feedback for the student...',
      enterInternalNotes: 'Enter internal notes and recommendations...',
      errorDescription: 'Error description...',
      hintForStudent: 'Hint for student...',
      pointsDeducted: 'Points deducted',
      editGrade: '✏️ Edit Grade',
      grade: 'Grade'
    },
    he: {
      aiMathGrader: '🤖 מערכת בדיקה חכמה למתמטיקה',
      loggedInAs: 'מחובר כ: מורה',
      logout: 'התנתק',
      backToClassroom: '← חזור לכיתה',
      betaTitle: 'ℹ️ גרסת ביטא: עוזר ציונים',
      betaText: 'זהו עוזר ציונים, לא בדיקה אוטומטית. הבינה המלאכותית מספקת הצעות לטעויות וציונים, אך הציון הסופי חייב להיקבע על ידי המורה.',
      studentSubmission: '📄 הגשת התלמיד',
      student: 'תלמיד',
      size: 'גודל',
      submitted: 'הוגש',
      downloadPdf: '📥 הורד PDF',
      pdfDocumentPreview: '📄 תצוגה מקדימה של מסמך PDF',
      fullscreen: '⛶ מסך מלא',
      loadingPdf: 'טוען PDF...',
      failedToLoadPdf: 'נכשל בטעינת תצוגה מקדימה של PDF',
      tryDownloading: 'נסה להוריד את הקובץ או לפתוח באפליקציה חיצונית',
      retry: '🔄 נסה שוב',
      openExternal: '📱 פתח חיצוני',
      noPdfAvailable: 'אין PDF זמין',
      evaluationGrading: 'הערכה וציונים',
      overallGrade: 'ציון כללי',
      editOverallGrade: '✏️ ערוך ציון כללי',
      scoreBreakdown: 'פירוט ציונים',
      question: 'שאלה',
      studentFeedback: 'משוב לתלמיד',
      teacherRecommendations: 'המלצות המורה',
      errors: 'שגיאות',
      addError: '+ הוסף שגיאה',
      saveSubmitToStudent: 'שמור ושלח לתלמיד',
      enterFeedbackForStudent: 'הכנס משוב לתלמיד...',
      enterInternalNotes: 'הכנס הערות פנימיות והמלצות...',
      errorDescription: 'תיאור שגיאה...',
      hintForStudent: 'רמז לתלמיד...',
      pointsDeducted: 'נקודות שנוכו',
      editGrade: '✏️ ערוך ציון',
      grade: 'ציון'
    }
  };

  const t = translations[language] || translations.en;

  // Handle screen orientation changes
  useEffect(() => {
    const onChange = (result) => {
      setScreenData(result.window);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  // Determine if screen is tablet/desktop size
  const isLargeScreen = screenData.width > 768;

  // Function to handle PDF loading errors
  const handlePdfError = (error) => {
    console.log('PDF Loading Error:', error);
    setPdfError(true);
    Alert.alert(
      'PDF Loading Error', 
      'Unable to load the PDF file. Please check your internet connection or contact support.',
      [
        { text: 'OK', onPress: () => setPdfError(false) },
        { text: 'Download', onPress: () => Linking.openURL(mockSubmission.fileUri) }
      ]
    );
  };

  // Function to download PDF
  const downloadPdf = async () => {
    try {
      await Linking.openURL(mockSubmission.fileUri);
    } catch (error) {
      Alert.alert('Download Error', 'Unable to open PDF for download');
    }
  };

  // Toggle problem expansion
  const toggleProblem = (problemId) => {
    setEvaluation(prev => ({
      ...prev,
      problem_breakdown: prev.problem_breakdown.map(problem =>
        problem.id === problemId 
          ? { ...problem, expanded: !problem.expanded }
          : problem
      )
    }));
  };

  // Update problem data
  const updateProblem = (problemId, field, value) => {
    setEvaluation(prev => ({
      ...prev,
      problem_breakdown: prev.problem_breakdown.map(problem =>
        problem.id === problemId 
          ? { ...problem, [field]: value }
          : problem
      )
    }));
  };

  // Add error to problem
  const addError = (problemId) => {
    const newError = {
      id: Date.now(),
      type: 'calculation_error',
      description: 'New error description',
      hint: 'New hint for student',
      points_deducted: 1
    };
    
    setEvaluation(prev => ({
      ...prev,
      problem_breakdown: prev.problem_breakdown.map(problem =>
        problem.id === problemId 
          ? { ...problem, errors: [...problem.errors, newError] }
          : problem
      )
    }));
  };

  // Update error
  const updateError = (problemId, errorId, field, value) => {
    setEvaluation(prev => ({
      ...prev,
      problem_breakdown: prev.problem_breakdown.map(problem =>
        problem.id === problemId 
          ? {
              ...problem,
              errors: problem.errors.map(error =>
                error.id === errorId 
                  ? { ...error, [field]: value }
                  : error
              )
            }
          : problem
      )
    }));
  };

  // Remove error
  const removeError = (problemId, errorId) => {
    setEvaluation(prev => ({
      ...prev,
      problem_breakdown: prev.problem_breakdown.map(problem =>
        problem.id === problemId 
          ? { ...problem, errors: problem.errors.filter(error => error.id !== errorId) }
          : problem
      )
    }));
  };

  // Calculate total score
  const calculateTotalScore = () => {
    const totalEarned = evaluation.problem_breakdown.reduce((sum, problem) => sum + problem.score, 0);
    const totalPossible = evaluation.problem_breakdown.reduce((sum, problem) => sum + problem.max_score, 0);
    return { earned: totalEarned, possible: totalPossible };
  };

  // Handle overall grade editing
  const handleEditOverallGrade = () => {
    const currentScore = calculateTotalScore();
    setTempOverallGrade(`${currentScore.earned}/${currentScore.possible}`);
    setEditingOverallGrade(true);
  };

  const handleSaveOverallGrade = () => {
    try {
      const [earned, possible] = tempOverallGrade.split('/').map(num => parseInt(num.trim()));
      if (earned >= 0 && possible > 0 && earned <= possible) {
        // Distribute the score proportionally across problems
        const ratio = earned / calculateTotalScore().possible;
        setEvaluation(prev => ({
          ...prev,
          problem_breakdown: prev.problem_breakdown.map(problem => ({
            ...problem,
            score: Math.round(problem.max_score * ratio)
          }))
        }));
        setEditingOverallGrade(false);
        Alert.alert('Success', 'Overall grade updated successfully');
      } else {
        Alert.alert('Invalid Grade', 'Please enter a valid grade format (e.g., 85/100)');
      }
    } catch (error) {
      Alert.alert('Invalid Format', 'Please use format: earned/total (e.g., 85/100)');
    }
  };

  const handleCancelOverallGrade = () => {
    setEditingOverallGrade(false);
    setTempOverallGrade('');
  };

  // Handle question grade editing
  const handleEditQuestionGrade = (problemId) => {
    const problem = evaluation.problem_breakdown.find(p => p.id === problemId);
    setTempQuestionGrade(`${problem.score}/${problem.max_score}`);
    setEditingQuestionGrade(problemId);
  };

  const handleSaveQuestionGrade = () => {
    try {
      const [earned, possible] = tempQuestionGrade.split('/').map(num => parseInt(num.trim()));
      if (earned >= 0 && possible > 0 && earned <= possible) {
        setEvaluation(prev => ({
          ...prev,
          problem_breakdown: prev.problem_breakdown.map(problem =>
            problem.id === editingQuestionGrade 
              ? { ...problem, score: earned, max_score: possible }
              : problem
          )
        }));
        setEditingQuestionGrade(null);
        setTempQuestionGrade('');
        Alert.alert('Success', 'Question grade updated successfully');
      } else {
        Alert.alert('Invalid Grade', 'Please enter a valid grade where earned ≤ possible');
      }
    } catch (error) {
      Alert.alert('Invalid Format', 'Please use format: earned/total (e.g., 15/17)');
    }
  };

  const handleCancelQuestionGrade = () => {
    setEditingQuestionGrade(null);
    setTempQuestionGrade('');
  };

  // Save and submit evaluation
  const handleSaveAndSubmit = () => {
    Alert.alert(
      'Submit Evaluation',
      'Are you sure you want to submit this evaluation to the student? They will only see student feedback, errors, and hints - not teacher recommendations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => {
          Alert.alert('Success', 'Evaluation submitted to student successfully!');
          navigation.goBack();
        }}
      ]
    );
  };

  return (
    <View style={[styles.container, language === 'he' && styles.rtlContainer]}>
      {/* Header */}
      <View style={[styles.header, language === 'he' && styles.rtlHeader]}>
        <Text style={styles.headerTitle}>{t.aiMathGrader}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerUser}>{t.loggedInAs}</Text>
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{t.backToClassroom}</Text>
          </TouchableOpacity>
          
          {/* Assignment Title */}
          <Text style={styles.assignmentTitle}>{mockAssignment.title}</Text>
          
          {/* Beta Banner */}
          <View style={styles.betaBanner}>
            <Text style={styles.betaTitle}>{t.betaTitle}</Text>
            <Text style={styles.betaText}>
              {t.betaText}
            </Text>
          </View>

          {/* Main Content Area */}
          <View style={[styles.mainContent, isLargeScreen && styles.mainContentLarge]}>
            {/* Student Submission Section - Now on Top */}
            <View style={[styles.submissionSection, isLargeScreen && styles.submissionSectionLarge]}>
              <Text style={styles.pdfTitle}>{t.studentSubmission}</Text>
              <View style={styles.submissionInfo}>
                <View style={styles.submissionMeta}>
                  <Text style={styles.pdfFileName}>{mockSubmission.fileName}</Text>
                  <Text style={styles.pdfMeta}>{t.student}: {mockSubmission.studentId}</Text>
                  <Text style={styles.pdfMeta}>{t.size}: {mockSubmission.fileSize}</Text>
                  <Text style={styles.pdfMeta}>{t.submitted}: {mockSubmission.submittedAt}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={downloadPdf}
                >
                  <Text style={styles.downloadButtonText}>{t.downloadPdf}</Text>
                </TouchableOpacity>
              </View>
              
              {/* PDF Viewer Container */}
              <View style={[styles.pdfContainer, isLargeScreen && styles.pdfContainerLarge]}>
                {mockSubmission.fileUri && !pdfError ? (
                  <View style={styles.pdfPreviewContainer}>
                    <View style={styles.pdfHeader}>
                      <Text style={styles.pdfHeaderText}>{t.pdfDocumentPreview}</Text>
                      <TouchableOpacity 
                        style={styles.fullscreenButton}
                        onPress={() => Linking.openURL(mockSubmission.fileUri)}
                      >
                        <Text style={styles.fullscreenButtonText}>{t.fullscreen}</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* WebView for PDF (fallback to Google Docs viewer) */}
                    <WebView
                      source={{ 
                        uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(mockSubmission.fileUri)}` 
                      }}
                      style={styles.webviewStyle}
                      onLoad={() => {
                        console.log('PDF loaded successfully');
                        setPdfError(false);
                      }}
                      onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.log('WebView error: ', nativeEvent);
                        setPdfError(true);
                      }}
                      onHttpError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.log('WebView HTTP error: ', nativeEvent);
                        setPdfError(true);
                      }}
                      startInLoadingState={true}
                      renderLoading={() => (
                        <View style={styles.loadingContainer}>
                          <Text style={styles.loadingText}>{t.loadingPdf}</Text>
                        </View>
                      )}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      allowsFullscreenVideo={true}
                    />
                  </View>
                ) : (
                  <View style={styles.noPdfContainer}>
                    <Text style={styles.noPdfText}>
                      {pdfError ? t.failedToLoadPdf : t.noPdfAvailable}
                    </Text>
                    {pdfError && (
                      <Text style={styles.errorDetails}>
                        {t.tryDownloading}
                      </Text>
                    )}
                    <View style={styles.actionButtons}>
                      {pdfError && (
                        <TouchableOpacity 
                          style={styles.retryButton}
                          onPress={() => {
                            setPdfError(false);
                          }}
                        >
                          <Text style={styles.retryButtonText}>{t.retry}</Text>
                        </TouchableOpacity>
                      )}
                      {mockSubmission.fileUri && (
                        <TouchableOpacity 
                          style={styles.openExternalButton}
                          onPress={() => Linking.openURL(mockSubmission.fileUri)}
                        >
                          <Text style={styles.openExternalText}>{t.openExternal}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Evaluation Panel - Now Below Submission */}
            <View style={[styles.evaluationPanel, isLargeScreen && styles.evaluationPanelLarge]}>
              {/* Language Toggle */}
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

              {/* Evaluation & Grading Section */}
              <Text style={styles.evaluationTitle}>{t.evaluationGrading}</Text>
              
              {/* Overall Score with Edit Capability */}
              <View style={styles.overallGradeSection}>
                <Text style={styles.overallGradeLabel}>{t.overallGrade}</Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreNumber}>{calculateTotalScore().earned}</Text>
                  <Text style={styles.scoreTotal}>/ {calculateTotalScore().possible}</Text>
                </View>
                
                {/* Teacher can edit overall grade */}
                {isTeacher && (
                  <View style={styles.gradeEditContainer}>
                    {editingOverallGrade ? (
                      <View style={styles.gradeEditRow}>
                        <TextInput
                          style={styles.gradeInput}
                          value={tempOverallGrade}
                          onChangeText={setTempOverallGrade}
                          placeholder="85/100"
                          placeholderTextColor="#9ca3af"
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveOverallGrade}>
                          <Text style={styles.saveButtonText}>✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOverallGrade}>
                          <Text style={styles.cancelButtonText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.editButton} onPress={handleEditOverallGrade}>
                        <Text style={styles.editButtonText}>{t.editOverallGrade}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
              
              {/* Score Breakdown */}
              <Text style={styles.breakdownTitle}>{t.scoreBreakdown}</Text>
              
              {/* Problems List */}
              {evaluation.problem_breakdown.map((problem, index) => (
                <View key={problem.id} style={styles.problemContainer}>
                  {/* Problem Header */}
                  <TouchableOpacity 
                    style={styles.problemHeader}
                    onPress={() => toggleProblem(problem.id)}
                  >
                    <View style={styles.problemHeaderLeft}>
                      <View style={[
                        styles.statusIndicator,
                        { backgroundColor: problem.status === 'correct' ? '#10b981' : problem.status === 'partial' ? '#f59e0b' : '#ef4444' }
                      ]} />
                      <Text style={styles.problemTitle}>{t.question} {index + 1}: {problem.title}</Text>
                    </View>
                    <View style={styles.problemHeaderRight}>
                      {isTeacher && editingQuestionGrade === problem.id ? (
                        <View style={styles.gradeEditRowSmall}>
                          <TextInput
                            style={styles.gradeInputSmall}
                            value={tempQuestionGrade}
                            onChangeText={setTempQuestionGrade}
                            placeholder="15/17"
                            placeholderTextColor="#9ca3af"
                          />
                          <TouchableOpacity style={styles.saveButtonSmall} onPress={handleSaveQuestionGrade}>
                            <Text style={styles.saveButtonText}>✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.cancelButtonSmall} onPress={handleCancelQuestionGrade}>
                            <Text style={styles.cancelButtonText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.gradeDisplay}>
                          <Text style={styles.problemScore}>{problem.score} / {problem.max_score}</Text>
                          {isTeacher && (
                            <TouchableOpacity 
                              style={styles.editGradeButton}
                              onPress={() => handleEditQuestionGrade(problem.id)}
                            >
                              <Text style={styles.editGradeText}>✏️</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                      <Text style={styles.expandIcon}>{problem.expanded ? '⌄' : '⌃'}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {problem.expanded && (
                    <View style={styles.problemContent}>
                      {/* Student Feedback Section */}
                      <View style={styles.feedbackSection}>
                        <Text style={styles.sectionTitle}>{t.studentFeedback}</Text>
                        {isTeacher ? (
                          <TextInput
                            style={styles.feedbackInput}
                            value={problem.student_feedback}
                            onChangeText={(text) => updateProblem(problem.id, 'student_feedback', text)}
                            placeholder={t.enterFeedbackForStudent}
                            placeholderTextColor="#9ca3af"
                            multiline
                          />
                        ) : (
                          <Text style={styles.feedbackText}>{problem.student_feedback}</Text>
                        )}
                      </View>

                      {/* Teacher Recommendations Section (Teacher Only) */}
                      {isTeacher && (
                        <View style={styles.feedbackSection}>
                          <Text style={styles.sectionTitle}>{t.teacherRecommendations}</Text>
                          <TextInput
                            style={styles.feedbackInput}
                            value={problem.teacher_recommendations}
                            onChangeText={(text) => updateProblem(problem.id, 'teacher_recommendations', text)}
                            placeholder={t.enterInternalNotes}
                            placeholderTextColor="#9ca3af"
                            multiline
                          />
                        </View>
                      )}

                      {/* Errors Section */}
                      {problem.errors.length > 0 && (
                        <View style={styles.errorsSection}>
                          <Text style={styles.sectionTitle}>{t.errors}</Text>
                          {problem.errors.map((error) => (
                            <View key={error.id} style={styles.errorItem}>
                              <View style={styles.errorHeader}>
                                <Text style={styles.errorType}>{error.type}</Text>
                                {isTeacher && (
                                  <TouchableOpacity 
                                    style={styles.removeButton}
                                    onPress={() => removeError(problem.id, error.id)}
                                  >
                                    <Text style={styles.removeButtonText}>✕</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                              
                              {isTeacher ? (
                                <>
                                  <TextInput
                                    style={styles.errorInput}
                                    value={error.description}
                                    onChangeText={(text) => updateError(problem.id, error.id, 'description', text)}
                                    placeholder={t.errorDescription}
                                    placeholderTextColor="#9ca3af"
                                  />
                                  <TextInput
                                    style={styles.errorInput}
                                    value={error.hint}
                                    onChangeText={(text) => updateError(problem.id, error.id, 'hint', text)}
                                    placeholder={t.hintForStudent}
                                    placeholderTextColor="#9ca3af"
                                  />
                                  <TextInput
                                    style={styles.pointsInput}
                                    value={error.points_deducted.toString()}
                                    onChangeText={(text) => updateError(problem.id, error.id, 'points_deducted', parseInt(text) || 0)}
                                    placeholder={t.pointsDeducted}
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                  />
                                </>
                              ) : (
                                <>
                                  <Text style={styles.errorText}>{error.description}</Text>
                                  <Text style={styles.hintText}>💡 {error.hint}</Text>
                                </>
                              )}
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Add Error Button (Teacher Only) */}
                      {isTeacher && (
                        <TouchableOpacity 
                          style={styles.addErrorButton}
                          onPress={() => addError(problem.id)}
                        >
                          <Text style={styles.addErrorText}>{t.addError}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ))}

              {/* Submit Button (Teacher Only) */}
              {isTeacher && (
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSaveAndSubmit}
                >
                  <Text style={styles.submitButtonText}>{t.saveSubmitToStudent}</Text>
                </TouchableOpacity>
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
    backgroundColor: '#f8f9fa',
  },
  rtlContainer: {
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rtlHeader: {
    flexDirection: 'row-reverse',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUser: {
    color: '#e0e7ff',
    fontSize: 14,
    marginRight: 12,
  },
  logoutButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4f46e5',
  },
  assignmentTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  betaBanner: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  betaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  betaText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  mainContent: {
    flex: 1,
  },
  mainContentLarge: {
    flexDirection: 'row',
  },
  submissionSection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submissionSectionLarge: {
    flex: 1,
    marginBottom: 0,
    marginRight: 12,
  },
  submissionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  submissionMeta: {
    flex: 1,
    minWidth: 200,
  },
  downloadButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  pdfContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    minHeight: 300,
    maxHeight: 400,
  },
  pdfContainerLarge: {
    minHeight: 500,
    maxHeight: 600,
  },
  pdfViewer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfViewerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pdfPath: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  pdfStyle: {
    flex: 1,
    width: '100%',
  },
  pdfPreviewContainer: {
    flex: 1,
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pdfHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  fullscreenButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fullscreenButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  webviewStyle: {
    flex: 1,
  },
  noPdfContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noPdfText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  openExternalButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    marginHorizontal: 6,
  },
  openExternalText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorDetails: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  evaluationPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  evaluationPanelLarge: {
    flex: 1,
    marginLeft: 12,
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  pdfFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  pdfMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    padding: 4,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeLanguage: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  evaluationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  overallGradeSection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  overallGradeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#059669',
  },
  scoreTotal: {
    fontSize: 24,
    color: '#6b7280',
    marginTop: -8,
  },
  gradeEditContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  gradeEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradeEditRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  gradeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minWidth: 80,
    textAlign: 'center',
  },
  gradeInputSmall: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    backgroundColor: '#ffffff',
    minWidth: 60,
    textAlign: 'center',
    marginRight: 4,
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 4,
  },
  saveButtonSmall: {
    backgroundColor: '#10b981',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 2,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 4,
  },
  cancelButtonSmall: {
    backgroundColor: '#ef4444',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  problemContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  problemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  problemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  problemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  problemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  editGradeButton: {
    marginLeft: 4,
    padding: 4,
  },
  editGradeText: {
    fontSize: 12,
    color: '#4f46e5',
  },
  problemScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 16,
    color: '#6b7280',
  },
  problemContent: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  feedbackSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
    minHeight: 60,
  },
  feedbackText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
  },
  errorsSection: {
    marginBottom: 16,
  },
  errorItem: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  errorType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  removeButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 6,
    fontSize: 12,
    backgroundColor: '#ffffff',
    marginBottom: 4,
  },
  pointsInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 6,
    fontSize: 12,
    backgroundColor: '#ffffff',
    width: 80,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#059669',
    fontStyle: 'italic',
  },
  addErrorButton: {
    backgroundColor: '#dbeafe',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addErrorText: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EvaluationScreen;
