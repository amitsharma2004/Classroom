import React from 'react'
import { motion } from 'framer-motion'

const ProgressBar = ({ value = 0, label }) => {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600 font-medium">{label}</span>
          <span className="text-xs font-semibold text-indigo-700">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
        />
      </div>
    </div>
  )
}

export default ProgressBar