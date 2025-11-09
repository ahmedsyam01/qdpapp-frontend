'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppSettings } from '@/hooks/useAppSettings';

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useAppSettings();

  const leftNavItems = [
    {
      href: '/home',
      label: 'الرئيسية',
      icon: '/images/bottom-nav/home.png',
    },
    {
      href: '/properties',
      label: 'الوحدات',
      icon: '/images/bottom-nav/building-4.png',
    },
  ];

  const rightNavItems = [
    {
      href: '/appointments',
      label: 'مواعيدي',
      icon: '/images/bottom-nav/my-appointments.png',
    },
    {
      href: '/profile',
      label: 'حسابي',
      icon: '/images/bottom-nav/profile.png',
    },
  ];

  return (
    <>
      {/* Center floating add button - controlled by settings */}
      {settings.showBottomNavAd && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => router.push('/add-property')}
            className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
            aria-label="إضافة إعلان"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
        {/* Bottom nav with curved cutout in the middle */}
        <div className="relative h-24" style={{ filter: 'drop-shadow(0 -2px 8px rgba(0, 0, 0, 0.1))' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 375 96"
            preserveAspectRatio="none"
            fill="white"
          >
            <path d="M 0,16
                     Q 0,0 16,0
                     L 135,0
                     Q 145,0 150,10
                     Q 162,30 187.5,30
                     Q 213,30 225,10
                     Q 230,0 240,0
                     L 359,0
                     Q 375,0 375,16
                     L 375,96
                     L 0,96
                     Z"
            />
          </svg>

          <div className="relative flex justify-between items-end h-20 max-w-md mx-auto px-6 pt-2">
            {/* Left navigation items */}
            <div className="flex gap-6 pb-2">
              {leftNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center min-w-[60px] transition-opacity"
                  >
                    <div className={`w-6 h-6 mb-1 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={24}
                        height={24}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className={`text-[10px] ${isActive ? 'text-black opacity-100' : 'text-gray-500 opacity-60'}`} dir="rtl">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right navigation items */}
            <div className="flex gap-6 pb-2">
              {rightNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center min-w-[60px] transition-opacity"
                  >
                    <div className={`w-6 h-6 mb-1 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={24}
                        height={24}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className={`text-[10px] ${isActive ? 'text-black opacity-100' : 'text-gray-500 opacity-60'}`} dir="rtl">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Home indicator line for iOS-style design */}
          <div className="relative flex justify-center pb-2">
            <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </nav>
    </>
  );
}
