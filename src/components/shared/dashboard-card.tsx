import { ReactNode } from 'react'
import { colors } from '@/lib/theme/colors'
import { designTokens } from '@/lib/theme/design-tokens'

interface DashboardCardProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export default function DashboardCard({
  title,
  subtitle,
  action,
  footer,
  children,
  className = '',
}: DashboardCardProps) {
  return (
    <div
      className={`bg-white rounded-lg overflow-hidden ${className}`}
      style={{
        boxShadow: designTokens.shadows.md,
      }}
    >
      {/* Header */}
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && (
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.textPrimary }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100">{footer}</div>
      )}
    </div>
  )
}

