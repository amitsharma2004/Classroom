import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Loader from './components/Loader'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/StudentDashboard'
import ProfessorDashboard from './pages/ProfessorDashboard'
import AssignmentPage from './pages/AssignmentPage'
import CoursesPage from './pages/CoursesPage'
import StudentPerformancePage from './pages/StudentPerformancePage'

// Root redirect based on role
const RootRedirect = () => {
  const { user, loading } = useAuth()

  if (loading) return <Loader />

  if (!user) return <Navigate to="/login" replace />

  if (user.role === 'professor') return <Navigate to="/professor/dashboard" replace />

  return <Navigate to="/student/dashboard" replace />
}

const AppRoutes = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#1f2937',
            color: '#fff',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:courseId/assignments"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AssignmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/performance"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentPerformancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['professor']}>
              <ProfessorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professor/courses"
          element={
            <ProtectedRoute allowedRoles={['professor']}>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professor/courses/:courseId/assignments"
          element={
            <ProtectedRoute allowedRoles={['professor']}>
              <AssignmentPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App