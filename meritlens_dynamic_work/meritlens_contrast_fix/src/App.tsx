/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { StudentManagement } from './pages/teacher/StudentManagement';
import { PerformanceAnalysis } from './pages/teacher/PerformanceAnalysis';
import { MLPredictionsPage } from './pages/teacher/MLPredictionsPage';
import { ProgressTrackingPage } from './pages/teacher/ProgressTrackingPage';
import { LearningMemoryPage } from './pages/teacher/LearningMemoryPage';
import { SettingsPage } from './pages/teacher/SettingsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudyRecommendationsPage } from './pages/student/StudyRecommendationsPage';
import { StudentProgressPage } from './pages/student/StudentProgressPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

function AppContent() {
  const { user, role, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [targetedStudentId, setTargetedStudentId] = useState<string | null>(null);

  // Sync default tab on role switch
  React.useEffect(() => {
    if (role === 'teacher') {
      setCurrentTab('dashboard');
    } else if (role === 'student') {
      setCurrentTab('my-dashboard');
    }
  }, [role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">Initializing MeritLens AI...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Teacher navigation helper
  const handleNavigateToStudent = (studentId: string) => {
    setTargetedStudentId(studentId);
    setCurrentTab('students');
  };

  const renderActiveView = () => {
    if (role === 'teacher') {
      switch (currentTab) {
        case 'dashboard':
          return (
            <TeacherDashboard
              onNavigateToStudent={handleNavigateToStudent}
            />
          );
        case 'students':
          return (
            <StudentManagement
              initialSelectedStudentId={targetedStudentId}
              onClearInitialStudent={() => setTargetedStudentId(null)}
            />
          );
        case 'performance-analysis':
          return <PerformanceAnalysis />;
        case 'ml-predictions':
          return <MLPredictionsPage />;
        case 'progress-tracking':
          return <ProgressTrackingPage />;
        case 'learning-memory':
          return <LearningMemoryPage />;
        case 'settings':
          return <SettingsPage />;
        default:
          return (
            <TeacherDashboard
              onNavigateToStudent={handleNavigateToStudent}
            />
          );
      }
    }

    // Student Views
    switch (currentTab) {
      case 'my-dashboard':
        return (
          <StudentDashboard
            onNavigateToRecommendations={() => setCurrentTab('my-recommendations')}
            onNavigateToProgress={() => setCurrentTab('my-progress')}
          />
        );
      case 'my-recommendations':
        return <StudyRecommendationsPage />;
      case 'my-progress':
        return <StudentProgressPage />;
      case 'my-profile':
        return <StudentProfilePage />;
      default:
        return (
          <StudentDashboard
            onNavigateToRecommendations={() => setCurrentTab('my-recommendations')}
            onNavigateToProgress={() => setCurrentTab('my-progress')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 antialiased">
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          currentTab={currentTab}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto text-slate-100">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
