import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { GraduationCapIcon, EyeIcon, EyeOffIcon } from '../components/Icons'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const user = await login(email.trim(), password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'professor' ? '/professor/dashboard' : '/student/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
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

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-gc-md overflow-hidden">
            {/* Blue header strip */}
            <div className="bg-gblue-600 px-8 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center mx-auto mb-3">
                <GraduationCapIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-medium text-white">Sign in</h1>
              <p className="text-gblue-100 text-sm mt-1">to continue to Joineazy</p>
            </div>

            <div className="px-8 py-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="input-field pr-10"
                      autoComplete="current-password"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : 'Sign in'}
                </button>
              </form>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link to="/register" className="text-sm text-gblue-600 dark:text-gblue-400 hover:underline font-medium">
                  Create account
                </Link>
              </div>

              {/* Demo credentials */}
              <div className="mt-4 p-3 bg-gblue-50 dark:bg-gblue-900/20 rounded border border-gblue-100 dark:border-gblue-800">
                <p className="text-xs font-medium text-gblue-700 dark:text-gblue-300 mb-1">Demo credentials</p>
                <p className="text-xs text-gblue-600 dark:text-gblue-400">professor@demo.com / demo1234</p>
                <p className="text-xs text-gblue-600 dark:text-gblue-400">student@demo.com / demo1234</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage