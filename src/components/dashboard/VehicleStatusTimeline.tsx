'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  User, 
  MapPin, 
  Gauge, 
  MessageSquare, 
  TrendingUp,
  Filter,
  Calendar,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { fetchVehicleStatusHistory } from '@/lib/api';

interface StatusHistoryEntry {
  id: string;
  old_status: string;
  new_status: string;
  timestamp: string;
  updated_by: {
    id?: string;
    name: string;
    email?: string;
  } | null;
  location?: string;
  reason?: string;
  mileage_at_change?: number;
  time_since_update: string;
}

interface VehicleStatusTimelineProps {
  vehicleId?: string;
  vehicleRegistration?: string;
  days?: number;
  maxEntries?: number;
  showFilters?: boolean;
  className?: string;
}

const statusColors = {
  AVAILABLE: 'bg-green-500 text-white',
  HIRED: 'bg-blue-500 text-white',
  IN_GARAGE: 'bg-orange-500 text-white',
  UNAVAILABLE: 'bg-red-500 text-white'
};

const statusLabels = {
  AVAILABLE: 'Available',
  HIRED: 'On Hire',
  IN_GARAGE: 'In Garage',
  UNAVAILABLE: 'Unavailable'
};

export default function VehicleStatusTimeline({ 
  vehicleId, 
  vehicleRegistration,
  days = 30, 
  maxEntries = 50,
  showFilters = true,
  className = ''
}: VehicleStatusTimelineProps) {
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(days);
  const [filterByUser, setFilterByUser] = useState<string>('');
  const [filterByStatus, setFilterByStatus] = useState<string>('');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  // Load status history
  const loadStatusHistory = async (vehicleId: string, days: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchVehicleStatusHistory(Number(vehicleId), days);
      // Ensure data is an array before slicing
      const historyArray = Array.isArray(data) ? data : (data?.history || []);
      setStatusHistory(historyArray.slice(0, maxEntries));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status history');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter status history
  const filteredHistory = statusHistory.filter(entry => {
    if (filterByUser && !entry.updated_by?.name.toLowerCase().includes(filterByUser.toLowerCase())) {
      return false;
    }
    if (filterByStatus && entry.new_status !== filterByStatus) {
      return false;
    }
    return true;
  });

  // Toggle entry expansion
  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(
    statusHistory
      .map(entry => entry.updated_by?.name)
      .filter(Boolean)
  )) as string[];

  // Handle days change
  const handleDaysChange = (newDays: number) => {
    setSelectedDays(newDays);
    if (vehicleId) {
      loadStatusHistory(vehicleId, newDays);
    }
  };

  // Initial load effect
  useEffect(() => {
    if (vehicleId) {
      loadStatusHistory(vehicleId, selectedDays);
    }
  }, [vehicleId, selectedDays]);

  if (!vehicleId) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Select a vehicle to view status timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Status Timeline</h3>
            {vehicleRegistration && (
              <p className="text-sm text-gray-600">{vehicleRegistration}</p>
            )}
          </div>
          <button
            onClick={() => vehicleId && loadStatusHistory(vehicleId, selectedDays)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Time Period</label>
              <select
                value={selectedDays}
                onChange={(e) => handleDaysChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 2 weeks</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 3 months</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Filter by User</label>
              <select
                value={filterByUser}
                onChange={(e) => setFilterByUser(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All users</option>
                <option value="System">System</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Filter by Status</label>
              <select
                value={filterByStatus}
                onChange={(e) => setFilterByStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All statuses</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={() => vehicleId && loadStatusHistory(vehicleId, selectedDays)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Try again
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No status changes found</p>
            <p className="text-sm text-gray-400">Try adjusting the time period or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((entry, index) => {
              const { date, time } = formatDateTime(entry.timestamp);
              const isExpanded = expandedEntries.has(entry.id);
              const hasDetails = entry.location || entry.reason || entry.mileage_at_change;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Timeline line */}
                  {index < filteredHistory.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
                  )}
                  
                  {/* Timeline entry */}
                  <div className="flex gap-4">
                    {/* Status indicator */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-medium ${statusColors[entry.new_status as keyof typeof statusColors]}`}>
                      {statusLabels[entry.new_status as keyof typeof statusLabels]?.split(' ').map(word => word[0]).join('')}
                    </div>
                    
                    {/* Entry content */}
                    <div className="flex-1 min-w-0">
                      <div 
                        className={`bg-gray-50 rounded-lg p-4 ${hasDetails ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                        onClick={hasDetails ? () => toggleEntryExpansion(entry.id) : undefined}
                      >
                        {/* Main status change */}
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Status changed from{' '}
                              <span className="text-red-600">
                                {statusLabels[entry.old_status as keyof typeof statusLabels]}
                              </span>
                              {' '}to{' '}
                              <span className="text-green-600">
                                {statusLabels[entry.new_status as keyof typeof statusLabels]}
                              </span>
                            </p>
                            
                            {/* Timestamp and user */}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{date} at {time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{entry.updated_by?.name || 'System'}</span>
                              </div>
                            </div>
                          </div>
                          
                          {hasDetails && (
                            <ChevronDown 
                              className={`h-4 w-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          )}
                        </div>
                        
                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && hasDetails && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 pt-3 border-t border-gray-200 space-y-2"
                            >
                              {entry.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="h-4 w-4" />
                                  <span>Location: {entry.location}</span>
                                </div>
                              )}
                              
                              {entry.mileage_at_change && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Gauge className="h-4 w-4" />
                                  <span>Mileage: {entry.mileage_at_change.toLocaleString()} km</span>
                                </div>
                              )}
                              
                              {entry.reason && (
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                  <MessageSquare className="h-4 w-4 mt-0.5" />
                                  <div>
                                    <span className="font-medium">Reason:</span>
                                    <p className="mt-1">{entry.reason}</p>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Load more indicator */}
        {filteredHistory.length === maxEntries && (
          <div className="text-center pt-4 text-sm text-gray-500">
            Showing latest {maxEntries} entries
          </div>
        )}
      </div>
    </div>
  );
}