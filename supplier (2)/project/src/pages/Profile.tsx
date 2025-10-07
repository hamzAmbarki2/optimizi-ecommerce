import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword, updateEmail } from 'firebase/auth';
import { db } from '../config/config';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhotoIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    email: userData?.email || '',
    imageUrl: userData?.imageUrl || '',
    address: userData?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        imageUrl: userData.imageUrl || '',
        address: userData.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [userData]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleUpdateProfile = async () => {
    if (!currentUser || !userData) return;

    try {
      setLoading(true);
      
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        fullName: formData.fullName,
        imageUrl: formData.imageUrl,
        address: formData.address,
        updatedAt: new Date().toISOString()
      });

      showMessage('success', 'Profile updated successfully!');
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Update email in Firebase Auth
      await updateEmail(currentUser, formData.email);
      
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        email: formData.email,
        updatedAt: new Date().toISOString()
      });

      showMessage('success', 'Email updated successfully!');
      setEditingSection(null);
    } catch (error: any) {
      console.error('Error updating email:', error);
      if (error.code === 'auth/requires-recent-login') {
        showMessage('error', 'Please log out and log back in to update your email.');
      } else {
        showMessage('error', 'Failed to update email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentUser) return;

    if (formData.newPassword !== formData.confirmPassword) {
      showMessage('error', 'New passwords do not match.');
      return;
    }

    if (formData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      
      await updatePassword(currentUser, formData.newPassword);
      
      showMessage('success', 'Password updated successfully!');
      setEditingSection(null);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/requires-recent-login') {
        showMessage('error', 'Please log out and log back in to update your password.');
      } else {
        showMessage('error', 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        imageUrl: userData.imageUrl || '',
        address: userData.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-2xl ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Profile Picture</h2>
          {editingSection !== 'picture' && (
            <button
              onClick={() => setEditingSection('picture')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
            {formData.imageUrl ? (
              <img
                src={formData.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {editingSection === 'picture' ? (
            <div className="flex-1 space-y-4">
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter image URL"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-medium text-gray-900">{userData?.fullName}</h3>
              <p className="text-sm text-gray-500">Supplier Account</p>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          {editingSection !== 'personal' && (
            <button
              onClick={() => setEditingSection('personal')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
          )}
        </div>

        {editingSection === 'personal' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your address"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-2xl disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{userData?.fullName || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{userData?.address || 'Not set'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Section */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Email Address</h2>
          {editingSection !== 'email' && (
            <button
              onClick={() => setEditingSection('email')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
          )}
        </div>

        {editingSection === 'email' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleUpdateEmail}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-2xl disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Update Email
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium text-gray-900">{userData?.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Password</h2>
          {editingSection !== 'password' && (
            <button
              onClick={() => setEditingSection('password')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Change
            </button>
          )}
        </div>

        {editingSection === 'password' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-2xl disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Update Password
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <LockClosedIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Password</p>
              <p className="font-medium text-gray-900">••••••••</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;