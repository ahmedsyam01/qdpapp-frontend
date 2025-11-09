'use client';

import { usePathname } from 'next/navigation';
import { BottomNavigation } from './BottomNavigation';

export function BottomNavWrapper() {
  const pathname = usePathname();

  // Hide bottom nav on auth, splash, and add-property pages
  const hideBottomNav =
    pathname === '/' || // Root splash
    pathname?.startsWith('/splash') || // All splash pages
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/phone-verification') ||
    pathname?.startsWith('/verify-otp') ||
    pathname?.startsWith('/add-property'); // All add property wizard pages

  if (hideBottomNav) {
    return null;
  }

  return <BottomNavigation />;
}
