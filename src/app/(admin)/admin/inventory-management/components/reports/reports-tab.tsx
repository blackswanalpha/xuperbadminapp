'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ReportsDashboard from './reports-dashboard'
import ReportGeneratorModal from './report-generator-modal'

export default function ReportsTab() {
  const [generatingReport, setGeneratingReport] = useState<{
    type: string
    dateRange: { start_date: string; end_date: string }
  } | null>(null)

  const handleGenerateReport = (reportType: string, dateRange: { start_date: string; end_date: string }) => {
    setGeneratingReport({
      type: reportType,
      dateRange
    })
  }

  const handleCloseReportGenerator = () => {
    setGeneratingReport(null)
  }

  return (
    <div className="space-y-6">
      <ReportsDashboard onGenerateReport={handleGenerateReport} />

      <AnimatePresence>
        {generatingReport && (
          <ReportGeneratorModal
            reportType={generatingReport.type}
            initialDateRange={generatingReport.dateRange}
            onClose={handleCloseReportGenerator}
          />
        )}
      </AnimatePresence>
    </div>
  )
}