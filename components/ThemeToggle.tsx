'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        "p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "hover:scale-105 active:scale-95"
      )}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-[var(--foreground)]" />
      ) : (
        <Moon className="h-5 w-5 text-[var(--foreground)]" />
      )}
    </button>
  );
} 