'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Car,
  MapPin,
  Gauge,
  MessageSquare,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { updateVehicleStatus } from '@/lib/api';

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  status: string;
  current_location?: string;
  current_mileage?: number;
  fuel_level?: number;
}

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onStatusUpdated?: (vehicleId: string, newStatus: string) => void;
  userRole?: string; // For permission checking
}

const statusOptions = [
  { value: 'AVAILABLE', label: 'Available', color: 'bg-green-500', description: 'Vehicle is available for hire' },
  { value: 'HIRED', label: 'On Hire', color: 'bg-blue-500', description: 'Vehicle is currently hired out' },
  { value: 'IN_GARAGE', label: 'In Garage', color: 'bg-orange-500', description: 'Vehicle is undergoing maintenance' },
  { value: 'UNAVAILABLE', label: 'Unavailable', color: 'bg-red-500', description: 'Vehicle is not available for use' }
];

export default function StatusUpdateModal({
  isOpen,
  onClose,
  vehicle,
  onStatusUpdated,
  userRole = 'admin'
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user has permission to update status
  const canUpdateStatus = userRole === 'admin' || userRole === 'supervisor';

  // Reset form when modal opens/closes or vehicle changes
  useEffect(() => {
    if (isOpen && vehicle) {
      setSelectedStatus(vehicle.status);
      setLocation(vehicle.current_location || '');
      setReason('');
      setMileage(vehicle.current_mileage?.toString() || '');
      setError(null);
      setSuccess(false);
    } else if (!isOpen) {
      // Reset form when modal closes
      setSelectedStatus('');
      setLocation('');
      setReason('');
      setMileage('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, vehicle]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicle || !canUpdateStatus) return;

    // Validation
    if (!selectedStatus) {
      setError('Please select a status');
      return;
    }

    if (selectedStatus === vehicle.status && !reason.trim()) {
      setError('Please provide a reason for updating the same status');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updateData = {
        status: selectedStatus,
        location: location.trim() || undefined,
        reason: reason.trim() || undefined,
        mileage: mileage ? parseInt(mileage) : undefined
      };

      await updateVehicleStatus(Number(vehicle.id), updateData);

      setSuccess(true);

      // Notify parent component
      if (onStatusUpdated) {
        onStatusUpdated(vehicle.id, selectedStatus);
      }

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle status');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Get status option details
  const getStatusDetails = (statusValue: string) => {
    return statusOptions.find(option => option.value === statusValue);
  };

  if (!vehicle) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Update Vehicle Status</h3>
                    <p className="text-sm text-gray-600">{vehicle.registration_number} - {vehicle.make} {vehicle.model}</p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Permission Check */}
                {!canUpdateStatus ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="text-red-800 font-medium">Access Denied</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      You don't have permission to update vehicle status. Only administrators and supervisors can perform this action.
                    </p>
                  </div>
                ) : success ? (
                  /* Success State */
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Status Updated Successfully</h4>
                    <p className="text-gray-600">Vehicle status has been updated and logged in the system.</p>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${getStatusDetails(vehicle.status)?.color || 'bg-gray-400'}`} />
                        <span className="font-medium">{getStatusDetails(vehicle.status)?.label || vehicle.status}</span>
                      </div>
                    </div>

                    {/* New Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">New Status</label>
                      <div className="grid grid-cols-2 gap-3">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelectedStatus(option.value)}
                            className={`p-3 border-2 rounded-lg text-left transition-colors ${selectedStatus === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-3 h-3 rounded-full ${option.color}`} />
                              <span className="font-medium text-sm">{option.label}</span>
                            </div>
                            <p className="text-xs text-gray-500">{option.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                        <span className="text-gray-500 font-normal ml-1">(optional)</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Current location"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Mileage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Mileage
                        <span className="text-gray-500 font-normal ml-1">(optional)</span>
                      </label>
                      <div className="relative">
                        <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={mileage}
                          onChange={(e) => setMileage(e.target.value)}
                          placeholder="Odometer reading"
                          min="0"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason
                        {selectedStatus === vehicle.status && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                        <span className="text-gray-500 font-normal ml-1">
                          {selectedStatus === vehicle.status ? '(required for same status)' : '(optional)'}
                        </span>
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Reason for status change"
                          rows={3}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-red-800 text-sm">{error}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedStatus}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Status'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}