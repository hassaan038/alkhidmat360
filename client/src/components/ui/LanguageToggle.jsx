import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  return (
    <button
      onClick={() => i18n.changeLanguage(isUrdu ? 'en' : 'ur')}
      aria-label={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
      title={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer select-none',
        'border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200',
        'hover:bg-gray-50 dark:hover:bg-gray-700'
      )}
    >
      {isUrdu ? 'EN' : 'اردو'}
    </button>
  );
}
