import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { GraduationCapIcon, LogoutIcon, MenuIcon, CloseIcon, SunIcon, MoonIcon, ClipboardIcon } from './Icons'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Google-style avatar color based on role
  const avatarBg = user?.role === 'professor' ? '#1A73E8' : '#1E8E3E'

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-gc sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — Google Classroom style */}
          <button
            onClick={() => navigate(user?.role === 'professor' ? '/professor/dashboard' : '/student/dashboard')}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded flex items-center justify-center bg-gblue-600">
              <GraduationCapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-medium text-gray-700 dark:text-gray-200 tracking-tight">
              Joi<span className="text-gblue-600">neazy</span>
            </span>
          </button>

          {/* Performance link — students only */}
          {user?.role === 'student' && (
            <button
              onClick={() => navigate('/student/performance')}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gblue-600 dark:hover:text-gblue-400 px-3 py-1.5 rounded hover:bg-gblue-50 dark:hover:bg-gblue-900/20 transition-colors font-medium"
            >
              <ClipboardIcon className="w-4 h-4" />
              My Performance
            </button>
          )}

          {/* Desktop controls */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {user && (
              <div className="flex items-center gap-2 ml-1">
                {/* Role chip */}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.role === 'professor'
                    ? 'bg-gblue-50 text-gblue-700 border border-gblue-200'
                    : 'bg-ggreen-50 text-ggreen-700 border border-ggreen-100'
                }`}>
                  {user.role === 'professor' ? 'Professor' : 'Student'}
                </span>

                {/* Google-style avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm cursor-pointer select-none flex-shrink-0"
                  style={{ backgroundColor: avatarBg }}
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                  {user.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gred-500 transition-colors px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogoutIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Sign out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile right side */}
          <div className="sm:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            {user && (
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen
                  ? <CloseIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  : <MenuIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && user && (
          <div className="sm:hidden pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0"
                style={{ backgroundColor: avatarBg }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
            {user?.role === 'student' && (
              <button
                onClick={() => { navigate('/student/performance'); setMenuOpen(false) }}
                className="w-full text-left text-sm text-gblue-600 dark:text-gblue-400 hover:bg-gblue-50 dark:hover:bg-gblue-900/20 px-3 py-2 rounded transition-colors flex items-center gap-2 mb-1"
              >
                <ClipboardIcon className="w-4 h-4" />
                My Performance
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded transition-colors flex items-center gap-2"
            >
              <LogoutIcon className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar