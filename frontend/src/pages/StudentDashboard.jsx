import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'
import Navbar from '../components/Navbar'
import CourseCard from '../components/CourseCard'
import { PlusIcon, BooksIcon, WaveIcon } from '../components/Icons'

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
  </div>
)

const EnrollModal = ({ onClose, onEnroll }) => {
  const [courseCode, setCourseCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!courseCode.trim()) {
      toast.error('Please enter a course code')
      return
    }
    setLoading(true)
    try {
      const res = await axiosInstance.post('/courses/enroll', { courseCode: courseCode.trim().toUpperCase() })
      toast.success(res.data.message || 'Successfully enrolled!')
      onEnroll()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Enroll in a Course</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter the 6-character course code shared by your professor
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB12CD"
              maxLength={6}
              className="input-field font-mono text-lg tracking-[0.3em] uppercase text-center"
              autoFocus
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
              Course codes are 6 characters (letters & numbers)
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Enroll
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const StudentDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  const fetchCourses = async () => {
    try {
      const res = await axiosInstance.get('/courses')
      setCourses(res.data.courses)
    } catch (err) {
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
              {greeting}, {user?.name?.split(' ')[0]}!
              <WaveIcon className="w-6 h-6 text-yellow-500" />
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {courses.length > 0
                ? `You're enrolled in ${courses.length} course${courses.length !== 1 ? 's' : ''}`
                : 'Enroll in a course to get started'}
            </p>
          </div>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Enroll in Course
          </button>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="flex justify-center mb-4">
              <BooksIcon className="w-16 h-16 text-indigo-300" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-2">No courses yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Enroll in a course to start viewing assignments</p>
            <button onClick={() => setShowEnrollModal(true)} className="btn-primary">
              Enroll in your first course
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                role="student"
                onClick={() => navigate(`/student/courses/${course._id}/assignments`)}
              />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showEnrollModal && (
          <EnrollModal
            onClose={() => setShowEnrollModal(false)}
            onEnroll={fetchCourses}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default StudentDashboard