'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  fetchVehicle, fetchVehicleFinancialSummary, Vehicle,
  fetchVehicleContracts, fetchVehicleDamageReports, fetchVehicleMaintenance,
  fetchVehicleExpenses, fetchVehiclePayments, fetchVehicleIncomeTotals, fetchVehicleExpenseTotals,
  Contract, DamageReport, MaintenanceRecord, VehicleExpenseItem, Payment, VehicleIncomeData, VehicleExpenseData
} from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Car, Calendar, DollarSign, FileText, Clock,
  Settings, Users, Edit, Download, AlertTriangle, CheckCircle,
  Wrench, CreditCard, Receipt, AlertCircle, TrendingUp, Percent
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import RevenueExpenseChart from '@/components/shared/revenue-expense-chart'
import AdvancedFinancialAnalytics from '@/components/shared/advanced-financial-analytics'
import { colors } from '@/lib/theme/colors'

type TabType = 'contracts' | 'return-dates' | 'damage-report' | 'maintenance' | 'income' | 'expenses'

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'contracts', label: 'Contracts', icon: <FileText size={18} /> },
  { id: 'return-dates', label: 'Return Dates', icon: <Calendar size={18} /> },
  { id: 'damage-report', label: 'Damage Report', icon: <AlertCircle size={18} /> },
  { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={18} /> },
  { id: 'income', label: 'Income', icon: <TrendingUp size={18} /> },
  { id: 'expenses', label: 'Expenses', icon: <Receipt size={18} /> },
]

