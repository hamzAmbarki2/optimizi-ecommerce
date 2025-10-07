import React, { useState, useEffect } from 'react';
import { EnhancedNotificationService } from '../../services/enhancedNotificationService';
import { NotificationPreferences } from '../../types/notifications';
import {
  BellIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface NotificationPreferencesWidgetProps {
  fournisseurId: string;
  compact?: boolean;
}

const NotificationPreferencesWidget: React.FC<NotificationPreferencesWidgetProps> = ({
  fournisseurId,
  compact = false
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [fournisseurId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await EnhancedNotificationService.getNotificationPreferences(fournisseurId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;

    try {
      setSaving(true);
      const updatedPreferences = { ...preferences, [key]: value };
      await EnhancedNotificationService.updateNotificationPreferences(fournisseurId, { [key]: value });
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating preference:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!preferences) return null;

  if (compact) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <CogIcon className="h-4 w-4 mr-2" />
            Quick Settings
          </h4>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">In-App</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.inAppNotifications}
              onChange={(e) => updatePreference('inAppNotifications', e.target.checked)}
              disabled={saving}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">Email</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
              disabled={saving}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-700">Quiet Hours</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.quietHoursEnabled}
              onChange={(e) => updatePreference('quietHoursEnabled', e.target.checked)}
              disabled={saving}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>

        {saving && (
          <div className="mt-3 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-xs text-gray-500">Saving...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <CogIcon className="h-6 w-6 mr-2" />
          Notification Settings
        </h3>
      </div>

      <div className="space-y-6">
        {/* Delivery Methods */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Delivery Methods</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <BellIcon className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">In-App Notifications</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.inAppNotifications}
                onChange={(e) => updatePreference('inAppNotifications', e.target.checked)}
                disabled={saving}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Email Notifications</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                disabled={saving}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">SMS Notifications</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                onChange={(e) => updatePreference('smsNotifications', e.target.checked)}
                disabled={saving}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Critical Notifications */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Critical Notifications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'newOrderReceived', label: 'New Orders' },
              { key: 'paymentFailed', label: 'Payment Failures' },
              { key: 'outOfStockAlert', label: 'Out of Stock' },
              { key: 'securityAlerts', label: 'Security Alerts' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-700 text-sm">{item.label}</span>
                <input
                  type="checkbox"
                  checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                  onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                  disabled={saving}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Timing */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Timing</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Quiet Hours</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.quietHoursEnabled}
                onChange={(e) => updatePreference('quietHoursEnabled', e.target.checked)}
                disabled={saving}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {preferences.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-3 pl-8">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start</label>
                  <input
                    type="time"
                    value={preferences.quietHoursStart}
                    onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                    disabled={saving}
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End</label>
                  <input
                    type="time"
                    value={preferences.quietHoursEnd}
                    onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                    disabled={saving}
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {saving && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-500">Saving preferences...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferencesWidget;