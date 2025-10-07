import React, { useState, useEffect } from 'react';
import { EnhancedNotificationService } from '../../services/enhancedNotificationService';
import { NotificationPreferences } from '../../types/notifications';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface NotificationPreferencesProps {
  fournisseurId: string;
  onClose: () => void;
}

const NotificationPreferencesComponent: React.FC<NotificationPreferencesProps> = ({
  fournisseurId,
  onClose
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPreferences();
  }, [fournisseurId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await EnhancedNotificationService.getNotificationPreferences(fournisseurId);
      setPreferences(prefs || getDefaultPreferences());
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPreferences = (): NotificationPreferences => ({
    fournisseurId,
    newOrderReceived: true,
    orderStatusChanged: true,
    orderCancelled: true,
    orderModified: true,
    paymentReceived: true,
    paymentFailed: true,
    paymentPending: true,
    refundProcessed: true,
    lowInventoryAlert: true,
    outOfStockAlert: true,
    restockReminder: true,
    productReviewReceived: true,
    productPerformanceUpdate: false,
    accountVerificationUpdate: true,
    profileUpdateRequired: true,
    promotionalCampaignUpdate: false,
    salesReportReady: false,
    systemMaintenance: true,
    policyChanges: true,
    securityAlerts: true,
    emailNotifications: true,
    inAppNotifications: true,
    smsNotifications: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    instantNotifications: true,
    dailyDigest: false,
    weeklyDigest: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await EnhancedNotificationService.updateNotificationPreferences(fournisseurId, preferences);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: value,
      updatedAt: new Date().toISOString()
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-4xl w-full">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BellIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Notification Preferences</h2>
              <p className="text-gray-600 mt-1">Customize how you receive notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* Delivery Methods */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BellIcon className="h-6 w-6 mr-2" />
              Delivery Methods
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <BellIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">In-App Notifications</p>
                    <p className="text-sm text-gray-600">Show notifications in the dashboard</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inAppNotifications}
                  onChange={(e) => updatePreference('inAppNotifications', e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Send notifications via email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <DevicePhoneMobileIcon className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Send urgent alerts via SMS</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications}
                  onChange={(e) => updatePreference('smsNotifications', e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Order Notifications */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Notifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'newOrderReceived', label: 'New Order Received', description: 'When a customer places a new order' },
                { key: 'orderStatusChanged', label: 'Order Status Changes', description: 'When order status is updated' },
                { key: 'orderCancelled', label: 'Order Cancelled', description: 'When an order is cancelled' },
                { key: 'orderModified', label: 'Order Modified', description: 'When order details are changed' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Notifications */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Notifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'paymentReceived', label: 'Payment Received', description: 'When payment is successfully processed' },
                { key: 'paymentFailed', label: 'Payment Failed', description: 'When payment processing fails' },
                { key: 'paymentPending', label: 'Payment Pending', description: 'When payment is awaiting confirmation' },
                { key: 'refundProcessed', label: 'Refund Processed', description: 'When a refund is completed' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Notifications */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Inventory Notifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'lowInventoryAlert', label: 'Low Inventory Alert', description: 'When product stock is running low' },
                { key: 'outOfStockAlert', label: 'Out of Stock Alert', description: 'When products are out of stock' },
                { key: 'restockReminder', label: 'Restock Reminder', description: 'Periodic reminders to restock items' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product & Marketing Notifications */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Product & Marketing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'productReviewReceived', label: 'Product Reviews', description: 'When customers leave product reviews' },
                { key: 'productPerformanceUpdate', label: 'Performance Updates', description: 'Weekly product performance reports' },
                { key: 'promotionalCampaignUpdate', label: 'Campaign Updates', description: 'Marketing campaign performance' },
                { key: 'salesReportReady', label: 'Sales Reports', description: 'When sales reports are generated' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* System Notifications */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">System & Account</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'systemMaintenance', label: 'System Maintenance', description: 'Scheduled maintenance notifications' },
                { key: 'policyChanges', label: 'Policy Changes', description: 'Updates to terms and policies' },
                { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications' },
                { key: 'accountVerificationUpdate', label: 'Account Updates', description: 'Account verification status' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Timing Preferences */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ClockIcon className="h-6 w-6 mr-2" />
              Timing Preferences
            </h3>
            
            <div className="space-y-6">
              {/* Quiet Hours */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-900">Quiet Hours</p>
                    <p className="text-sm text-gray-600">Limit notifications during specific hours</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.quietHoursEnabled}
                    onChange={(e) => updatePreference('quietHoursEnabled', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                {preferences.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={preferences.quietHoursStart}
                        onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={preferences.quietHoursEnd}
                        onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Frequency Settings */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="font-medium text-gray-900 mb-4">Notification Frequency</p>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      checked={preferences.instantNotifications}
                      onChange={() => {
                        updatePreference('instantNotifications', true);
                        updatePreference('dailyDigest', false);
                        updatePreference('weeklyDigest', false);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-900">Instant notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      checked={preferences.dailyDigest}
                      onChange={() => {
                        updatePreference('instantNotifications', false);
                        updatePreference('dailyDigest', true);
                        updatePreference('weeklyDigest', false);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-900">Daily digest</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      checked={preferences.weeklyDigest}
                      onChange={() => {
                        updatePreference('instantNotifications', false);
                        updatePreference('dailyDigest', false);
                        updatePreference('weeklyDigest', true);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-900">Weekly digest</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesComponent;