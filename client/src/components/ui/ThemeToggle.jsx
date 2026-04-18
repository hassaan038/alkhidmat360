import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { cn } from '../../lib/utils';

export default function ThemeToggle({ className }) {
  const resolved = useThemeStore((s) => s.resolved);
  const toggle = useThemeStore((s) => s.toggle);
  const isDark = resolved === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors cursor-pointer',
        'hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
        className
      )}
    >
      <Sun className={cn('absolute h-4 w-4 transition-all', isDark ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0')} />
      <Moon className={cn('absolute h-4 w-4 transition-all', isDark ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-90')} />
    </button>
  );
}
