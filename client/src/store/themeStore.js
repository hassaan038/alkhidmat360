import { create } from 'zustand';

const STORAGE_KEY = 'alkhidmat-theme';

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value) {
  try {
    if (value == null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

function systemPrefersDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function apply(theme) {
  const el = document.documentElement;
  if (theme === 'dark') el.classList.add('dark');
  else el.classList.remove('dark');
}

// Compute initial theme: stored override wins, else follow OS.
const initialStored = readStored();
const initialResolved = initialStored || (systemPrefersDark() ? 'dark' : 'light');

const useThemeStore = create((set, get) => ({
  // `override` is what the user explicitly chose ('light' | 'dark' | null = follow OS)
  override: initialStored,
  // `resolved` is what's actually applied right now.
  resolved: initialResolved,

  setTheme: (next) => {
    // next: 'light' | 'dark' | null
    writeStored(next);
    const resolved = next || (systemPrefersDark() ? 'dark' : 'light');
    apply(resolved);
    set({ override: next, resolved });
  },

  toggle: () => {
    const { resolved } = get();
    const next = resolved === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));

// Keep in sync with OS changes when the user hasn't picked an explicit theme.
if (typeof window !== 'undefined') {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener?.('change', (e) => {
    const { override } = useThemeStore.getState();
    if (override) return; // user picked something explicit; don't override
    const resolved = e.matches ? 'dark' : 'light';
    apply(resolved);
    useThemeStore.setState({ resolved });
  });
}

export default useThemeStore;
