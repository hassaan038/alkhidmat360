import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Heart,
  Package,
  Scissors,
  Users,
  DollarSign,
  Apple,
  Baby,
  HandHeart,
  X,
  UserPlus,
} from 'lucide-react';

// Menu items for different user types
const menuItems = {
  DONOR: [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard/user',
    },
    {
      label: 'Qurbani Donation',
      icon: Heart,
      path: '/dashboard/user/qurbani',
      description: 'Donate animals for Qurbani',
    },
    {
      label: 'Ration Donation',
      icon: Package,
      path: '/dashboard/user/ration',
      description: 'Donate ration packages',
    },
    {
      label: 'Skin Collection',
      icon: Scissors,
      path: '/dashboard/user/skin-collection',
      description: 'Request skin pickup',
    },
    {
      label: 'Orphan Sponsorship',
      icon: Baby,
      path: '/dashboard/user/orphan-sponsorship',
      description: 'Sponsor an orphan',
    },
  ],
  BENEFICIARY: [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard/user',
    },
    {
      label: 'Loan Application',
      icon: DollarSign,
      path: '/dashboard/user/loan',
      description: 'Apply for interest-free loan',
    },
    {
      label: 'Ramadan Ration',
      icon: Apple,
      path: '/dashboard/user/ramadan-ration',
      description: 'Apply for Ramadan ration',
    },
    {
      label: 'Orphan Registration',
      icon: Baby,
      path: '/dashboard/user/orphan',
      description: 'Register as guardian',
    },
  ],
  VOLUNTEER: [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard/user',
    },
    {
      label: 'Volunteer Tasks',
      icon: HandHeart,
      path: '/dashboard/user/volunteer-task',
      description: 'Register for tasks',
    },
  ],
  ADMIN: [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard/admin',
    },
    {
      label: 'Create Admin',
      icon: UserPlus,
      path: '/dashboard/admin/create-admin',
      description: 'Add new admin user',
    },
    {
      label: 'User Management',
      icon: Users,
      path: '/dashboard/admin/users',
      description: 'Manage all users',
    },
    {
      label: 'Donations',
      icon: Heart,
      path: '/dashboard/admin/donations',
      description: 'View all donations',
    },
    {
      label: 'Applications',
      icon: Package,
      path: '/dashboard/admin/applications',
      description: 'Review applications',
    },
    {
      label: 'Volunteers',
      icon: HandHeart,
      path: '/dashboard/admin/volunteers',
      description: 'Manage volunteers',
    },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const location = useLocation();

  const currentMenuItems = menuItems[user?.userType] || [];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 transition-transform duration-300 z-50',
          'w-72 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {currentMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 rounded-lg transition-all group',
                    active
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 mt-0.5 flex-shrink-0',
                      active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', active && 'font-semibold')}>
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <p className="text-sm font-medium text-primary-900 mb-1">Need Help?</p>
            <p className="text-xs text-primary-700">
              Contact our support team for assistance
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
