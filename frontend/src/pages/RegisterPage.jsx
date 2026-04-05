import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { GraduationCapIcon, EyeIcon, EyeOffIcon, StudentIcon, ProfessorIcon } from '../components/Icons'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const user = await register(formData.name.trim(), formData.email.trim(), formData.password, formData.role)
      toast.success(`Account created! Welcome, ${user.name}!`)
      navigate(user.role === 'professor' ? '/professor/dashboard' : '/student/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-surface-dark">
      {/* Google Classroom-style top bar */}
      <div className="bg-white dark:bg-gray-900 shadow-gc px-6 py-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded flex items-center justify-center bg-gblue-600">
          <GraduationCapIcon className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
          Joi<span className="text-gblue-600">neazy</span>
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-gc-md overflow-hidden">
            {/* Blue header strip */}
            <div className="bg-gblue-600 px-8 py-5 text-center">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center mx-auto mb-2">
                <GraduationCapIcon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-medium text-white">Create account</h1>
              <p className="text-gblue-100 text-sm mt-0.5">Join Joineazy today</p>
            </div>

            <div className="px-8 py-6">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name" name="name" type="text" required
                    value={formData.name} onChange={handleChange}
                    placeholder="John Doe"
                    className="input-field"
                    autoComplete="name"
                    autoFocus
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email" name="email" type="email" required
                    value={formData.email} onChange={handleChange}
                    placeholder="you@example.com"
                    className="input-field"
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password" name="password"
                      type={showPassword ? 'text' : 'password'}
                      required minLength={6}
                      value={formData.password} onChange={handleChange}
                      placeholder="At least 6 characters"
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword" name="confirmPassword" type="password" required
                    value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Repeat your password"
                    className="input-field"
                  />
                </div>

                {/* Role selection — Google Classroom style chips */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    I am a...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'student',   label: 'Student',   Icon: StudentIcon,   activeColor: '#1E8E3E' },
                      { value: 'professor', label: 'Professor', Icon: ProfessorIcon, activeColor: '#1A73E8' },
                    ].map(({ value, label, Icon, activeColor }) => {
                      const isActive = formData.role === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: value })}
                          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded border-2 text-sm font-medium transition-all duration-150"
                          style={isActive ? {
                            borderColor: activeColor,
                            backgroundColor: activeColor + '12',
                            color: activeColor,
                          } : {
                            borderColor: '#e5e7eb',
                            backgroundColor: 'transparent',
                            color: '#6b7280',
                          }}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : 'Create account'}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Already have an account? </span>
                <Link to="/login" className="text-sm text-gblue-600 dark:text-gblue-400 font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage