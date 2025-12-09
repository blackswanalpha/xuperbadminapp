import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { colors } from '@/lib/theme/colors'
import { designTokens } from '@/lib/theme/design-tokens'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  color?: string
  onClick?: () => void
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = colors.adminPrimary,
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      onClick={onClick}
      className={`bg-white rounded-lg p-6 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        boxShadow: designTokens.shadows.md,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            {title}
          </p>
          <h3 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {value}
          </h3>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className="text-sm font-medium"
                style={{
                  color: trend.isPositive ? colors.adminSuccess : colors.adminError,
                }}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-sm" style={{ color: colors.textTertiary }}>
                vs last month
              </span>
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${color}15`,
          }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </motion.div>
  )
}

