import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useQurbaniModuleStore from '../../store/qurbaniModuleStore';
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
  Drumstick,
  BookOpen,
  ClipboardList,
  Settings,
  ListChecks,
  HandCoins,
  Coins,
  LifeBuoy,
} from 'lucide-react';

// Qurbani items shown to non-admin users when the flag is on
const qurbaniUserItems = [
  {
    label: 'Qurbani Booking',
    icon: Drumstick,
    path: '/dashboard/user/qurbani-module',
    description: 'Book your hissas this Eid',
  },
  {
    label: 'My Hissa Bookings',
    icon: BookOpen,
    path: '/dashboard/user/qurbani-bookings',
    description: 'Track your bookings',
  },
  {
    label: 'Qurbani Skin Pickup',
    icon: Scissors,
    path: '/dashboard/user/qurbani-skin-pickup',
    description: 'Free pickup of your qurbani animal skin',
  },
  {
    label: 'Fitrana',
    icon: HandCoins,
    path: '/dashboard/user/fitrana',
    description: 'Calculate and pay sadaqat al-fitr',
  },
];

// Qurbani module items always shown to admin
const qurbaniAdminItems = [
  {
    label: 'Qurbani Listings',
    icon: ListChecks,
    path: '/dashboard/admin/qurbani-listings',
    description: 'Manage animal listings',
  },
  {
    label: 'Qurbani Bookings',
    icon: ClipboardList,
    path: '/dashboard/admin/qurbani-bookings',
    description: 'Review hissa bookings',
  },
  {
    label: 'Skin Pickups',
    icon: Scissors,
    path: '/dashboard/admin/qurbani-skin-pickups',
    description: 'Schedule pickup requests',
  },
  {
    label: 'Fitrana',
    icon: HandCoins,
    path: '/dashboard/admin/fitrana',
    description: 'Review fitrana submissions',
  },
  {
    label: 'Qurbani Settings',
    icon: Settings,
    path: '/dashboard/admin/qurbani-settings',
    description: 'Visibility & bank details',
  },
];

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
    {
      label: 'Zakat',
      icon: Coins,
      path: '/dashboard/user/zakat-pay',
      description: 'Calculate and pay zakat',
    },
    {
      label: 'Sadqa / Donation',
      icon: Heart,
      path: '/dashboard/user/sadqa',
      description: 'Give a general donation',
    },
    {
      label: 'Disaster Relief',
      icon: LifeBuoy,
      path: '/dashboard/user/disaster-relief',
      description: 'Support flood, earthquake & shelter',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
      description: 'Profile, password, account',
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
    {
      label: 'Apply for Zakat',
      icon: Coins,
      path: '/dashboard/user/zakat-apply',
      description: 'Request zakat assistance',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
      description: 'Profile, password, account',
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
    {
      label: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
      description: 'Profile, password, account',
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
    {
      label: 'Zakat Payments',
      icon: Coins,
      path: '/dashboard/admin/zakat-payments',
      description: 'Confirm donor zakat',
    },
    {
      label: 'Zakat Applications',
      icon: Coins,
      path: '/dashboard/admin/zakat-applications',
      description: 'Review beneficiary requests',
    },
    {
      label: 'Sadqa Donations',
      icon: Heart,
      path: '/dashboard/admin/sadqa',
      description: 'Confirm general donations',
    },
    {
      label: 'Disaster Relief',
      icon: LifeBuoy,
      path: '/dashboard/admin/disaster-relief',
      description: 'Confirm campaign donations',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
      description: 'Profile, password, account',
    },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const moduleEnabled = useQurbaniModuleStore((s) => s.moduleEnabled);
  const fetchFlag = useQurbaniModuleStore((s) => s.fetchFlag);

  // Fetch the qurbani module flag once on mount
  useEffect(() => {
    fetchFlag();
  }, [fetchFlag]);

  const currentMenuItems = useMemo(() => {
    const role = user?.userType;
    const base = menuItems[role] || [];
    if (!role) return base;

    if (role === 'ADMIN') {
      // Admins always see qurbani admin menu regardless of flag
      return [...base, ...qurbaniAdminItems];
    }

    // DONOR / BENEFICIARY / VOLUNTEER — only when flag is true
    if (moduleEnabled === true) {
      // Keep Dashboard as the first entry, then prepend qurbani items
      const [dashboard, ...rest] = base;
      return dashboard
        ? [dashboard, ...qurbaniUserItems, ...rest]
        : [...qurbaniUserItems, ...base];
    }

    return base;
  }, [user?.userType, moduleEnabled]);

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
            aria-label="Close navigation menu"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
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
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-start gap-3 px-4 py-2.5 rounded-lg transition-colors group cursor-pointer',
                    active
                      ? 'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary-600"
                    />
                  )}
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
