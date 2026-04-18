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
  HelpCircle,
} from 'lucide-react';

// ───────────────────────── Menu definitions ─────────────────────────
// Each item: { label, icon, path, description?, tone? }
// Tone keys map to module accent colors; falls back to primary if omitted.

const qurbaniUserItems = [
  { label: 'Qurbani Booking', icon: Drumstick, path: '/dashboard/user/qurbani-module', tone: 'qurbani' },
  { label: 'My Hissa Bookings', icon: BookOpen, path: '/dashboard/user/qurbani-bookings', tone: 'qurbani' },
  { label: 'Skin Pickup', icon: Scissors, path: '/dashboard/user/qurbani-skin-pickup', tone: 'qurbani' },
  { label: 'Fitrana', icon: HandCoins, path: '/dashboard/user/fitrana', tone: 'zakat' },
];

const qurbaniAdminItems = [
  { label: 'Qurbani Listings', icon: ListChecks, path: '/dashboard/admin/qurbani-listings', tone: 'qurbani' },
  { label: 'Qurbani Bookings', icon: ClipboardList, path: '/dashboard/admin/qurbani-bookings', tone: 'qurbani' },
  { label: 'Skin Pickups', icon: Scissors, path: '/dashboard/admin/qurbani-skin-pickups', tone: 'qurbani' },
  { label: 'Fitrana', icon: HandCoins, path: '/dashboard/admin/fitrana', tone: 'zakat' },
  { label: 'Qurbani Settings', icon: Settings, path: '/dashboard/admin/qurbani-settings', tone: 'neutral' },
];

const menuSections = {
  DONOR: [
    {
      heading: null,
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/user' }],
    },
    {
      heading: 'Donate',
      items: [
        { label: 'Qurbani Donation', icon: Heart, path: '/dashboard/user/qurbani', tone: 'qurbani' },
        { label: 'Ration Donation', icon: Package, path: '/dashboard/user/ration', tone: 'ration' },
        { label: 'Orphan Sponsorship', icon: Baby, path: '/dashboard/user/orphan-sponsorship', tone: 'orphan' },
        { label: 'Skin Collection', icon: Scissors, path: '/dashboard/user/skin-collection', tone: 'qurbani' },
        { label: 'Sadqa / Donation', icon: Heart, path: '/dashboard/user/sadqa', tone: 'sadqa' },
        { label: 'Disaster Relief', icon: LifeBuoy, path: '/dashboard/user/disaster-relief', tone: 'disaster' },
      ],
    },
    {
      heading: 'Religious',
      items: [
        { label: 'Pay Zakat', icon: Coins, path: '/dashboard/user/zakat-pay', tone: 'zakat' },
      ],
    },
  ],
  BENEFICIARY: [
    {
      heading: null,
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/user' }],
    },
    {
      heading: 'Apply for support',
      items: [
        { label: 'Loan Application', icon: DollarSign, path: '/dashboard/user/loan', tone: 'loan' },
        { label: 'Ramadan Ration', icon: Apple, path: '/dashboard/user/ramadan-ration', tone: 'ration' },
        { label: 'Orphan Registration', icon: Baby, path: '/dashboard/user/orphan', tone: 'orphan' },
        { label: 'Apply for Zakat', icon: Coins, path: '/dashboard/user/zakat-apply', tone: 'zakat' },
      ],
    },
  ],
  VOLUNTEER: [
    {
      heading: null,
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/user' }],
    },
    {
      heading: 'Volunteer',
      items: [
        { label: 'Register for tasks', icon: HandHeart, path: '/dashboard/user/volunteer-task', tone: 'volunteer' },
      ],
    },
  ],
  ADMIN: [
    {
      heading: null,
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/admin' }],
    },
    {
      heading: 'Manage',
      items: [
        { label: 'Users', icon: Users, path: '/dashboard/admin/users' },
        { label: 'Donations', icon: Heart, path: '/dashboard/admin/donations', tone: 'primary' },
        { label: 'Applications', icon: Package, path: '/dashboard/admin/applications', tone: 'loan' },
        { label: 'Volunteers', icon: HandHeart, path: '/dashboard/admin/volunteers', tone: 'volunteer' },
      ],
    },
    {
      heading: 'Religious & campaigns',
      items: [
        { label: 'Zakat Payments', icon: Coins, path: '/dashboard/admin/zakat-payments', tone: 'zakat' },
        { label: 'Zakat Applications', icon: Coins, path: '/dashboard/admin/zakat-applications', tone: 'zakat' },
        { label: 'Sadqa Donations', icon: Heart, path: '/dashboard/admin/sadqa', tone: 'sadqa' },
        { label: 'Disaster Relief', icon: LifeBuoy, path: '/dashboard/admin/disaster-relief', tone: 'disaster' },
      ],
    },
    {
      heading: 'Admin tools',
      items: [
        { label: 'Create Admin', icon: UserPlus, path: '/dashboard/admin/create-admin' },
      ],
    },
  ],
};

