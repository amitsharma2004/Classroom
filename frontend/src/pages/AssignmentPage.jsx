import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'
import Navbar from '../components/Navbar'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import CountdownTimer from '../components/CountdownTimer'
import {
  UserIcon, UsersIcon, ClockIcon, CheckIcon, CheckCircleIcon,
  EditIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon,
  PlusIcon, ClipboardIcon, DocumentIcon, SearchIcon, GradeIcon,
} from '../components/Icons'

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const isPastDue = (deadline) => new Date(deadline) < new Date()

// ========================
// MODAL COMPONENTS
// ========================

const SubmitModal = ({ assignment, onClose, onSubmit }) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Submission content cannot be empty')
      return
    }
    setLoading(true)
    try {
      await onSubmit(assignment._id, content.trim())
      onClose()
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
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Submit Assignment</h3>
        <p className="text-sm text-gray-500 mb-4">{assignment.title}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submission Content / Link *
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your submission link (GitHub, Google Drive, etc.) or write your answer here..."
              rows={5}
              className="input-field resize-none"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Submit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const CreateGroupModal = ({ assignment, onClose, onCreate }) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Group name is required')
      return
    }
    setLoading(true)
    try {
      const res = await axiosInstance.post('/groups', { assignmentId: assignment._id, name: name.trim() })
      toast.success('Group created!')
      onCreate(res.data.group)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group')
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
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Create Group</h3>
        <p className="text-sm text-gray-500 mb-4">Create a group for "{assignment.title}"</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Team Alpha"
              className="input-field"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Create Group
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const JoinGroupModal = ({ assignment, onClose, onJoin }) => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(null)

  useEffect(() => {
    axiosInstance.get(`/groups/assignment/${assignment._id}`)
      .then((res) => setGroups(res.data.groups))
      .catch(() => toast.error('Failed to load groups'))
      .finally(() => setLoading(false))
  }, [assignment._id])

  const handleJoin = async (groupId) => {
    setJoining(groupId)
    try {
      await axiosInstance.post(`/groups/${groupId}/join`)
      toast.success('Joined group!')
      onJoin()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join group')
    } finally {
      setJoining(null)
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
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Join a Group</h3>
        <p className="text-sm text-gray-500 mb-4">Available groups for "{assignment.title}"</p>
        {loading ? (
          <div className="text-center py-6">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : groups.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No groups available yet. Create one instead!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {groups.map((g) => (
              <div key={g._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm text-gray-900">{g.name}</p>
                  <p className="text-xs text-gray-500">{g.memberIds.length} members · Leader: {g.leaderId.name}</p>
                </div>
                <button
                  onClick={() => handleJoin(g._id)}
                  disabled={joining === g._id}
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  {joining === g._id ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : null}
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} className="w-full btn-secondary py-2.5">Close</button>
      </motion.div>
    </div>
  )
}

const CreateAssignmentModal = ({ courseId, onClose, onCreate }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    submissionType: 'individual',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.deadline) {
      toast.error('All fields are required')
      return
    }
    setLoading(true)
    try {
      const res = await axiosInstance.post('/assignments', { ...form, courseId })
      toast.success('Assignment created!')
      onCreate(res.data.assignment)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment')
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
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Assignment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the assignment..." rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
            <input type="datetime-local" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Submission Type</label>
            <div className="flex gap-3">
              {['individual', 'group'].map((t) => (
                <button key={t} type="button" onClick={() => setForm({ ...form, submissionType: t })}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${form.submissionType === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>
                  <span className="flex items-center justify-center gap-1.5">
                    {t === 'individual' ? <UserIcon className="w-4 h-4" /> : <UsersIcon className="w-4 h-4" />}
                    {t === 'individual' ? 'Individual' : 'Group'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const EditAssignmentModal = ({ assignment, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    title: assignment.title,
    description: assignment.description,
    deadline: assignment.deadline ? assignment.deadline.slice(0, 16) : '',
    submissionType: assignment.submissionType,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axiosInstance.put(`/assignments/${assignment._id}`, form)
      toast.success('Assignment updated!')
      onUpdate(res.data.assignment)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update assignment')
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
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Assignment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
            <input type="datetime-local" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Update
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ========================
// STUDENT ASSIGNMENT CARD
// ========================
const StudentAssignmentCard = ({ assignment, user, onRefresh }) => {
  const [submission, setSubmission] = useState(null)
  const [group, setGroup] = useState(null)
  const [groups, setGroups] = useState([])
  const [loadingSub, setLoadingSub] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showJoinGroup, setShowJoinGroup] = useState(false)
  const [acknowledging, setAcknowledging] = useState(false)

  const fetchSubmission = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/submissions/my/${assignment._id}`)
      setSubmission(res.data.submission)
    } catch {
      // no submission yet
    } finally {
      setLoadingSub(false)
    }
  }, [assignment._id])

  const fetchGroups = useCallback(async () => {
    if (assignment.submissionType !== 'group') return
    try {
      const res = await axiosInstance.get(`/groups/assignment/${assignment._id}`)
      setGroups(res.data.groups)
      // Find user's group
      const myGroup = res.data.groups.find((g) =>
        g.memberIds.some((m) => m._id === user._id || m === user._id)
      )
      setGroup(myGroup || null)
    } catch {
      // ignore
    }
  }, [assignment._id, assignment.submissionType, user._id])

  useEffect(() => {
    fetchSubmission()
    fetchGroups()
  }, [fetchSubmission, fetchGroups])

  const handleSubmit = async (assignmentId, content) => {
    try {
      const payload = { assignmentId, content }
      if (group) payload.groupId = group._id
      await axiosInstance.post('/submissions', payload)
      toast.success('Assignment submitted!')
      fetchSubmission()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
      throw err
    }
  }

  const handleAcknowledge = async () => {
    if (!submission) return
    setAcknowledging(true)
    try {
      if (submission.groupId && group && group.leaderId._id === user._id) {
        await axiosInstance.patch('/submissions/group-acknowledge', {
          groupId: submission.groupId,
          assignmentId: assignment._id,
        })
        toast.success('Group submissions acknowledged!')
      } else if (!submission.groupId) {
        await axiosInstance.patch(`/submissions/${submission._id}/acknowledge`)
        toast.success('Submission acknowledged!')
      }
      fetchSubmission()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge')
    } finally {
      setAcknowledging(false)
    }
  }

  const pastDue = isPastDue(assignment.deadline)
  const isGroupLeader = group && (group.leaderId._id === user._id || group.leaderId === user._id)

  // Calculate group submission progress
  const totalGroupMembers = group ? group.memberIds.length : 0

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{assignment.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${assignment.submissionType === 'group' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                <span className="flex items-center gap-1">
                  {assignment.submissionType === 'group'
                    ? <UsersIcon className="w-3.5 h-3.5" />
                    : <UserIcon className="w-3.5 h-3.5" />}
                  {assignment.submissionType === 'group' ? 'Group' : 'Individual'}
                </span>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{assignment.description}</p>
          </div>
          {!loadingSub && submission && <Badge status={submission.status} />}
        </div>

        {/* Deadline + Countdown */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className={`flex items-center gap-1.5 text-xs ${pastDue ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
            <ClockIcon className="w-3.5 h-3.5" />
            <span className="font-medium">{pastDue ? 'Past due: ' : 'Due: '}{formatDate(assignment.deadline)}</span>
          </div>
          {!pastDue && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-400 dark:text-gray-500">Remaining:</span>
              <CountdownTimer deadline={assignment.deadline} />
            </div>
          )}
        </div>

        {/* Group section */}
        {assignment.submissionType === 'group' && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            {group ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-purple-700">Your Group: {group.name}</span>
                  {isGroupLeader && <span className="text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">Leader</span>}
                </div>
                <p className="text-xs text-purple-600">{group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-purple-700 font-medium mb-2">You haven't joined a group yet</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowCreateGroup(true)} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors">
                    Create Group
                  </button>
                  <button onClick={() => setShowJoinGroup(true)} className="text-xs bg-white text-purple-600 border border-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                    Join Group
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {loadingSub ? (
            <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
          ) : !submission ? (
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={pastDue}
              className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50"
            >
              {pastDue ? 'Past Due' : 'Submit Assignment'}
            </button>
          ) : (
            <>
              <div className="text-xs text-gray-500">
                Submitted: {formatDate(submission.submittedAt)}
              </div>
              {submission.status !== 'acknowledged' && (
                (() => {
                  // Show acknowledge button: individual always, group only for leader
                  const showAck = !submission.groupId || isGroupLeader
                  return showAck ? (
                    <button
                      onClick={handleAcknowledge}
                      disabled={acknowledging}
                      className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {acknowledging ? (
                        <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckIcon className="w-3.5 h-3.5" />
                      )}
                      {submission.groupId ? 'Acknowledge Group' : 'Acknowledge'}
                    </button>
                  ) : null
                })()
              )}
              {submission.status === 'acknowledged' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 text-green-700 text-sm font-medium"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Acknowledged
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showSubmitModal && (
          <SubmitModal assignment={assignment} onClose={() => setShowSubmitModal(false)} onSubmit={handleSubmit} />
        )}
        {showCreateGroup && (
          <CreateGroupModal assignment={assignment} onClose={() => setShowCreateGroup(false)} onCreate={(g) => { setGroup(g); fetchGroups() }} />
        )}
        {showJoinGroup && (
          <JoinGroupModal assignment={assignment} onClose={() => setShowJoinGroup(false)} onJoin={() => { fetchGroups(); fetchSubmission() }} />
        )}
      </AnimatePresence>
    </>
  )
}

// ========================
// PROFESSOR ASSIGNMENT CARD
// ========================
const ProfessorAssignmentCard = ({ assignment, courseStudentCount, onDelete, onUpdate }) => {
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  // Grading state: { [submissionId]: { open, grade, feedback, saving } }
  const [grading, setGrading] = useState({})

  const fetchSubmissions = useCallback(async (f = filter) => {
    setLoading(true)
    try {
      const params = f !== 'all' ? `?status=${f}` : ''
      const res = await axiosInstance.get(`/assignments/${assignment._id}/submissions${params}`)
      setSubmissions(res.data.submissions)
      setStats(res.data.stats)
    } catch {
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }, [assignment._id, filter])

  useEffect(() => {
    if (expanded) fetchSubmissions()
  }, [expanded])

  const handleFilterChange = (f) => {
    setFilter(f)
    const params = f !== 'all' ? `?status=${f}` : ''
    setLoading(true)
    axiosInstance.get(`/assignments/${assignment._id}/submissions${params}`)
      .then((res) => { setSubmissions(res.data.submissions); setStats(res.data.stats) })
      .catch(() => toast.error('Failed to filter'))
      .finally(() => setLoading(false))
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this assignment? This cannot be undone.')) return
    setDeleting(true)
    try {
      await axiosInstance.delete(`/assignments/${assignment._id}`)
      toast.success('Assignment deleted')
      onDelete(assignment._id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const pastDue = isPastDue(assignment.deadline)
  const submissionRate = stats && courseStudentCount > 0
    ? Math.round(((stats.submitted + stats.acknowledged) / courseStudentCount) * 100)
    : 0

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{assignment.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${assignment.submissionType === 'group' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                  <span className="flex items-center gap-1">
                  {assignment.submissionType === 'group'
                    ? <UsersIcon className="w-3.5 h-3.5" />
                    : <UserIcon className="w-3.5 h-3.5" />}
                  {assignment.submissionType === 'group' ? 'Group' : 'Individual'}
                </span>
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{assignment.description}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setShowEdit(true)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors" title="Edit">
                <EditIcon className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} disabled={deleting} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                {deleting
                  ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  : <TrashIcon className="w-4 h-4" />
                }
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <div className={`text-xs flex items-center gap-1.5 ${pastDue ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
              <ClockIcon className="w-3.5 h-3.5" />
              <span className="font-medium">{pastDue ? 'Past due: ' : 'Due: '}{formatDate(assignment.deadline)}</span>
            </div>
            {!pastDue && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-400 dark:text-gray-500">Remaining:</span>
                <CountdownTimer deadline={assignment.deadline} />
              </div>
            )}
          </div>

          {stats && (
            <div className="mb-4">
              <ProgressBar value={submissionRate} label={`Submission Rate (${stats.submitted + stats.acknowledged}/${courseStudentCount || stats.total})`} />
            </div>
          )}

          <button
            onClick={() => { setExpanded(!expanded); if (!expanded) fetchSubmissions() }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1.5 transition-colors"
          >
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Hide' : 'View'} Submissions
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <div className="p-6 pt-4">
                {/* Filter buttons */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['all', 'submitted', 'acknowledged', 'pending'].map((f) => (
                    <button
                      key={f}
                      onClick={() => handleFilterChange(f)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                      {stats && f === 'all' && ` (${stats.total})`}
                      {stats && f === 'submitted' && ` (${stats.submitted})`}
                      {stats && f === 'acknowledged' && ` (${stats.acknowledged})`}
                      {stats && f === 'pending' && ` (${stats.pending})`}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
                  </div>
                ) : submissions.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">No submissions found</p>
                ) : (
                  <div className="space-y-2">
                    {submissions.map((sub) => {
                      const g = grading[sub._id] || {}
                      const isOpen = g.open || false
                      return (
                        <div key={sub._id} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 overflow-hidden">
                          {/* Submission row */}
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex-shrink-0">
                                {sub.studentId.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{sub.studentId.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sub.content}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                              {sub.grade != null && (
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                                  {sub.grade}/100
                                </span>
                              )}
                              <Badge status={sub.status} />
                              <button
                                onClick={() => setGrading((prev) => ({
                                  ...prev,
                                  [sub._id]: {
                                    open: !isOpen,
                                    grade: sub.grade ?? '',
                                    feedback: sub.feedback || '',
                                    saving: false,
                                  },
                                }))}
                                className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 transition-colors"
                                title="Grade submission"
                              >
                                <GradeIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {/* Grading panel */}
                          {isOpen && (
                            <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-600 pt-3 bg-white dark:bg-gray-800">
                              <div className="flex gap-3 items-end flex-wrap">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Grade (0–100)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={g.grade}
                                    onChange={(e) => setGrading((prev) => ({ ...prev, [sub._id]: { ...prev[sub._id], grade: e.target.value } }))}
                                    className="w-24 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. 85"
                                  />
                                </div>
                                <div className="flex-1 min-w-40">
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Feedback (optional)</label>
                                  <input
                                    type="text"
                                    value={g.feedback}
                                    onChange={(e) => setGrading((prev) => ({ ...prev, [sub._id]: { ...prev[sub._id], feedback: e.target.value } }))}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Great work! ..."
                                  />
                                </div>
                                <button
                                  disabled={g.saving}
                                  onClick={async () => {
                                    const gradeVal = Number(g.grade)
                                    if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > 100) {
                                      toast.error('Grade must be 0–100')
                                      return
                                    }
                                    setGrading((prev) => ({ ...prev, [sub._id]: { ...prev[sub._id], saving: true } }))
                                    try {
                                      await axiosInstance.patch(`/submissions/${sub._id}/grade`, { grade: gradeVal, feedback: g.feedback })
                                      toast.success(`Graded ${sub.studentId.name}: ${gradeVal}/100`)
                                      sub.grade = gradeVal
                                      sub.feedback = g.feedback
                                      setGrading((prev) => ({ ...prev, [sub._id]: { open: false, grade: gradeVal, feedback: g.feedback, saving: false } }))
                                    } catch (err) {
                                      toast.error(err.response?.data?.message || 'Failed to save grade')
                                      setGrading((prev) => ({ ...prev, [sub._id]: { ...prev[sub._id], saving: false } }))
                                    }
                                  }}
                                  className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                                >
                                  {g.saving
                                    ? <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                                    : <CheckIcon className="w-3.5 h-3.5" />
                                  }
                                  Save
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showEdit && (
          <EditAssignmentModal
            assignment={assignment}
            onClose={() => setShowEdit(false)}
            onUpdate={(updated) => { onUpdate(updated); setShowEdit(false) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ========================
// MAIN PAGE
// ========================
const AssignmentPage = () => {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isStudent = user?.role === 'student'
  const isProfessor = user?.role === 'professor'

  const [assignments, setAssignments] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'individual' | 'group'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignRes, courseRes] = await Promise.all([
          axiosInstance.get(`/assignments/course/${courseId}`),
          axiosInstance.get(`/courses/${courseId}`),
        ])
        setAssignments(assignRes.data.assignments)
        setCourse(courseRes.data.course)
      } catch (err) {
        toast.error('Failed to load assignments')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [courseId])

  const handleAssignmentCreated = (newAssignment) => {
    setAssignments((prev) => [newAssignment, ...prev])
  }

  const handleAssignmentDeleted = (deletedId) => {
    setAssignments((prev) => prev.filter((a) => a._id !== deletedId))
  }

  const handleAssignmentUpdated = (updated) => {
    setAssignments((prev) => prev.map((a) => (a._id === updated._id ? updated : a)))
  }

  const courseStudentCount = course?.studentIds?.length || 0

  // Filtered assignments based on search + type filter
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || a.submissionType === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <button
            onClick={() => navigate(isStudent ? '/student/dashboard' : '/professor/dashboard')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Dashboard
          </button>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 dark:text-gray-100 font-medium truncate">
            {course ? course.title : 'Loading...'}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{course?.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
                  {isProfessor && ` · ${courseStudentCount} student${courseStudentCount !== 1 ? 's' : ''}`}
                </p>
              </>
            )}
          </div>
          {isProfessor && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 self-start sm:self-auto"
            >
              <PlusIcon className="w-4 h-4" />
              Create Assignment
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        {!loading && assignments.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assignments..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'individual', 'group'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    filterType === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'individual' ? 'Individual' : 'Group'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assignments list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-1" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="flex justify-center mb-4">
              <ClipboardIcon className="w-16 h-16 text-indigo-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No assignments yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {isProfessor ? 'Create your first assignment for this course' : 'No assignments have been posted yet'}
            </p>
            {isProfessor && (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-4">
                Create Assignment
              </button>
            )}
          </motion.div>
        ) : filteredAssignments.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="flex justify-center mb-4">
              <SearchIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Try a different search term or filter</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) =>
              isStudent ? (
                <StudentAssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  user={user}
                  onRefresh={() => {}}
                />
              ) : (
                <ProfessorAssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  courseStudentCount={courseStudentCount}
                  onDelete={handleAssignmentDeleted}
                  onUpdate={handleAssignmentUpdated}
                />
              )
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showCreateModal && (
          <CreateAssignmentModal
            courseId={courseId}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleAssignmentCreated}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AssignmentPage