'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  MapPin, 
  Clock, 
  User, 
  Fuel, 
  Gauge,
  Calendar,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { fetchVehicleStatusOverview, searchVehicles, VehicleStatusOverview } from '@/lib/api';

interface Vehicle {
  id: number;
  registration_number: string;
  make: string;
  model: string;
  location: string | null;
  last_update: string | null;
  current_mileage?: number;
  fuel_level?: number;
  utilization_30d?: number;
}

interface StatusData {
  count: number;
  label: string;
  vehicles: Vehicle[];
  percentage: number;
}

// interface StatusOverview {
//   total_vehicles: number;
//   status_breakdown: Record<string, StatusData>;
//   last_updated: string;
// }

const statusColors = {
  AVAILABLE: 'bg-green-500',
  HIRED: 'bg-blue-500', 
  IN_GARAGE: 'bg-orange-500',
  UNAVAILABLE: 'bg-red-500'
};

const statusBgColors = {
  AVAILABLE: 'bg-green-50 border-green-200',
  HIRED: 'bg-blue-50 border-blue-200',
  IN_GARAGE: 'bg-orange-50 border-orange-200', 
  UNAVAILABLE: 'bg-red-50 border-red-200'
};

interface VehicleStatusGridProps {
  onVehicleSelect?: (vehicle: Vehicle) => void;
  onStatusUpdate?: () => void;
}

export default function VehicleStatusGrid({ onVehicleSelect, onStatusUpdate }: VehicleStatusGridProps) {
  const [statusOverview, setStatusOverview] = useState<VehicleStatusOverview | null>(null);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch status overview
  const loadStatusOverview = async () => {
    try {
      const data = await fetchVehicleStatusOverview();
      setStatusOverview(data);
      updateFilteredVehicles(data, selectedStatus, searchQuery);
    } catch (error) {
      console.error('Error loading vehicle status overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update filtered vehicles based on status and search
  const updateFilteredVehicles = (overview: VehicleStatusOverview, status: string, query: string) => {
    let vehicles: Vehicle[] = [];
    
    if (status === 'ALL') {
      // Combine all vehicles from all statuses
      vehicles = Object.values(overview.status_breakdown).flatMap(statusData => statusData.vehicles);
    } else {
      vehicles = overview.status_breakdown[status]?.vehicles || [];
    }

    // Apply search filter
    if (query) {
      vehicles = vehicles.filter(vehicle => 
        vehicle.registration_number.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(query.toLowerCase()) ||
        (vehicle.location && vehicle.location.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredVehicles(vehicles);
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setLastRefresh(new Date());
    loadStatusOverview();
    if (onStatusUpdate) onStatusUpdate();
  };

  // Handle status filter change
  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    if (statusOverview) {
      updateFilteredVehicles(statusOverview, status, searchQuery);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (statusOverview) {
      updateFilteredVehicles(statusOverview, selectedStatus, query);
    }
  };

  // Format time since last update
  const formatTimeSince = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadStatusOverview();
        setLastRefresh(new Date());
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Initial load
  useEffect(() => {
    loadStatusOverview();
  }, []);

  if (isLoading && !statusOverview) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Status Overview</h2>
          <p className="text-sm text-gray-500">
            Last updated: {formatTimeSince(lastRefresh.toISOString())}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh
          </label>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      {statusOverview && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Vehicles Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedStatus === 'ALL' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => handleStatusFilter('ALL')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{statusOverview.total_vehicles}</p>
              </div>
              <Car className="h-8 w-8 text-gray-600" />
            </div>
          </motion.div>

          {/* Status Cards */}
          {Object.entries(statusOverview.status_breakdown).map(([statusCode, statusData], index) => (
            <motion.div
              key={statusCode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedStatus === statusCode ? statusBgColors[statusCode as keyof typeof statusBgColors] : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleStatusFilter(statusCode)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{statusData.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{statusData.count}</p>
                  <p className="text-xs text-gray-500">{statusData.percentage.toFixed(1)}%</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${statusColors[statusCode as keyof typeof statusColors]}`} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by registration, make, model, or location..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVehicles.map((vehicle, index) => {
          const vehicleStatus = statusOverview ? 
            Object.keys(statusOverview.status_breakdown).find(status => 
              statusOverview.status_breakdown[status].vehicles.some(v => v.id === vehicle.id)
            ) || 'AVAILABLE' : 'AVAILABLE';

          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onVehicleSelect && onVehicleSelect(vehicle)}
            >
              {/* Vehicle Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{vehicle.registration_number}</h3>
                  <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${statusColors[vehicleStatus as keyof typeof statusColors]}`} />
              </div>

              {/* Vehicle Details */}
              <div className="space-y-2 text-sm text-gray-600">
                {vehicle.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{vehicle.location}</span>
                  </div>
                )}
                
                {vehicle.current_mileage && (
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    <span>{vehicle.current_mileage.toLocaleString()} km</span>
                  </div>
                )}
                
                {vehicle.fuel_level !== undefined && (
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    <span>{vehicle.fuel_level}%</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Updated {formatTimeSince(vehicle.last_update)}</span>
                </div>
                
                {vehicle.utilization_30d !== undefined && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">30-day utilization: {vehicle.utilization_30d}%</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${vehicle.utilization_30d}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search criteria' : 'No vehicles match the selected filters'}
          </p>
        </div>
      )}
    </div>
  );
}