'use client'

import { motion } from 'framer-motion'
import { colors } from '@/lib/theme/colors'

interface RevenueChartProps {
  data: { day: string; revenue: number }[]
  height?: number
}

export default function RevenueChart({ data, height = 256 }: RevenueChartProps) {
  // Calculate max value for scaling
  const maxRevenue = Math.max(...data.map((d) => d.revenue))
  const chartHeight = height - 60 // Reserve space for labels

  // Calculate bar width and spacing
  const barWidth = 40
  const spacing = 20
  const totalWidth = data.length * (barWidth + spacing)

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex items-end justify-between h-full px-4">
        {data.map((item, index) => {
          const barHeight = (item.revenue / maxRevenue) * chartHeight
          const percentage = ((item.revenue / maxRevenue) * 100).toFixed(0)

          return (
            <div key={item.day} className="flex flex-col items-center flex-1">
              {/* Value Label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                className="mb-2 text-xs font-semibold"
                style={{ color: colors.textPrimary }}
              >
                KSh {(item.revenue / 1000).toFixed(0)}K
              </motion.div>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${barHeight}px` }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: 'easeOut' }}
                className="w-full max-w-[60px] rounded-t-lg relative group cursor-pointer"
                style={{
                  backgroundColor: colors.adminPrimary,
                  minHeight: '4px',
                }}
              >
                {/* Hover Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                  style={{
                    backgroundColor: colors.textPrimary,
                    color: 'white',
                  }}
                >
                  <div className="text-xs font-semibold">KSh {item.revenue.toLocaleString()}</div>
                  <div className="text-xs opacity-80">{percentage}% of max</div>
                </div>

                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 rounded-t-lg opacity-20"
                  style={{
                    background: `linear-gradient(to top, transparent, white)`,
                  }}
                />
              </motion.div>

              {/* Day Label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                className="mt-2 text-xs font-medium"
                style={{ color: colors.textSecondary }}
              >
                {item.day}
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[0, 25, 50, 75, 100].map((percent) => (
          <div
            key={percent}
            className="absolute left-0 right-0 border-t"
            style={{
              top: `${100 - percent}%`,
              borderColor: colors.borderLight,
              opacity: 0.3,
            }}
          />
        ))}
      </div>
    </div>
  )
}

