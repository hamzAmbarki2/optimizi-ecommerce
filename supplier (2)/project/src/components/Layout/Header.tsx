// File: /home/ubuntu/project-bolt/project/src/components/Layout/Header.tsx

import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useFournisseur } from '../../hooks/useFournisseur';
import NotificationCenter from '../notifications/NotificationCenter';

const Header: React.FC = () => {
  const { userData, logout } = useAuth();
  const { fournisseur } = useFournisseur();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {userData?.fullName || 'User'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationCenter />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
              {userData?.imageUrl ? (
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={userData.imageUrl}
                  alt="Profile"
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {userData?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userData?.role || 'User'}
                </p>
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-2xl bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
