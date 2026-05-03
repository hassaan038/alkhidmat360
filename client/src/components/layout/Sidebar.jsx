import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

// `Settings` is imported only so the admin "Qurbani Settings" entry keeps its icon.
// Settings lives in the header user menu; we no longer duplicate it in the sidebar.

// Tone → Tailwind class mapping for active state left-bar + hover tint.
const toneAccent = {
  primary: { bar: 'bg-primary-600', soft: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200', icon: 'text-primary-600 dark:text-primary-300' },
  qurbani: { bar: 'bg-qurbani-600', soft: 'bg-qurbani-50 text-qurbani-700 dark:bg-qurbani-500/15 dark:text-qurbani-200', icon: 'text-qurbani-600 dark:text-qurbani-300' },
  zakat: { bar: 'bg-zakat-600', soft: 'bg-zakat-50 text-zakat-700 dark:bg-zakat-500/15 dark:text-zakat-200', icon: 'text-zakat-600 dark:text-zakat-300' },
  sadqa: { bar: 'bg-sadqa-600', soft: 'bg-sadqa-50 text-sadqa-700 dark:bg-sadqa-500/15 dark:text-sadqa-200', icon: 'text-sadqa-600 dark:text-sadqa-300' },
  disaster: { bar: 'bg-disaster-600', soft: 'bg-disaster-50 text-disaster-700 dark:bg-disaster-500/15 dark:text-disaster-200', icon: 'text-disaster-600 dark:text-disaster-300' },
  ration: { bar: 'bg-ration-600', soft: 'bg-ration-50 text-ration-700 dark:bg-ration-500/15 dark:text-ration-200', icon: 'text-ration-600 dark:text-ration-300' },
  orphan: { bar: 'bg-orphan-600', soft: 'bg-orphan-50 text-orphan-700 dark:bg-orphan-500/15 dark:text-orphan-200', icon: 'text-orphan-600 dark:text-orphan-300' },
  loan: { bar: 'bg-loan-600', soft: 'bg-loan-50 text-loan-700 dark:bg-loan-500/15 dark:text-loan-200', icon: 'text-loan-600 dark:text-loan-300' },
  volunteer: { bar: 'bg-volunteer-600', soft: 'bg-volunteer-50 text-volunteer-700 dark:bg-volunteer-500/15 dark:text-volunteer-200', icon: 'text-volunteer-600 dark:text-volunteer-300' },
  neutral: { bar: 'bg-gray-600', soft: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100', icon: 'text-gray-600 dark:text-gray-300' },
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const { t } = useTranslation();
  const moduleEnabled = useQurbaniModuleStore((s) => s.moduleEnabled);
  const fetchFlag = useQurbaniModuleStore((s) => s.fetchFlag);

  useEffect(() => {
    fetchFlag();
  }, [fetchFlag]);

  const sections = useMemo(() => {
    const role = user?.userType;
    if (!role) return [];

    const qurbaniUserItems = [
      { label: t('sidebar.qurbaniBooking'), icon: Drumstick, path: '/dashboard/user/qurbani-module', tone: 'qurbani' },
      { label: t('sidebar.myHissaBookings'), icon: BookOpen, path: '/dashboard/user/qurbani-bookings', tone: 'qurbani' },
      { label: t('sidebar.skinPickup'), icon: Scissors, path: '/dashboard/user/qurbani-skin-pickup', tone: 'qurbani' },
      { label: t('sidebar.fitrana'), icon: HandCoins, path: '/dashboard/user/fitrana', tone: 'zakat' },
    ];

    const qurbaniAdminItems = [
      { label: t('sidebar.qurbaniListings'), icon: ListChecks, path: '/dashboard/admin/qurbani-listings', tone: 'qurbani' },
      { label: t('sidebar.qurbaniBookings'), icon: ClipboardList, path: '/dashboard/admin/qurbani-bookings', tone: 'qurbani' },
      { label: t('sidebar.skinPickups'), icon: Scissors, path: '/dashboard/admin/qurbani-skin-pickups', tone: 'qurbani' },
      { label: t('sidebar.fitrana'), icon: HandCoins, path: '/dashboard/admin/fitrana', tone: 'zakat' },
      { label: t('sidebar.qurbaniSettings'), icon: Settings, path: '/dashboard/admin/qurbani-settings', tone: 'neutral' },
    ];

    const menuSections = {
      DONOR: [
        {
          heading: null,
          items: [{ label: t('sidebar.dashboard'), icon: LayoutDashboard, path: '/dashboard/user' }],
        },
        {
          heading: t('sidebar.donate'),
          items: [
            { label: t('sidebar.qurbaniDonation'), icon: Heart, path: '/dashboard/user/qurbani', tone: 'qurbani' },
            { label: t('sidebar.rationDonation'), icon: Package, path: '/dashboard/user/ration', tone: 'ration' },
            { label: t('sidebar.orphanSponsorship'), icon: Baby, path: '/dashboard/user/orphan-sponsorship', tone: 'orphan' },
            { label: t('sidebar.skinCollection'), icon: Scissors, path: '/dashboard/user/skin-collection', tone: 'qurbani' },
            { label: t('sidebar.sadqa'), icon: Heart, path: '/dashboard/user/sadqa', tone: 'sadqa' },
            { label: t('sidebar.disasterRelief'), icon: LifeBuoy, path: '/dashboard/user/disaster-relief', tone: 'disaster' },
          ],
        },
        {
          heading: t('sidebar.religious'),
          items: [
            { label: t('sidebar.payZakat'), icon: Coins, path: '/dashboard/user/zakat-pay', tone: 'zakat' },
          ],
        },
      ],
      BENEFICIARY: [
        {
          heading: null,
          items: [{ label: t('sidebar.dashboard'), icon: LayoutDashboard, path: '/dashboard/user' }],
        },
        {
          heading: t('sidebar.applyForSupport'),
          items: [
            { label: t('sidebar.loanApplication'), icon: DollarSign, path: '/dashboard/user/loan', tone: 'loan' },
            { label: t('sidebar.ramadanRation'), icon: Apple, path: '/dashboard/user/ramadan-ration', tone: 'ration' },
            { label: t('sidebar.orphanRegistration'), icon: Baby, path: '/dashboard/user/orphan', tone: 'orphan' },
            { label: t('sidebar.applyForZakat'), icon: Coins, path: '/dashboard/user/zakat-apply', tone: 'zakat' },
          ],
        },
      ],
      VOLUNTEER: [
        {
          heading: null,
          items: [{ label: t('sidebar.dashboard'), icon: LayoutDashboard, path: '/dashboard/user' }],
        },
        {
          heading: t('sidebar.volunteer'),
          items: [
            { label: t('sidebar.registerForTasks'), icon: HandHeart, path: '/dashboard/user/volunteer-task', tone: 'volunteer' },
          ],
        },
      ],
      ADMIN: [
        {
          heading: null,
          items: [{ label: t('sidebar.dashboard'), icon: LayoutDashboard, path: '/dashboard/admin' }],
        },
        {
          heading: t('sidebar.manage'),
          items: [
            { label: t('sidebar.users'), icon: Users, path: '/dashboard/admin/users' },
            { label: t('sidebar.donations'), icon: Heart, path: '/dashboard/admin/donations', tone: 'primary' },
            { label: t('sidebar.applications'), icon: Package, path: '/dashboard/admin/applications', tone: 'loan' },
            { label: t('sidebar.volunteers'), icon: HandHeart, path: '/dashboard/admin/volunteers', tone: 'volunteer' },
          ],
        },
        {
          heading: t('sidebar.religiousAndCampaigns'),
          items: [
            { label: t('sidebar.zakatPayments'), icon: Coins, path: '/dashboard/admin/zakat-payments', tone: 'zakat' },
            { label: t('sidebar.zakatApplications'), icon: Coins, path: '/dashboard/admin/zakat-applications', tone: 'zakat' },
            { label: t('sidebar.sadqaDonations'), icon: Heart, path: '/dashboard/admin/sadqa', tone: 'sadqa' },
            { label: t('sidebar.disasterRelief'), icon: LifeBuoy, path: '/dashboard/admin/disaster-relief', tone: 'disaster' },
          ],
        },
        {
          heading: t('sidebar.adminTools'),
          items: [
            { label: t('sidebar.createAdmin'), icon: UserPlus, path: '/dashboard/admin/create-admin' },
          ],
        },
      ],
    };

    const base = menuSections[role] || [];

    if (role === 'ADMIN') {
      return [
        ...base,
        { heading: t('sidebar.qurbaniModule'), items: qurbaniAdminItems },
      ];
    }

    if (moduleEnabled === true) {
      return [
        ...base,
        { heading: t('sidebar.qurbaniSeasonal'), items: qurbaniUserItems },
      ];
    }
    return base;
  }, [user?.userType, moduleEnabled, t]);

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
          'fixed lg:sticky top-0 left-0 h-screen z-50 border-r',
          'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800',
          'w-72 flex flex-col',
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="lg:hidden flex justify-end p-3">
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3">
          {sections.map((section, idx) => (
            <div key={idx} className={cn(idx > 0 && 'mt-5')}>
              {section.heading && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
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
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
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
                          active ? accent.icon : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 p-4 ring-1 ring-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 dark:ring-primary-800/50">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm dark:bg-gray-900 dark:text-primary-300">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary-900 dark:text-primary-100">{t('sidebar.needHelp')}</p>
                <p className="text-xs text-primary-700/80 dark:text-primary-300/80 leading-relaxed">
                  {t('sidebar.contactSupport')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
