import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  TagIcon,
  IdentificationIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'Supplier Info', href: '/fournisseur', icon: IdentificationIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Email Test', href: '/email-test', icon: BellIcon }
  ];

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white shadow-xl rounded-r-3xl overflow-hidden">
        <div className="flex items-center flex-shrink-0 px-6 py-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BuildingStorefrontIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VendorHub
              </h1>
              <p className="text-sm text-gray-500">Multi-Vendor Dashboard</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 pb-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg shadow-blue-100/50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                }`
              }
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-5 w-5"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;