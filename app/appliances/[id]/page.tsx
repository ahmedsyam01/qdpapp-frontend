'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import {
  getApplianceById,
  incrementApplianceView,
  getApplianceTypeLabel,
  getRentalDurationLabel,
} from '@/services/appliancesService';
import { ApplianceDetailsSkeleton } from '@/components/ui/ApplianceDetailsSkeleton';
import { FadeIn } from '@/components/ui/FadeIn';

export default function ApplianceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const applianceId = params.id as string;

  const { data: appliance, isLoading } = useQuery({
    queryKey: ['appliance', applianceId],
    queryFn: () => getApplianceById(applianceId),
  });

  // Increment view count when page loads
  useEffect(() => {
    if (applianceId) {
      incrementApplianceView(applianceId).catch(console.error);
    }
  }, [applianceId]);

  if (isLoading) {
    return <ApplianceDetailsSkeleton />;
  }

  if (!appliance) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">الجهاز غير موجود</h2>
          <p className="text-gray-500 mb-4">لم نتمكن من العثور على الجهاز المطلوب</p>
          <button
            onClick={() => router.back()}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <FadeIn duration={0.3}>
      <div className="min-h-screen bg-white pb-48" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 -mr-2"
            aria-label="رجوع"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold flex-1">تفاصيل الجهاز</h1>
          <button
            className="p-2"
            aria-label="مشاركة"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative h-80 bg-gray-100">
        <Image
          src={appliance.images[0] || '/images/placeholder-appliance.jpg'}
          alt={appliance.nameAr}
          fill
          className="object-cover"
          priority
        />
        {/* Badge */}
        <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
          {getApplianceTypeLabel(appliance.applianceType)}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Title and Brand */}
        <h1 className="text-2xl font-bold mb-2">{appliance.nameAr}</h1>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">العلامة التجارية:</span>
            <span className="font-medium">{appliance.brand}</span>
          </div>
          {appliance.model && (
            <>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">الموديل:</span>
                <span className="font-medium">{appliance.model}</span>
              </div>
            </>
          )}
        </div>

        {/* Color */}
        {appliance.color && (
          <div className="mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">اللون:</span>
              <span className="font-medium">{appliance.color}</span>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <h2 className="font-bold text-lg mb-3">الوصف</h2>
          <p className="text-gray-700 leading-relaxed">{appliance.descriptionAr}</p>
        </div>

        {/* Rental Prices */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-4">أسعار الإيجار</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">شهر</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{appliance.rentalPrices.oneMonth}</span>
                <span className="text-sm text-gray-600">ر.ق</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">6 شهور</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{appliance.rentalPrices.sixMonths}</span>
                <span className="text-sm text-gray-600">ر.ق</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">سنة</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{appliance.rentalPrices.oneYear}</span>
                <span className="text-sm text-gray-600">ر.ق</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 z-50">
        <button
          onClick={() => router.push(`/appliances/${applianceId}/book`)}
          className="w-full bg-black text-white py-4 rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {appliance.isAvailable ? 'احجز الآن' : 'غير متاح'}
        </button>
      </div>
      </div>
    </FadeIn>
  );
}
