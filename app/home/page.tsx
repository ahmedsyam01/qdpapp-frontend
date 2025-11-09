'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { ApplianceCard } from '@/components/ui/ApplianceCard';
import { ApplianceCardSkeleton } from '@/components/ui/ApplianceCardSkeleton';
import { FadeIn } from '@/components/ui/FadeIn';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useNotifications } from '@/hooks/useNotifications';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { API_BASE_URL } from '@/lib/config';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { unreadCount } = useNotifications();
  const { data, isLoading } = useQuery({
    queryKey: ['properties', { limit: 10 }],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/properties?limit=10`);
      return response.json();
    },
  });

  const { data: appliancesData, isLoading: isLoadingAppliances } = useQuery({
    queryKey: ['appliances', { limit: 5 }],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/appliances`);
      return response.json();
    },
  });

  const [userLocation, setUserLocation] = useState<string>('الدوحة، قطر');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get user's geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocoding would go here - for now use default
            // In production, you'd call a geocoding API with position.coords
            setUserLocation('الدوحة، قطر');
          } catch (error) {
            console.error('Error getting location:', error);
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLoadingLocation(false);
        }
      );
    }
  }, []);

  // Maintenance service categories with larger icons (80x80 container, 48x48 images)
  const maintenanceCategories = [
    { id: 'furniture', label: 'صيانة الأثاث', icon: '/images/home-icons/furniture.png' },
    { id: 'plumbing', label: 'صيانة السباكة', icon: '/images/home-icons/plumbing.png' },
    { id: 'electrical', label: 'صيانة الكهرباء', icon: '/images/home-icons/electrical.png' },
    { id: 'ac', label: 'صيانة التكييف', icon: '/images/home-icons/ac.png' },
  ];

  return (
    <div className="min-h-screen bg-white pb-32" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* QDP Logo - Placeholder */}
          <div className="w-10 h-10 bg-qdp-cream rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">QDP</span>
          </div>
          <div>
            <p className="text-xs text-gray-500">أهلاً بك{user?.fullName ? ` ${user.fullName.split(' ')[0]}` : ''} !</p>
            <button
              onClick={() => {
                // In production, this would open location picker modal
                console.log('Open location picker');
              }}
              className="flex items-center gap-1 font-medium text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {isLoadingLocation ? 'جاري التحميل...' : userLocation}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/notifications')}
            className="relative"
            aria-label="الاشعارات"
          >
            <svg
              className={`w-6 h-6 transition-transform ${unreadCount > 0 ? 'animate-bell-shake' : ''}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-badge-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button onClick={() => router.push('/profile')}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white">
        <div
          className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 rounded-lg text-right cursor-pointer"
        >
          <button
            onClick={() => router.push('/search')}
            className="flex items-center gap-3 flex-1"
            aria-label="البحث"
          >
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-gray-400 flex-1">البحث</span>
          </button>
          <button
            onClick={() => router.push('/search/filters')}
            className="p-1"
            aria-label="تصفية النتائج"
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Hero Banner - Using actual design reference */}
      <div className="px-4 mb-6">
        <div className="relative h-48 rounded-xl overflow-hidden">
          <Image
            src="/images/hero-banner.png"
            alt="Qatar Dynamic Properties"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">حيث تلتقي الفخامة بالبساطة</h2>
            <p className="text-sm opacity-90">الفخامة والرفاهية والهندسة المعمارية المثالية</p>
          </div>
        </div>
      </div>

      {/* Contract Warning Alert - Only show if user has active contracts */}
      {user && false && ( // Remove false when contract data is available
        <div className="px-4 mb-6">
          <div className="bg-error-500 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/>
            </svg>
            <p className="text-white text-sm flex-1">
              منتهي، تبقى شهر على إنتهاء عقد الايجار
            </p>
          </div>
        </div>
      )}

      {/* Help Section - Always show */}
      <div className="px-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-2">تحتاج مساعدة؟</h3>
          <p className="text-gray-600 text-sm mb-4">
            يمكنك الآن حجز موعد مع وكيل العقارات مباشرة
          </p>
          <button
            onClick={() => router.push('/appointments/new')}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            احجز موعدك
          </button>
        </div>
      </div>

      {/* Maintenance Services */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">اطلب صيانتك</h3>
          <button
            onClick={() => router.push('/services')}
            className="text-sm text-gray-500"
          >
            المزيد
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {maintenanceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => router.push(`/services?category=${category.id}`)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors relative">
                <Image
                  src={category.icon}
                  alt={category.label}
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-center text-gray-700">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Properties */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">وحدات مميزة</h3>
          <button
            onClick={() => router.push('/search')}
            className="text-sm text-gray-500"
          >
            المزيد
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : data?.properties?.length > 0 ? (
          <div className="space-y-4">
            {data.properties.slice(0, 5).map((property: any) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            لا توجد وحدات متاحة حالياً
          </div>
        )}
      </div>

      {/* Appliances for Rent */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">أجهزة للإيجار</h3>
          <button
            onClick={() => router.push('/appliances')}
            className="text-sm text-gray-500"
          >
            المزيد
          </button>
        </div>

        {isLoadingAppliances ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ApplianceCardSkeleton key={i} />
            ))}
          </div>
        ) : appliancesData && appliancesData.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {appliancesData.slice(0, 4).map((appliance: any, index: number) => (
              <FadeIn key={appliance._id} delay={index * 0.05} duration={0.4}>
                <ApplianceCard appliance={appliance} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            لا توجد أجهزة متاحة حالياً
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
