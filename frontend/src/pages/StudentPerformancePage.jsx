import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'
import Navbar from '../components/Navbar'
import Badge from '../components/Badge'
import { ClipboardIcon, GradeIcon, CheckCircleIcon, ClockIcon, ChevronRightIcon } from '../components/Icons'

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const GRADE_COLOR = (g) => {
  if (g === null || g === undefined) return '#9ca3af'
  if (g >= 80) return '#1E8E3E'
  if (g >= 60) return '#E65100'
  return '#C62828'
}

const STATUS_COLORS = {
  submitted:    '#1A73E8',
  acknowledged: '#1E8E3E',
  pending:      '#9ca3af',
}

// ── stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-lg shadow-gc p-5 flex items-center gap-4"
  >
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: color + '22' }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-medium text-gray-800 dark:text-gray-100">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
)

// ── custom bar label ──────────────────────────────────────────────────────────
const GradeBarLabel = ({ x, y, width, value }) => (
  value != null
    ? <text x={x + width / 2} y={y - 4} fill={GRADE_COLOR(value)} textAnchor="middle" fontSize={11} fontWeight="600">
        {value}
      </text>
    : null
)

// ── custom tooltip ────────────────────────────────────────────────────────────
const GradeTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-gc-md p-3 text-sm max-w-xs">
      <p className="font-medium text-gray-800 dark:text-gray-100 mb-1 truncate">{d.title}</p>
      <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{d.course}</p>
      {d.grade != null
        ? <p style={{ color: GRADE_COLOR(d.grade) }} className="font-semibold">Grade: {d.grade}/100</p>
        : <p className="text-gray-400">Not graded yet</p>}
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────
const StudentPerformancePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance.get('/submissions/my/all')
      .then((res) => {
        setSubmissions(res.data.submissions)
        setStats(res.data.stats)
      })
      .catch(() => toast.error('Failed to load performance data'))
      .finally(() => setLoading(false))
  }, [])

  // ── chart data ──────────────────────────────────────────────────────────────
  const barData = submissions
    .filter((s) => s.assignmentId)
    .slice(0, 12) // last 12 submissions
    .reverse()
    .map((s) => ({
      title: s.assignmentId?.title ?? 'Unknown',
      course: s.assignmentId?.courseId?.title ?? '',
      grade: s.grade ?? null,
      fill: GRADE_COLOR(s.grade),
    }))

  const pieData = stats
    ? [
        { name: 'Submitted',    value: stats.submitted,    color: STATUS_COLORS.submitted },
        { name: 'Acknowledged', value: stats.acknowledged, color: STATUS_COLORS.acknowledged },
        { name: 'Pending',      value: stats.pending,      color: STATUS_COLORS.pending },
      ].filter((d) => d.value > 0)
    : []

  // Letter grade
  const letterGrade = (avg) => {
    if (avg === null || avg === undefined) return null
    if (avg >= 90) return 'A'
    if (avg >= 80) return 'B'
    if (avg >= 70) return 'C'
    if (avg >= 60) return 'D'
    return 'F'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-surface-dark">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <button onClick={() => navigate('/student/dashboard')} className="hover:text-gblue-600 transition-colors">
            Dashboard
          </button>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-800 dark:text-gray-100 font-medium">My Performance</span>
        </div>

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-800 dark:text-gray-100">My Performance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your grades, submissions and progress across all courses
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Submitted"  value={stats?.total}   icon={ClipboardIcon}   color="#1A73E8" />
          <StatCard label="Acknowledged"     value={stats?.acknowledged} icon={CheckCircleIcon} color="#1E8E3E" />
          <StatCard label="Graded"           value={stats?.graded}  icon={GradeIcon}       color="#E65100" />
          <StatCard
            label="Average Grade"
            value={stats?.avgGrade != null ? `${stats.avgGrade}/100` : '—'}
            sub={stats?.avgGrade != null ? `Grade ${letterGrade(stats.avgGrade)}` : 'No grades yet'}
            icon={ClockIcon}
            color={GRADE_COLOR(stats?.avgGrade)}
          />
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-gc">
            <ClipboardIcon className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-1">No submissions yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Submit assignments to see your performance here</p>
          </div>
        ) : (
          <>
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Bar chart — grades */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-gc p-5">
                <h2 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-1">Grades per Assignment</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Last {barData.length} submissions</p>
                {barData.filter(d => d.grade != null).length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-sm text-gray-400">No grades yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="title"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        height={60}
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip content={<GradeTooltip />} />
                      <Bar dataKey="grade" radius={[4, 4, 0, 0]} label={<GradeBarLabel />}>
                        {barData.map((entry, i) => (
                          <Cell key={i} fill={GRADE_COLOR(entry.grade)} fillOpacity={entry.grade != null ? 1 : 0.3} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Pie chart — status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-gc p-5">
                <h2 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-1">Submission Status</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">All assignments</p>
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-sm text-gray-400">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val, name) => [`${val} assignments`, name]} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Submission history table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-gc overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-base font-medium text-gray-800 dark:text-gray-100">Submission History</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">All your submissions sorted by most recent</p>
              </div>

              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {submissions.map((sub) => {
                  const asgn = sub.assignmentId
                  return (
                    <motion.div
                      key={sub._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      {/* Left: course/assignment info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                          {asgn?.title ?? 'Unknown Assignment'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {asgn?.courseId?.title ?? 'Unknown Course'}
                          {sub.submittedAt && <span className="ml-2 text-gray-400">· {fmt(sub.submittedAt)}</span>}
                        </p>
                        {sub.feedback && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic truncate">
                            "{sub.feedback}"
                          </p>
                        )}
                      </div>

                      {/* Grade badge */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {sub.grade != null ? (
                          <div className="text-center">
                            <span
                              className="text-base font-bold"
                              style={{ color: GRADE_COLOR(sub.grade) }}
                            >
                              {sub.grade}/100
                            </span>
                            <p
                              className="text-xs font-semibold"
                              style={{ color: GRADE_COLOR(sub.grade) }}
                            >
                              {letterGrade(sub.grade)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Not graded</span>
                        )}
                        <Badge status={sub.status} />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default StudentPerformancePage