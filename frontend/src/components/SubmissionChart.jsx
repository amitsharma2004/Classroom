import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = {
  pending: '#EAB308',
  submitted: '#3B82F6',
  acknowledged: '#22C55E',
}

const SubmissionChart = ({ stats }) => {
  if (!stats || stats.total === 0) return null

  const data = [
    { name: 'Pending', value: stats.pending, color: COLORS.pending },
    { name: 'Submitted', value: stats.submitted, color: COLORS.submitted },
    { name: 'Acknowledged', value: stats.acknowledged, color: COLORS.acknowledged },
  ].filter((d) => d.value > 0)

  const submittedPct = stats.total > 0
    ? Math.round(((stats.submitted + stats.acknowledged) / stats.total) * 100)
    : 0

  const CustomLabel = ({ cx, cy }) => (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-0.4em" className="text-lg font-bold" style={{ fontSize: '1.1rem', fontWeight: 700, fill: '#1f2937' }}>
        {submittedPct}%
      </tspan>
      <tspan x={cx} dy="1.4em" style={{ fontSize: '0.7rem', fill: '#6b7280' }}>
        Submitted
      </tspan>
    </text>
  )

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={<CustomLabel />}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} students`, name]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SubmissionChart