'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  Car,
  MapPin,
  Clock,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  Gauge
} from 'lucide-react';
import { colors } from '@/lib/theme/colors';
import VehicleStatusGrid from '@/components/dashboard/VehicleStatusGrid';
import VehicleStatusTimeline from '@/components/dashboard/VehicleStatusTimeline';
import StatusUpdateModal from '@/components/modals/StatusUpdateModal';
import DashboardCard from '@/components/shared/dashboard-card';
import StatCard from '@/components/shared/stat-card';
import {
  fetchVehicleStatusOverview,
  fetchUtilizationStats,
  fetchVehiclesByStatus,
  VehicleStatusOverview,
  UtilizationStats
} from '@/lib/api';

type ViewMode = 'grid' | 'timeline' | 'analytics' | 'reports';

export default function TrackingOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>('grid');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusOverview, setStatusOverview] = useState<VehicleStatusOverview | null>(null);
  const [utilizationStats, setUtilizationStats] = useState<UtilizationStats | null>(null);
  const [vehiclesByStatus, setVehiclesByStatus] = useState<Record<string, any[]>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const views = [
    { id: 'grid' as ViewMode, label: 'Grid View', icon: BarChart3, description: 'Real-time status grid' },
    { id: 'timeline' as ViewMode, label: 'Timeline View', icon: Clock, description: 'Status history timeline' },
    { id: 'analytics' as ViewMode, label: 'Analytics', icon: TrendingUp, description: 'Fleet analytics & insights' },
    { id: 'reports' as ViewMode, label: 'Reports', icon: Activity, description: 'Detailed reports & metrics' }
  ];

  // Load all tracking data
  const loadTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, statsData] = await Promise.all([
        fetchVehicleStatusOverview(),
        fetchUtilizationStats(30)
      ]);

      setStatusOverview(overviewData);
      setUtilizationStats(statsData);

      // Load vehicles by status
      const statusTypes = ['AVAILABLE', 'HIRED', 'IN_GARAGE', 'UNAVAILABLE'];
      const vehiclesByStatusPromises = statusTypes.map(async (status) => {
        try {
          const vehicles = await fetchVehiclesByStatus(status);
          return { status, vehicles };
        } catch (err) {
          console.warn(`Failed to load ${status} vehicles:`, err);
          return { status, vehicles: [] };
        }
      });

      const vehicleResults = await Promise.all(vehiclesByStatusPromises);
      const vehiclesByStatusMap = vehicleResults.reduce((acc, result) => {
        if (result && typeof result === 'object' && 'status' in result && 'vehicles' in result) {
          acc[result.status] = Array.isArray(result.vehicles) ? result.vehicles : [];
        }
        return acc;
      }, {} as Record<string, any[]>);

      setVehiclesByStatus(vehiclesByStatusMap);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading tracking data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  // Handle vehicle selection for timeline
  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    if (activeView !== 'timeline') {
      setActiveView('timeline');
    }
  };

  // Handle status update
  const handleStatusUpdated = () => {
    loadTrackingData();
  };

  // Initial load
  useEffect(() => {
    loadTrackingData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} />
              <p className="font-medium">Error Loading Tracking Data</p>
            </div>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={loadTrackingData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/supervisor"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
              Vehicle Tracking Overview
            </h1>
            <p style={{ color: colors.textSecondary }}>
              Real-time vehicle status monitoring, timeline tracking, and fleet analytics
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadTrackingData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {statusOverview && utilizationStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Vehicles"
            value={statusOverview.total_vehicles.toString()}
            icon={Car}
            trend={{ value: '', isPositive: true }}
            color={colors.supervisorPrimary}
          />
          <StatCard
            title="Available"
            value={statusOverview.status_breakdown.AVAILABLE?.count.toString() || '0'}
            icon={CheckCircle}
            trend={{ 
              value: `${statusOverview.status_breakdown.AVAILABLE?.percentage.toFixed(1) || 0}%`, 
              isPositive: true 
            }}
            color={colors.supervisorAccent}
          />
          <StatCard
            title="On Hire"
            value={statusOverview.status_breakdown.HIRED?.count.toString() || '0'}
            icon={Users}
            trend={{ 
              value: `${statusOverview.status_breakdown.HIRED?.percentage.toFixed(1) || 0}%`, 
              isPositive: true 
            }}
            color="#3b82f6"
          />
          <StatCard
            title="Avg Utilization"
            value={`${utilizationStats.average_utilization}%`}
            icon={TrendingUp}
            trend={{ value: '30d period', isPositive: utilizationStats.average_utilization > 60 }}
            color={utilizationStats.average_utilization > 60 ? colors.supervisorAccent : '#f59e0b'}
          />
        </div>
      )}

      {/* View Selector */}
      <div className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  activeView === view.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={20} className={activeView === view.id ? 'text-blue-600' : 'text-gray-600'} />
                  <h3 className={`font-semibold ${activeView === view.id ? 'text-blue-900' : 'text-gray-900'}`}>
                    {view.label}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{view.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="mb-6 text-sm text-gray-500">
        Last updated: {lastRefresh.toLocaleTimeString()} | Manual refresh only
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'grid' && (
            <GridView
              onVehicleSelect={handleVehicleSelect}
              onStatusUpdate={handleStatusUpdated}
            />
          )}
          
          {activeView === 'timeline' && (
            <TimelineView
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
            />
          )}
          
          {activeView === 'analytics' && (
            <AnalyticsView
              statusOverview={statusOverview}
              utilizationStats={utilizationStats}
              vehiclesByStatus={vehiclesByStatus}
            />
          )}
          
          {activeView === 'reports' && (
            <ReportsView
              statusOverview={statusOverview}
              utilizationStats={utilizationStats}
              vehiclesByStatus={vehiclesByStatus}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
        onStatusUpdated={handleStatusUpdated}
        userRole="supervisor"
      />
    </motion.div>
  );
}

// Grid View Component
function GridView({ 
  onVehicleSelect, 
  onStatusUpdate 
}: { 
  onVehicleSelect: (vehicle: any) => void;
  onStatusUpdate: () => void;
}) {
  return (
    <VehicleStatusGrid
      onVehicleSelect={onVehicleSelect}
      onStatusUpdate={onStatusUpdate}
    />
  );
}

// Timeline View Component
function TimelineView({ 
  selectedVehicle, 
  onVehicleSelect 
}: { 
  selectedVehicle: any;
  onVehicleSelect: (vehicle: any) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Vehicle Selector */}
      <DashboardCard title="Vehicle Timeline" subtitle="Select a vehicle to view status history">
        {!selectedVehicle ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No vehicle selected</p>
            <p className="text-sm text-gray-400">
              Go to Grid View and click on a vehicle to see its timeline, or use the vehicle selector below
            </p>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">{selectedVehicle.registration_number}</h4>
                <p className="text-sm text-blue-700">{selectedVehicle.make} {selectedVehicle.model}</p>
              </div>
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Timeline Component */}
      {selectedVehicle && (
        <VehicleStatusTimeline
          vehicleId={selectedVehicle.id}
          vehicleRegistration={selectedVehicle.registration_number}
          days={30}
          maxEntries={50}
          showFilters={true}
        />
      )}
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ 
  statusOverview, 
  utilizationStats, 
  vehiclesByStatus 
}: {
  statusOverview: VehicleStatusOverview | null;
  utilizationStats: UtilizationStats | null;
  vehiclesByStatus: Record<string, any[]>;
}) {
  if (!statusOverview || !utilizationStats) {
    return <div>Loading analytics...</div>;
  }

  const statusColors = {
    AVAILABLE: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    HIRED: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    IN_GARAGE: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    UNAVAILABLE: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
  };

  return (
    <div className="space-y-6">
      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(statusOverview.status_breakdown).map(([status, data]) => {
          const colorScheme = statusColors[status as keyof typeof statusColors];
          return (
            <DashboardCard
              key={status}
              title={data.label}
              subtitle={`${data.count} vehicles`}
              className={`${colorScheme.bg} ${colorScheme.border} border`}
            >
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: colors.supervisorPrimary }}>
                  {data.percentage.toFixed(1)}%
                </div>
                <div className="space-y-2">
                  <div className={`w-full bg-gray-200 rounded-full h-2`}>
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{data.count} of {statusOverview.total_vehicles}</p>
                </div>
              </div>
            </DashboardCard>
          );
        })}
      </div>

      {/* Utilization Analytics */}
      <DashboardCard title="Fleet Utilization Analytics" subtitle="30-day performance metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Average Utilization</h4>
            <div className="text-2xl font-bold mb-2" style={{ color: colors.supervisorPrimary }}>
              {utilizationStats.average_utilization}%
            </div>
            <div className="text-sm text-gray-500">Across all vehicles</div>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Vehicles on Hire</h4>
            <div className="text-2xl font-bold mb-2 text-blue-600">
              {utilizationStats.hired_vehicles}
            </div>
            <div className="text-sm text-gray-500">Currently active</div>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Available Fleet</h4>
            <div className="text-2xl font-bold mb-2 text-green-600">
              {utilizationStats.available_vehicles}
            </div>
            <div className="text-sm text-gray-500">Ready for hire</div>
          </div>
        </div>
      </DashboardCard>

      {/* Fleet Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Fleet Health" subtitle="Vehicle status breakdown">
          <div className="space-y-4">
            {Object.entries(vehiclesByStatus).map(([status, vehicles]) => (
              <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'AVAILABLE' ? 'bg-green-500' :
                    status === 'HIRED' ? 'bg-blue-500' :
                    status === 'IN_GARAGE' ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">{status.replace('_', ' ')}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{vehicles.length}</span>
                  <span className="text-sm text-gray-500 ml-2">vehicles</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Performance Insights" subtitle="Key metrics and trends">
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">High Availability</span>
              </div>
              <p className="text-xs text-green-700">
                {((statusOverview.status_breakdown.AVAILABLE?.percentage || 0) >= 30 ? 'Great' : 'Good')} availability rate
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Active Usage</span>
              </div>
              <p className="text-xs text-blue-700">
                {utilizationStats.hired_vehicles} vehicles currently generating revenue
              </p>
            </div>
            
            {utilizationStats.maintenance_vehicles > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} className="text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Maintenance Attention</span>
                </div>
                <p className="text-xs text-orange-700">
                  {utilizationStats.maintenance_vehicles} vehicles in garage for maintenance
                </p>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

// Reports View Component
function ReportsView({ 
  statusOverview, 
  utilizationStats, 
  vehiclesByStatus 
}: {
  statusOverview: VehicleStatusOverview | null;
  utilizationStats: UtilizationStats | null;
  vehiclesByStatus: Record<string, any[]>;
}) {
  const reportData = [
    {
      title: 'Fleet Status Summary',
      description: 'Current status distribution across all vehicles',
      data: statusOverview ? Object.entries(statusOverview.status_breakdown).map(([status, data]) => ({
        label: data.label,
        value: data.count,
        percentage: data.percentage
      })) : []
    },
    {
      title: 'Vehicle Utilization Report',
      description: '30-day utilization metrics and trends',
      data: utilizationStats ? [
        { label: 'Average Utilization', value: `${utilizationStats.average_utilization}%`, percentage: utilizationStats.average_utilization },
        { label: 'Vehicles on Hire', value: utilizationStats.hired_vehicles, percentage: (utilizationStats.hired_vehicles / utilizationStats.total_vehicles) * 100 },
        { label: 'Available Vehicles', value: utilizationStats.available_vehicles, percentage: (utilizationStats.available_vehicles / utilizationStats.total_vehicles) * 100 },
        { label: 'In Maintenance', value: utilizationStats.maintenance_vehicles, percentage: (utilizationStats.maintenance_vehicles / utilizationStats.total_vehicles) * 100 }
      ] : []
    }
  ];

  return (
    <div className="space-y-6">
      {/* Report Summary */}
      <DashboardCard title="Fleet Reports Dashboard" subtitle="Comprehensive tracking reports and analytics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <h4 className="font-semibold text-blue-900">Daily Reports</h4>
            <p className="text-sm text-blue-700">Real-time status tracking</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <BarChart3 className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <h4 className="font-semibold text-green-900">Utilization Analytics</h4>
            <p className="text-sm text-green-700">Performance insights</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <TrendingUp className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <h4 className="font-semibold text-orange-900">Trend Analysis</h4>
            <p className="text-sm text-orange-700">Historical patterns</p>
          </div>
        </div>
      </DashboardCard>

      {/* Detailed Reports */}
      {reportData.map((report, index) => (
        <DashboardCard
          key={index}
          title={report.title}
          subtitle={report.description}
        >
          {report.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data available for this report
            </div>
          ) : (
            <div className="space-y-3">
              {report.data.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{item.label}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(item.percentage || 0, 100)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900 min-w-[60px] text-right">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      ))}

      {/* Export Options */}
      <DashboardCard title="Export Reports" subtitle="Download tracking data and reports">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <Activity className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <h4 className="font-medium">Status Report</h4>
              <p className="text-sm text-gray-600">Current vehicle statuses</p>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <h4 className="font-medium">Analytics Report</h4>
              <p className="text-sm text-gray-600">Utilization & performance</p>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto text-orange-600 mb-2" />
              <h4 className="font-medium">Timeline Report</h4>
              <p className="text-sm text-gray-600">Historical status changes</p>
            </div>
          </button>
        </div>
      </DashboardCard>
    </div>
  );
}