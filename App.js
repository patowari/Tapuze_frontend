import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './screens/AuthScreen';
import SignupScreen from './screens/SignupScreen';
import StudentDashboard from './screens/StudentDashboard';
import LecturerDashboard from './screens/LecturerDashboard';
import ClassroomScreen from './screens/ClassroomScreen';
import CreateClassroom from './screens/CreateClassroom';
import CreateAssignment from './screens/CreateAssignment';
import SubmitAssignment from './screens/SubmitAssignment';
import SubmissionsScreen from './screens/SubmissionsScreen';
import SubmissionDetailScreen from './screens/SubmissionDetailScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AIEvaluationScreen from './screens/AIEvaluationScreen';
import EvaluationScreen from './screens/EvaluationScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: 'Back', // For iOS
      }}
    >
      {user ? (
        user.role === 'student' ? (
          <>
            <Stack.Screen
              name="StudentDashboard"
              component={StudentDashboard}
              options={{
                title: 'Student Dashboard',
                headerLeft: () => null,
              }}
            />
            <Stack.Screen
              name="Classroom"
              component={ClassroomScreen}
              options={{ title: 'Classroom' }}
            />
            <Stack.Screen
              name="SubmitAssignment"
              component={SubmitAssignment}
              options={{ title: 'Submit Assignment' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'My Profile' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="LecturerDashboard"
              component={LecturerDashboard}
              options={{
                title: 'Lecturer Dashboard',
                headerLeft: () => null,
              }}
            />
            <Stack.Screen
              name="CreateClassroom"
              component={CreateClassroom}
              options={{ title: 'Create Classroom' }}
            />
            <Stack.Screen
              name="Classroom"
              component={ClassroomScreen}
              options={{ title: 'Classroom' }}
            />
            <Stack.Screen
              name="CreateAssignment"
              component={CreateAssignment}
              options={{ title: 'Create Assignment' }}
            />
            <Stack.Screen
              name="Submissions"
              component={SubmissionsScreen}
              options={{ title: 'Student Submissions' }}
            />
            <Stack.Screen
              name="SubmissionDetail"
              component={SubmissionDetailScreen}
              options={{ title: 'Submission Details' }}
            />
            <Stack.Screen 
              name="ManualEvaluation" 
              component={EvaluationScreen}
              options={{ title: 'Evaluate Submission' }}
            />
            <Stack.Screen 
              name="AIEvaluation" 
              component={AIEvaluationScreen}
              options={{ title: 'AI Evaluation' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'My Profile' }}
            />
          </>
        )
      ) : (
        <>
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ title: 'Sign Up' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}