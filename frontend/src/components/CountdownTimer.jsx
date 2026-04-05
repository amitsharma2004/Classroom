import { useState, useEffect } from 'react'

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    const compute = () => {
      const now = Date.now()
      const end = new Date(deadline).getTime()
      return end - now
    }

    setTimeLeft(compute())

    const interval = setInterval(() => {
      setTimeLeft(compute())
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  if (timeLeft === null) return null

  if (timeLeft <= 0) {
    return <span className="text-red-700 font-bold">Past Due</span>
  }

  const totalSeconds = Math.floor(timeLeft / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  parts.push(`${hours}h`)
  parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)

  const label = parts.join(' ')

  const msInHour = 3600 * 1000
  const msIn24h = 24 * msInHour

  let className = ''
  if (timeLeft > msIn24h) {
    className = 'text-gray-500'
  } else if (timeLeft > msInHour) {
    className = 'text-yellow-600 font-semibold'
  } else {
    className = 'text-red-600 font-bold animate-pulse'
  }

  return <span className={className}>{label}</span>
}

export default CountdownTimer