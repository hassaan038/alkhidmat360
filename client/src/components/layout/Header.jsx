import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
  LogOut, User, ChevronDown, Menu, Settings as SettingsIcon,
  ShieldCheck, HandHeart, Heart, HandCoins, Search,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.jpg';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageToggle from '../ui/LanguageToggle';
import { useTranslation } from 'react-i18next';

const roleMeta = {
  ADMIN: {
    labelKey: 'roles.ADMIN', icon: ShieldCheck,
    chip: 'bg-primary-600 text-white',
    avatar: 'bg-primary-700 text-white',
  },
  DONOR: {
    labelKey: 'roles.DONOR', icon: Heart,
    chip: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200 dark:bg-primary-900/30 dark:text-primary-200 dark:ring-primary-800',
    avatar: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200',
  },
  BENEFICIARY: {
    labelKey: 'roles.BENEFICIARY', icon: HandHeart,
    chip: 'bg-success-light text-success-dark ring-1 ring-success/30 dark:bg-success/20 dark:text-success-light dark:ring-success/30',
    avatar: 'bg-success-light text-success-dark dark:bg-success/20 dark:text-success-light',
  },
  VOLUNTEER: {
    labelKey: 'roles.VOLUNTEER', icon: HandCoins,
    chip: 'bg-warning-light text-warning-dark ring-1 ring-warning/30 dark:bg-warning/20 dark:text-warning-light dark:ring-warning/30',
    avatar: 'bg-warning-light text-warning-dark dark:bg-warning/20 dark:text-warning-light',
  },
};

function initials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMac(/Mac|iPad|iPhone|iPod/.test(navigator.platform));
    }
  }, []);
  return isMac;
}

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const isMac = useIsMac();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    const dashboardPath = user?.userType === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user';
    navigate(`${dashboardPath}?q=${encodeURIComponent(q)}`);
  };

  const role = roleMeta[user?.userType] || roleMeta.DONOR;
  const RoleIcon = role.icon;
  const roleLabel = t(role.labelKey);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: menu + logo */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onMenuClick}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-3 min-w-0 cursor-pointer">
              <img
                src={logo}
                alt=""
                className="h-9 w-9 flex-shrink-0 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm"
              />
              <div className="hidden sm:block min-w-0">
                <h1 className="text-[15px] font-bold text-gray-900 dark:text-gray-50 leading-none">Alkhidmat 360</h1>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{t('header.tagline')}</p>
              </div>
            </Link>
          </div>

          {/* Middle: search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md"
            role="search"
          >
            <label htmlFor="header-search" className="sr-only">
              {t('common.search')}
            </label>
            <div className="relative w-full group">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400" />
              <input
                id="header-search"
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                placeholder={t('header.searchPlaceholder')}
                className="w-full h-9 pl-9 pr-20 rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-primary-500 dark:focus:bg-gray-900"
              />
              <kbd
                aria-hidden
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono shadow-sm border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                {isMac ? '⌘K' : 'Ctrl K'}
              </kbd>
            </div>
          </form>

          {/* Right: role + user menu */}
          <div className="flex items-center gap-2">
            {/* Mobile search button */}
            <button
              onClick={() => searchInputRef.current?.focus()}
              aria-label={t('common.search')}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            <ThemeToggle />
            <LanguageToggle />

            {user && (
              <span
                className={cn(
                  'hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium',
                  role.chip
                )}
              >
                <RoleIcon className="h-3 w-3" />
                {roleLabel}
              </span>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Open user menu"
                aria-expanded={dropdownOpen}
                className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                    role.avatar
                  )}
                >
                  {user?.fullName ? initials(user.fullName) : <User className="h-4 w-4" />}
                </span>
                <span className="hidden md:inline-block max-w-[140px] truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                  {user?.fullName}
                </span>
                <ChevronDown
                  className={cn('hidden md:block w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform', dropdownOpen && 'rotate-180')}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-large border border-gray-200 dark:border-gray-800 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold',
                          role.avatar
                        )}
                      >
                        {user?.fullName ? initials(user.fullName) : <User className="h-5 w-5" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <span className={cn('inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-full text-[11px] font-medium', role.chip)}>
                      <RoleIcon className="h-3 w-3" />
                      {roleLabel}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <SettingsIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span>{t('header.settings')}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span>{t('header.signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
