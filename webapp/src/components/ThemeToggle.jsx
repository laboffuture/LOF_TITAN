import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'lof-theme';

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme, animate) {
  const root = document.documentElement;
  if (animate) {
    // Crossfade colours for 350ms (see .theme-switching in index.css).
    root.classList.add('theme-switching');
    window.setTimeout(() => root.classList.remove('theme-switching'), 400);
  }
  root.setAttribute('data-theme', theme);
}

/**
 * Light / dark switch. The first paint is set by the script in index.html; this
 * keeps it in sync, saves an explicit choice under "lof-theme", and follows the
 * system setting until the user picks one.
 */
export function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || readStored() || systemTheme()
  );

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;
    const onChange = () => {
      if (readStored()) return;
      const next = media.matches ? 'dark' : 'light';
      applyTheme(next, true);
      setTheme(next);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked: the theme still applies for this visit.
    }
    setTheme(next);
  };

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className={`lof-icon-btn inline-flex items-center justify-center w-[38px] h-[38px] shrink-0 group ${className}`}
    >
      <span className="transition-transform duration-500 ease-expo group-active:-rotate-[30deg]">
        {theme === 'dark' ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
      </span>
    </button>
  );
}