export default function VehicleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = parseInt(params.id as string)

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [financialData, setFinancialData] = useState<any>(null)
  const [incomeData, setIncomeData] = useState<VehicleIncomeData | null>(null)
  const [expenseData, setExpenseData] = useState<VehicleExpenseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('contracts')

  // Tab data states
  const [contracts, setContracts] = useState<Contract[]>([])
  const [damageReports, setDamageReports] = useState<DamageReport[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [expenses, setExpenses] = useState<VehicleExpenseItem[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [tabLoading, setTabLoading] = useState(false)

  useEffect(() => {
    const loadVehicleData = async () => {
      try {
        const [vehicleData, financial, income, expense] = await Promise.all([
          fetchVehicle(vehicleId),
          fetchVehicleFinancialSummary(vehicleId).catch(() => null),
          fetchVehicleIncomeTotals(vehicleId).catch(() => null),
          fetchVehicleExpenseTotals(vehicleId).catch(() => null)
        ])

        setVehicle(vehicleData)
        setFinancialData(financial)
        setIncomeData(income)
        setExpenseData(expense)
      } catch (error) {
        console.error('Error fetching vehicle data:', error)
        setError('Failed to load vehicle data')
      } finally {
        setLoading(false)
      }
    }

    loadVehicleData()
  }, [vehicleId])

  // Load tab data when tab changes
  useEffect(() => {
    const loadTabData = async () => {
      setTabLoading(true)
      try {
        switch (activeTab) {
          case 'contracts':
          case 'return-dates':
            if (contracts.length === 0) {
              const contractsData = await fetchVehicleContracts(vehicleId)
              setContracts(contractsData)
            }
            break
          case 'damage-report':
            if (damageReports.length === 0) {
              const damageData = await fetchVehicleDamageReports(vehicleId)
              setDamageReports(damageData)
            }
            break
          case 'maintenance':
            if (maintenanceRecords.length === 0) {
              const maintenanceData = await fetchVehicleMaintenance(vehicleId)
              setMaintenanceRecords(maintenanceData)
            }
            break
          case 'income':
            if (payments.length === 0) {
              const paymentsData = await fetchVehiclePayments(vehicleId)
              setPayments(paymentsData)
            }
            if (contracts.length === 0) {
              const contractsData = await fetchVehicleContracts(vehicleId)
              setContracts(contractsData)
            }
            break
          case 'expenses':
            if (expenses.length === 0) {
              const expensesData = await fetchVehicleExpenses(vehicleId)
              setExpenses(expensesData)
            }
            break
        }
      } catch (error) {
        console.error('Error loading tab data:', error)
      } finally {
        setTabLoading(false)
      }
    }

    if (vehicle) {
      loadTabData()
    }
  }, [activeTab, vehicle, vehicleId])

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p style={{ color: colors.textSecondary }}>Loading vehicle details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <AlertTriangle size={48} style={{ color: colors.adminError }} className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
              Vehicle Not Found
            </h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              {error || 'The requested vehicle could not be found.'}
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.adminPrimary }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    const s = (status || '').toUpperCase()
    switch (s) {
      case 'AVAILABLE':
        return <CheckCircle size={20} style={{ color: colors.adminSuccess }} />
      case 'HIRED':
        return <Car size={20} style={{ color: colors.adminPrimary }} />
      case 'IN_GARAGE':
        return <Wrench size={20} style={{ color: colors.adminWarning }} />
      default:
        return <AlertTriangle size={20} style={{ color: colors.adminError }} />
    }
  }

  const getStatusColor = (status: string) => {
    const s = (status || '').toUpperCase()
    switch (s) {
      case 'AVAILABLE':
        return colors.adminSuccess
      case 'HIRED':
        return colors.adminPrimary
      case 'IN_GARAGE':
        return colors.adminWarning
      default:
        return colors.adminError
    }
  }

  // Calculate income stats - use real data if available, fallback to calculated
  const totalDeposits = incomeData ? incomeData.total_deposits : contracts.reduce((sum, c) => sum + Number(c.security_deposit || 0), 0)
  const totalPayments = incomeData ? incomeData.total_payments : payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + Number(p.amount), 0)
  const totalIncome = incomeData ? incomeData.total_income : totalDeposits + totalPayments
  const totalContractValue = contracts.reduce((sum, c) => sum + Number(c.total_contract_value || 0), 0)
  const collectionRate = totalContractValue > 0 ? ((totalPayments + totalDeposits) / totalContractValue) * 100 : 0

  const renderTabContent = () => {
    if (tabLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    switch (activeTab) {
      case 'contracts':
        return (
          <div className="space-y-4">
            {contracts.length === 0 ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No contracts found for this vehicle</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Contract #</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Client</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Period</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Value</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="border-b hover:bg-gray-50" style={{ borderColor: colors.borderLight }}>
                        <td className="py-3 px-4 font-medium" style={{ color: colors.adminPrimary }}>{contract.contract_number}</td>
                        <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                          {contract.client_name || contract.client?.email}
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                          KSh {Number(contract.total_contract_value).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: contract.status === 'ACTIVE' ? `${colors.adminSuccess}20` :
                                contract.status === 'COMPLETED' ? `${colors.adminPrimary}20` :
                                  contract.status === 'PENDING' ? `${colors.adminWarning}20` : `${colors.adminError}20`,
                              color: contract.status === 'ACTIVE' ? colors.adminSuccess :
                                contract.status === 'COMPLETED' ? colors.adminPrimary :
                                  contract.status === 'PENDING' ? colors.adminWarning : colors.adminError
                            }}
                          >
                            {contract.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )

      case 'return-dates':
        const activeContracts = contracts.filter(c => c.status === 'ACTIVE' || c.status === 'PENDING')
        return (
          <div className="space-y-4">
            {activeContracts.length === 0 ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No upcoming return dates</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeContracts.map((contract) => {
                  const endDate = new Date(contract.end_date)
                  const daysUntilReturn = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  const isOverdue = daysUntilReturn < 0
                  const isUrgent = daysUntilReturn >= 0 && daysUntilReturn <= 3

                  return (
                    <div
                      key={contract.id}
                      className="p-4 rounded-lg border flex items-center justify-between"
                      style={{
                        borderColor: isOverdue ? colors.adminError : isUrgent ? colors.adminWarning : colors.borderLight,
                        backgroundColor: isOverdue ? `${colors.adminError}05` : isUrgent ? `${colors.adminWarning}05` : 'transparent'
                      }}
                    >
                      <div>
                        <div className="font-medium" style={{ color: colors.textPrimary }}>
                          {contract.contract_number}
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          Driver: {contract.driver_name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium" style={{ color: isOverdue ? colors.adminError : isUrgent ? colors.adminWarning : colors.textPrimary }}>
                          {endDate.toLocaleDateString()}
                        </div>
                        <div className="text-sm" style={{ color: isOverdue ? colors.adminError : colors.textSecondary }}>
                          {isOverdue ? `${Math.abs(daysUntilReturn)} days overdue` : `${daysUntilReturn} days remaining`}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )

      case 'damage-report':
        return (
          <div className="space-y-4">
            {damageReports.length === 0 ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No damage reports found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {damageReports.map((report) => (
                  <div key={report.id} className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: report.status === 'REPAIRED' ? `${colors.adminSuccess}20` :
                            report.status === 'UNDER_REPAIR' ? `${colors.adminWarning}20` : `${colors.adminError}20`,
                          color: report.status === 'REPAIRED' ? colors.adminSuccess :
                            report.status === 'UNDER_REPAIR' ? colors.adminWarning : colors.adminError
                        }}
                      >
                        {report.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm" style={{ color: colors.textSecondary }}>
                        {new Date(report.reported_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mb-2" style={{ color: colors.textPrimary }}>{report.description}</p>
                    {report.repair_cost && (
                      <p className="text-sm font-medium" style={{ color: colors.adminError }}>
                        Repair Cost: KSh {Number(report.repair_cost).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'maintenance':
        return (
          <div className="space-y-4">
            {maintenanceRecords.length === 0 ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                <Wrench size={48} className="mx-auto mb-4 opacity-50" />
                <p>No maintenance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Type</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Description</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Scheduled</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Cost</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50" style={{ borderColor: colors.borderLight }}>
                        <td className="py-3 px-4 capitalize" style={{ color: colors.textPrimary }}>{record.maintenance_type}</td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{record.description}</td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          {new Date(record.scheduled_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                          KSh {Number(record.cost).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                            style={{
                              backgroundColor: record.status === 'completed' ? `${colors.adminSuccess}20` :
                                record.status === 'in_progress' ? `${colors.adminWarning}20` :
                                  record.status === 'scheduled' ? `${colors.adminPrimary}20` : `${colors.adminError}20`,
                              color: record.status === 'completed' ? colors.adminSuccess :
                                record.status === 'in_progress' ? colors.adminWarning :
                                  record.status === 'scheduled' ? colors.adminPrimary : colors.adminError
                            }}
                          >
                            {record.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )

      case 'income':
        return (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}10` }}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} style={{ color: colors.adminSuccess }} />
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Total Income</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  KSh {totalIncome.toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}10` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Percent size={20} style={{ color: colors.adminPrimary }} />
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Collection Rate</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  {collectionRate.toFixed(1)}%
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminAccent}10` }}>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={20} style={{ color: colors.adminAccent }} />
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Total Deposits</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  KSh {totalDeposits.toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminWarning}10` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Receipt size={20} style={{ color: colors.adminWarning }} />
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Total Payments</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  KSh {totalPayments.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Deposits Table */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.textPrimary }}>Deposits</h3>
              {contracts.filter(c => c.security_deposit).length === 0 ? (
                <p className="text-center py-4" style={{ color: colors.textSecondary }}>No deposits recorded</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border" style={{ borderColor: colors.borderLight }}>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50" style={{ borderColor: colors.borderLight }}>
                        <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Contract</th>
                        <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Client</th>
                        <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Amount</th>
                        <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.filter(c => c.security_deposit).map((contract) => (
                        <tr key={contract.id} className="border-b hover:bg-gray-50" style={{ borderColor: colors.borderLight }}>
                          <td className="py-3 px-4 font-medium" style={{ color: colors.adminPrimary }}>{contract.contract_number}</td>
                          <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                            {contract.client_name || contract.client?.email}
                          </td>
                          <td className="py-3 px-4 font-medium" style={{ color: colors.adminSuccess }}>
                            KSh {Number(contract.security_deposit).toLocaleString()}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                            {new Date(contract.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payments Table */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.textPrimary }}>Payments</h3>
              {payments.length === 0 ? (
                <p className="text-center py-4" style={{ color: colors.textSecondary }}>No payments recorded</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border" style={{ borderColor: colors.borderLight }}>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50" style={{ borderColor: colors.borderLight }}>
                        <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Transaction ID</th>
                        <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Client</th>
                        <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Amount</th>
                        <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Method</th>
                        <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50" style={{ borderColor: colors.borderLight }}>
                          <td className="py-3 px-4 font-mono text-sm" style={{ color: colors.textSecondary }}>
                            {payment.transaction_id || `TXN-${payment.id}`}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                            {typeof payment.client === 'object' ? (
                              <>
                                {payment.client.first_name} {payment.client.last_name || payment.client.email}
                              </>
                            ) : (
                              payment.client_name || 'N/A'
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium" style={{ color: colors.adminSuccess }}>
                            KSh {Number(payment.amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{payment.method}</td>
                          <td className="py-3 px-4">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: payment.status === 'SUCCESS' ? `${colors.adminSuccess}20` :
                                  payment.status === 'PENDING' ? `${colors.adminWarning}20` : `${colors.adminError}20`,
                                color: payment.status === 'SUCCESS' ? colors.adminSuccess :
                                  payment.status === 'PENDING' ? colors.adminWarning : colors.adminError
                              }}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )

      case 'expenses':
        const totalExpenses = expenseData ? expenseData.total_expenses : expenses.reduce((sum, e) => sum + Number(e.total_amount), 0)
        return (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminError}10` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Receipt size={20} style={{ color: colors.adminError }} />
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Total Expenses</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  KSh {totalExpenses.toLocaleString()}
                </div>
              </div>

              {expenseData && (
                <>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminWarning}10` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench size={20} style={{ color: colors.adminWarning }} />
                      <span className="text-sm" style={{ color: colors.textSecondary }}>Maintenance</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                      KSh {expenseData.total_maintenance_expenses.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminAccent}10` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Settings size={20} style={{ color: colors.adminAccent }} />
                      <span className="text-sm" style={{ color: colors.textSecondary }}>Parts</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                      KSh {expenseData.total_parts_expenses.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}10` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={20} style={{ color: colors.adminPrimary }} />
                      <span className="text-sm" style={{ color: colors.textSecondary }}>Operational</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                      KSh {expenseData.total_operational_expenses.toLocaleString()}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Expense Breakdown */}
            {expenseData && expenseData.expense_breakdown.length > 0 && (
              <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                  Expense Breakdown by Category
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expenseData.expense_breakdown.map((category, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium" style={{ color: colors.textPrimary }}>
                            {category.category}
                          </div>
                          <div className="text-sm" style={{ color: colors.textSecondary }}>
                            {category.count} transactions
                          </div>
                        </div>
                        <div className="text-lg font-bold" style={{ color: colors.adminError }}>
                          KSh {category.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy expenses table - show only if no expense data from API and we have expenses */}
            {!expenseData && expenses.length > 0 && (
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                  Expense Details
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Category</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Description</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Date</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b hover:bg-gray-50" style={{ borderColor: colors.borderLight }}>
                        <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>{typeof expense.category === 'string' ? expense.category : (expense.category as any)?.name || 'Uncategorized'}</td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{(expense as any).description}</td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          {new Date((expense as any).expense_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-medium" style={{ color: colors.adminError }}>
                          KSh {Number((expense as any).total_amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* No data message */}
            {!expenseData && expenses.length === 0 && (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                <Receipt size={48} className="mx-auto mb-4 opacity-50" />
                <p>No expenses recorded for this vehicle</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} style={{ color: colors.textSecondary }} />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
              {vehicle.make} {vehicle.model}
            </h1>
            <p style={{ color: colors.textSecondary }}>
              Registration: {vehicle.registration_number}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/admin/fleet-management/${vehicle.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
            style={{ borderColor: colors.borderLight, color: colors.textPrimary }}
          >
            <Edit size={18} />
            Edit Vehicle
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.adminPrimary }}
          >
            <Download size={18} />
            Download Report
          </button>
        </div>
      </div>

      {/* Vehicle Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Basic Information */}
        <DashboardCard
          title="Basic Information"
          subtitle="Vehicle details and specifications"
        >
          <div className="space-y-4">
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Status</span>
              <div className="flex items-center gap-2">
                {getStatusIcon((vehicle as any).calculated_status || vehicle.status)}
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getStatusColor((vehicle as any).calculated_status || vehicle.status)}20`,
                    color: getStatusColor((vehicle as any).calculated_status || vehicle.status),
                  }}
                >
                  {(vehicle as any).calculated_status || vehicle.status}
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Classification</span>
              <span style={{ color: colors.textPrimary }}>{vehicle.classification || 'N/A'}</span>
            </div>

            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Vehicle Type</span>
              <span style={{ color: colors.textPrimary }}>{vehicle.vehicle_type || 'N/A'}</span>
            </div>

            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Color</span>
              <span style={{ color: colors.textPrimary }}>{vehicle.color || 'N/A'}</span>
            </div>
          </div>
        </DashboardCard>

        {/* Financial Overview - Now includes Supplier Information */}
        <DashboardCard
          title="Financial Overview"
          subtitle="Pricing, supplier & payment information"
        >
          <div className="space-y-4">
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Purchase Price</span>
              <span style={{ color: colors.textPrimary }}>
                KSh {Number(vehicle.purchase_price || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Amount Paid</span>
              <span style={{ color: colors.textPrimary }}>
                KSh {Number(vehicle.paid_price || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Balance Due</span>
              <span style={{ color: Number(vehicle.purchase_price || 0) - Number(vehicle.paid_price || 0) > 0 ? colors.adminError : colors.adminSuccess }}>
                KSh {(Number(vehicle.purchase_price || 0) - Number(vehicle.paid_price || 0)).toLocaleString()}
              </span>
            </div>

            {vehicle.supplier && (
              <>
                <div className="border-t pt-4" style={{ borderColor: colors.borderLight }}>
                  <div className="flex justify-between">
                    <span style={{ color: colors.textSecondary }}>Supplier</span>
                    <span style={{ color: colors.textPrimary }}>
                      {typeof vehicle.supplier === 'object' && vehicle.supplier ? vehicle.supplier.name : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Purchase Date</span>
                  <span style={{ color: colors.textPrimary }}>
                    {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Advanced Financial Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <DashboardCard
          title="Financial Performance & Analytics"
          subtitle="Comprehensive financial insights, ROI analysis, and profitability metrics"
        >
          <AdvancedFinancialAnalytics vehicleId={vehicleId} />
        </DashboardCard>
      </motion.div>

      {/* Tabs Section */}
      <div className="mb-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                ? 'bg-white shadow-sm'
                : 'hover:bg-gray-200'
                }`}
              style={{
                color: activeTab === tab.id ? colors.adminPrimary : colors.textSecondary
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <DashboardCard>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </DashboardCard>
      </div>

      {/* Description */}
      {vehicle.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <DashboardCard
            title="Description"
            subtitle="Additional vehicle notes"
          >
            <p style={{ color: colors.textPrimary }} className="leading-relaxed">
              {vehicle.description}
            </p>
          </DashboardCard>
        </motion.div>
      )}
    </div>
  )
}