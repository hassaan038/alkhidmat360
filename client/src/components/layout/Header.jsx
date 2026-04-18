import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { LogOut, User, ChevronDown, Menu, Settings as SettingsIcon, ShieldCheck, HandHeart, Heart, HandCoins } from 'lucide-react';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.jpg';

const roleMeta = {
  ADMIN: { label: 'Admin', icon: ShieldCheck, chip: 'bg-primary-600 text-white', avatar: 'bg-primary-700 text-white' },
  DONOR: { label: 'Donor', icon: Heart, chip: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200', avatar: 'bg-primary-100 text-primary-700' },
  BENEFICIARY: { label: 'Beneficiary', icon: HandHeart, chip: 'bg-success-light text-success-dark ring-1 ring-success/30', avatar: 'bg-success-light text-success-dark' },
  VOLUNTEER: { label: 'Volunteer', icon: HandCoins, chip: 'bg-warning-light text-warning-dark ring-1 ring-warning/30', avatar: 'bg-warning-light text-warning-dark' },
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

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = roleMeta[user?.userType] || roleMeta.DONOR;
  const RoleIcon = role.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onMenuClick}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-3 min-w-0 cursor-pointer">
              <img
                src={logo}
                alt=""
                className="h-9 w-9 flex-shrink-0 rounded-lg object-cover ring-1 ring-gray-200 shadow-sm"
              />
              <div className="hidden sm:block min-w-0">
                <h1 className="text-[15px] font-bold text-gray-900 leading-none">Alkhidmat 360</h1>
                <p className="text-[11px] text-gray-500 mt-1">Social Welfare Platform</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <span
                className={cn(
                  'hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium',
                  role.chip
                )}
              >
                <RoleIcon className="h-3 w-3" />
                {role.label}
              </span>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Open user menu"
                aria-expanded={dropdownOpen}
                className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                    role.avatar
                  )}
                >
                  {user?.fullName ? initials(user.fullName) : <User className="h-4 w-4" />}
                </span>
                <span className="hidden md:inline-block max-w-[140px] truncate text-sm font-medium text-gray-800">
                  {user?.fullName}
                </span>
                <ChevronDown
                  className={cn('hidden md:block w-4 h-4 text-gray-400 transition-transform', dropdownOpen && 'rotate-180')}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-large border border-gray-200 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
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
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <span className={cn('inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-full text-[11px] font-medium', role.chip)}>
                      <RoleIcon className="h-3 w-3" />
                      {role.label}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <SettingsIcon className="h-4 w-4 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-gray-400" />
                      <span>Sign out</span>
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