const commonBottom = [
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

// Tone → Tailwind class mapping for active state left-bar + hover tint.
const toneAccent = {
  primary: { bar: 'bg-primary-600', soft: 'bg-primary-50 text-primary-700', icon: 'text-primary-600' },
  qurbani: { bar: 'bg-qurbani-600', soft: 'bg-qurbani-50 text-qurbani-700', icon: 'text-qurbani-600' },
  zakat: { bar: 'bg-zakat-600', soft: 'bg-zakat-50 text-zakat-700', icon: 'text-zakat-600' },
  sadqa: { bar: 'bg-sadqa-600', soft: 'bg-sadqa-50 text-sadqa-700', icon: 'text-sadqa-600' },
  disaster: { bar: 'bg-disaster-600', soft: 'bg-disaster-50 text-disaster-700', icon: 'text-disaster-600' },
  ration: { bar: 'bg-ration-600', soft: 'bg-ration-50 text-ration-700', icon: 'text-ration-600' },
  orphan: { bar: 'bg-orphan-600', soft: 'bg-orphan-50 text-orphan-700', icon: 'text-orphan-600' },
  loan: { bar: 'bg-loan-600', soft: 'bg-loan-50 text-loan-700', icon: 'text-loan-600' },
  volunteer: { bar: 'bg-volunteer-600', soft: 'bg-volunteer-50 text-volunteer-700', icon: 'text-volunteer-600' },
  neutral: { bar: 'bg-gray-600', soft: 'bg-gray-100 text-gray-900', icon: 'text-gray-600' },
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const moduleEnabled = useQurbaniModuleStore((s) => s.moduleEnabled);
  const fetchFlag = useQurbaniModuleStore((s) => s.fetchFlag);

  useEffect(() => {
    fetchFlag();
  }, [fetchFlag]);

  const sections = useMemo(() => {
    const role = user?.userType;
    const base = menuSections[role] || [];
    if (!role) return base;

    if (role === 'ADMIN') {
      // Admin always has qurbani tools group
      return [
        ...base,
        { heading: 'Qurbani module', items: qurbaniAdminItems },
      ];
    }

    // User-side: only show qurbani nav when the module is enabled
    if (moduleEnabled === true) {
      return [
        ...base,
        { heading: 'Qurbani (seasonal)', items: qurbaniUserItems },
      ];
    }
    return base;
  }, [user?.userType, moduleEnabled]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-50',
          'w-72 flex flex-col',
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="lg:hidden flex justify-end p-3">
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3">
          {sections.map((section, idx) => (
            <div key={idx} className={cn(idx > 0 && 'mt-5')}>
              {section.heading && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {section.heading}
                </p>
              )}
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const accent = toneAccent[item.tone] || toneAccent.primary;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative flex items-center gap-3 pl-3 pr-3 py-2 rounded-lg transition-colors cursor-pointer text-sm',
                        active
                          ? cn(accent.soft, 'font-semibold')
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className={cn('absolute left-0 top-2 bottom-2 w-0.5 rounded-full', accent.bar)}
                        />
                      )}
                      <Icon
                        className={cn(
                          'w-4 h-4 flex-shrink-0',
                          active ? accent.icon : 'text-gray-400 group-hover:text-gray-600'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <nav className="space-y-0.5">
              {commonBottom.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose()}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm',
                      active ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', active ? 'text-primary-600' : 'text-gray-400')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-200 p-3">
          <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 p-4 ring-1 ring-primary-100">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary-900">Need help?</p>
                <p className="text-xs text-primary-700/80 leading-relaxed">
                  Contact our support team for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
