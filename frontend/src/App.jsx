import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Security
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import SubjectsPage from './pages/SubjectsPage';
import ChapterPage from './pages/ChapterPage';
import LessonReaderPage from './pages/LessonReaderPage';
import PracticeTestPage from './pages/PracticeTestPage';
import ResultsPage from './pages/ResultsPage';
import VirtualLabPage from './pages/VirtualLabPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Authenticated Student Pages with Persistent Mobile Bottom Navigation */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:subjectId/chapters/:chapterId" element={<ChapterPage />} />
        <Route path="/lessons/:lessonId" element={<LessonReaderPage />} />
        <Route path="/practice/:chapterId" element={<PracticeTestPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/labs/:labId" element={<VirtualLabPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

