import React from 'react'
import { motion } from 'framer-motion'
import { HourglassIcon, UploadIcon, CheckCircleIcon } from './Icons'

const Badge = ({ status }) => {
  const configs = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      Icon: HourglassIcon,
    },
    submitted: {
      label: 'Submitted',
      className: 'bg-blue-100 text-blue-800 border border-blue-200',
      Icon: UploadIcon,
    },
    acknowledged: {
      label: 'Acknowledged',
      className: 'bg-green-100 text-green-800 border border-green-200',
      Icon: CheckCircleIcon,
    },
  }

  const config = configs[status] || configs.pending
  const { Icon } = config

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </motion.span>
  )
}

export default Badge