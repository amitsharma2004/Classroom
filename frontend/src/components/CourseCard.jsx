import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { DocumentIcon, UsersIcon, ClipboardIcon, CheckIcon } from './Icons'
import toast from 'react-hot-toast'

// 8 Google Classroom-style banner colors
const BANNER_COLORS = [
  '#1A73E8', // Google Blue
  '#00796B', // Teal
  '#1E8E3E', // Green
  '#E65100', // Orange
  '#7B1FA2', // Purple
  '#C62828', // Red
  '#AD1457', // Pink
  '#4527A0', // Deep Purple
]

// Pick a consistent color based on the course title
const getBannerColor = (title = '') => {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash)
  return BANNER_COLORS[Math.abs(hash) % BANNER_COLORS.length]
}

const CourseCard = ({ course, onClick, role }) => {
  const [copied, setCopied] = useState(false)
  const bannerColor = getBannerColor(course.title)

  const handleCopyCode = (e) => {
    e.stopPropagation()
    if (!course.courseCode) return
    navigator.clipboard.writeText(course.courseCode).then(() => {
      setCopied(true)
      toast.success(`Code "${course.courseCode}" copied!`)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-gc hover:shadow-gc-md cursor-pointer overflow-hidden transition-shadow duration-200 border-0"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Google Classroom-style colorful banner */}
      <div
        className="h-24 relative flex items-end px-4 pb-3"
        style={{ backgroundColor: bannerColor }}
      >
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative z-10">
          <h3 className="text-white font-medium text-base leading-tight line-clamp-2 drop-shadow-sm">
            {course.title}
          </h3>
        </div>

        {/* Submission stats badge (professor) */}
        {role === 'professor' && course.submissionStats && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-25 rounded-full px-2 py-0.5">
            <span className="text-white text-xs font-medium">
              {course.submissionStats.total} submissions
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="px-4 pt-3 pb-4">
        {course.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Enrollment code for professors */}
        {role === 'professor' && course.courseCode && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">Class code:</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gblue-50 dark:bg-gblue-800/30 hover:bg-gblue-100 dark:hover:bg-gblue-700/40 transition-colors"
              title="Click to copy class code"
            >
              <span className="font-mono font-bold text-sm text-gblue-600 dark:text-gblue-400 tracking-widest">
                {course.courseCode}
              </span>
              {copied
                ? <CheckIcon className="w-3.5 h-3.5 text-ggreen-600" />
                : <ClipboardIcon className="w-3.5 h-3.5 text-gblue-400" />
              }
            </button>
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          {role === 'student' && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <DocumentIcon className="w-3.5 h-3.5 text-gblue-500" />
              <span>{course.assignmentIds ? course.assignmentIds.length : 0} assignments</span>
            </div>
          )}

          {role === 'professor' && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <UsersIcon className="w-3.5 h-3.5 text-gblue-500" />
                <span>
                  {course.studentCount !== undefined
                    ? course.studentCount
                    : (course.studentIds ? course.studentIds.length : 0)} students
                </span>
              </div>
              {course.submissionStats && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <ClipboardIcon className="w-3.5 h-3.5 text-ggreen-600" />
                  <span>
                    {course.submissionStats.submitted + course.submissionStats.acknowledged}/{course.submissionStats.total} submitted
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default CourseCard