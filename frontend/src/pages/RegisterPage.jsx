import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'
import Navbar from '../components/Navbar'
import CourseCard from '../components/CourseCard'
import SubmissionChart from '../components/SubmissionChart'
import { PlusIcon, BooksIcon, UsersIcon, NoteIcon, SchoolIcon } from '../components/Icons'

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 animate-pulse">
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

const CreateCourseModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Course title is required')
      return
    }
    setLoading(true)
    try {
      await axiosInstance.post('/courses', form)
      toast.success('Course created successfully!')
      onCreate()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course')
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
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Create New Course</h3>
        <p className="text-sm text-gray-500 mb-4">Add a new course for your students</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Introduction to Python"
              className="input-field"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the course..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Create Course
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const ProfessorDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  // Compute stats
  const totalStudents = courses.reduce((acc, c) => {
    const count = c.studentCount !== undefined ? c.studentCount : (c.studentIds?.length || 0)
    return acc + count
  }, 0)

  const totalAssignments = courses.reduce((acc, c) => acc + (c.assignmentIds?.length || 0), 0)

  const statCards = [
    { label: 'Total Courses', value: courses.length, Icon: BooksIcon, color: '#1A73E8' },
    { label: 'Total Students', value: totalStudents, Icon: UsersIcon, color: '#1E8E3E' },
    { label: 'Total Assignments', value: totalAssignments, Icon: NoteIcon, color: '#E65100' },
  ]

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-800 dark:text-gray-100">Your Classes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Create Class
          </button>
        </div>

        {/* Stats Row */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-gc p-5 flex items-center gap-4"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: stat.color + '1a' }}
                >
                  <stat.Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-medium text-gray-800 dark:text-gray-100">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Submission Analytics Chart */}
        {!loading && courses.length > 0 && (() => {
          const agg = courses.reduce(
            (acc, c) => {
              if (c.submissionStats) {
                acc.submitted += c.submissionStats.submitted || 0
                acc.acknowledged += c.submissionStats.acknowledged || 0
                acc.pending += c.submissionStats.pending || 0
                acc.total += c.submissionStats.total || 0
              }
              return acc
            },
            { submitted: 0, acknowledged: 0, pending: 0, total: 0 }
          )
          return agg.total > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-gc p-6 mb-8">
              <h2 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-1">Submission Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Aggregated across all classes</p>
              <SubmissionChart stats={agg} />
            </div>
          ) : null
        })()}

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
              <SchoolIcon className="w-16 h-16 text-gblue-200" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-2">No classes yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first class to start managing assignments</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create your first class
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                role="professor"
                onClick={() => navigate(`/professor/courses/${course._id}/assignments`)}
              />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showCreateModal && (
          <CreateCourseModal
            onClose={() => setShowCreateModal(false)}
            onCreate={fetchCourses}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfessorDashboard