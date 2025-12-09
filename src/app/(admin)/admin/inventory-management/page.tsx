'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Car,
  Wrench,
  BarChart3,
  Activity,
  Users,
} from 'lucide-react'
import { Tabs, TabPanel } from '@/components/shared/tabs'
import { colors } from '@/lib/theme/colors'

// Import tab components
import OverviewTab from './components/overview/dashboard-overview'
import VehiclesTab from './components/vehicles/vehicles-tab'
import PartsTab from './components/parts/parts-tab'
import ReportsTab from './components/reports/reports-tab'
import StockUsageTab from './components/stock-usage/stock-usage-tab'
import SuppliersTab from './components/suppliers/suppliers-tab'

export default function InventoryManagementPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: <LayoutDashboard size={18} /> 
    },
    { 
      id: 'vehicles', 
      label: 'Vehicles', 
      icon: <Car size={18} /> 
    },
    { 
      id: 'parts', 
      label: 'Parts', 
      icon: <Wrench size={18} /> 
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: <BarChart3 size={18} /> 
    },
    { 
      id: 'stock-usage', 
      label: 'Stock Usage', 
      icon: <Activity size={18} /> 
    },
    { 
      id: 'suppliers', 
      label: 'Suppliers', 
      icon: <Users size={18} /> 
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'vehicles':
        return <VehiclesTab />
      case 'parts':
        return <PartsTab />
      case 'reports':
        return <ReportsTab />
      case 'stock-usage':
        return <StockUsageTab />
      case 'suppliers':
        return <SuppliersTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
          Inventory Management
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Comprehensive fleet and parts inventory management system
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <TabPanel>
        {renderTabContent()}
      </TabPanel>
    </motion.div>
  )
}