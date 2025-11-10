'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePropertyDetail } from '@/hooks/useProperties';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { data: property, isLoading } = usePropertyDetail(propertyId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [hasExistingBooking, setHasExistingBooking] = useState(false);
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [checkingBooking, setCheckingBooking] = useState(true);

  // Check if user already has an active booking for this property
  useEffect(() => {
    const checkExistingBooking = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        console.log('Checking for existing booking...', { propertyId, hasToken: !!token });

        if (!token || !propertyId) {
          console.log('No token or propertyId, skipping check');
          setCheckingBooking(false);
          return;
        }

        const url = `${API_BASE_URL}/user/bookings/check/${propertyId}`;
        console.log('Fetching:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Booking check response:', data);

          if (data.hasBooking && data.booking) {
            console.log('Found existing booking!');
            setHasExistingBooking(true);
            setExistingBooking(data.booking);
          } else {
            console.log('No existing booking found');
          }
        } else {
          console.error('Response not OK:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Error checking existing booking:', error);
      } finally {
        setCheckingBooking(false);
      }
    };

    checkExistingBooking();
  }, [propertyId]);

  if (isLoading || checkingBooking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">العقار غير موجود</h2>
          <button
            onClick={() => router.back()}
            className="text-blue-500 underline"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const coverImage = property.images?.find((img: any) => img.isCover) || property.images?.[0];
  const nearbyServices = property.nearbyServices || [];

  return (
    <div className="min-h-screen bg-white pb-48" dir="rtl">
      {/* Property Image */}
      <div className="relative h-64">
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">لا توجد صورة</span>
          </div>
        )}

        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 px-4 py-4 bg-gradient-to-b from-black/30 to-transparent">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <h1 className="text-white font-semibold text-lg">تفاصيل الوحدة</h1>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Badges: QDP and Availability */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg">
            {property.isQDP ? 'QDP' : 'خارجي'}
          </span>

          {/* Availability Badge */}
          {property.availableFor?.rent && property.availableFor?.sale ? (
            <span className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-green-500 text-white">
              للإيجار والبيع
            </span>
          ) : property.availableFor?.rent ? (
            <span className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white">
              للإيجار
            </span>
          ) : property.availableFor?.sale ? (
            <span className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white">
              للبيع
            </span>
          ) : (
            // Fallback to old category field
            <span className={`px-4 py-2 text-sm font-medium rounded-lg text-white ${
              property.category === 'rent' ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {property.category === 'rent' ? 'للإيجار' : 'للبيع'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Title and Location */}
        <h2 className="text-2xl font-bold mb-2">{property.title}</h2>
        <div className="flex items-center gap-2 text-gray-600 mb-6">
          <svg className="w-5 h-5 text-success-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>{property.location.city}، {property.location.area}</span>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H5v-5h5v5zm0-7H5V5h5v5zm7 7h-5v-5h5v5zm0-7h-5V5h5v5z"/>
              </svg>
            </div>
            <span className="text-sm text-gray-600">{property.specifications.areaSqm} متر</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/>
              </svg>
            </div>
            <span className="text-sm text-gray-600">{property.specifications.parking || 0} غرف</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 2c-.55 0-1 .45-1 1v.29c-1.42.11-3 .48-3 1.71v1.54c-.15.12-.27.29-.29.46h-.03c-.17 0-.33.08-.43.2s-.15.29-.12.45l.74 3.45c.01.04.02.09.03.13.41 1.37 1.42 2.44 2.73 2.82L7.5 19v1h1v-1h8v1h1v-1h-1.38l-.08-5.96c1.31-.38 2.32-1.45 2.73-2.82.01-.04.02-.09.03-.13l.74-3.45c.03-.16-.02-.33-.12-.45s-.26-.2-.43-.2h-.03c-.02-.17-.14-.34-.29-.46V5c0-1.23-1.58-1.6-3-1.71V3c0-.55-.45-1-1-1H9zm-1 5h9V6h-9v1z"/>
              </svg>
            </div>
            <span className="text-sm text-gray-600">{property.specifications.bathrooms} حمام</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
              </svg>
            </div>
            <span className="text-sm text-gray-600">1 مطبخ</span>
          </div>
        </div>

        {/* Nearby Services */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4">الخدمات القريبة</h3>

          {nearbyServices.length > 0 ? (
            <div className="space-y-3">
              {nearbyServices.map((service: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{service.name}</span>
                  <svg className="w-5 h-5 text-success-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {['مطار', 'مركز رياضي', 'مستشفى', 'مول تجاري', 'ملعب', 'حديقة', 'مدرسة'].map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{service}</span>
                  <svg className="w-5 h-5 text-success-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Placeholder */}
        <div className="mb-6">
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <p className="text-gray-500 text-sm">موقع العقار</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-lg mb-3">السعر</h3>

          {property.availableFor?.rent && property.availableFor?.sale ? (
            // Both rent and sale available
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">سعر الإيجار</span>
                <div className="text-left">
                  <p className="text-2xl font-bold text-blue-600">
                    {(property.availableFor.rentPrice || property.rentalPrice)?.toLocaleString()} ر.ق
                  </p>
                  <span className="text-sm text-gray-500">/ شهر</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">سعر البيع</span>
                <p className="text-2xl font-bold text-green-600">
                  {(property.availableFor.salePrice || property.salePrice)?.toLocaleString()} ر.ق
                </p>
              </div>
              {property.availableFor.insuranceDeposit && (
                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                  <span className="text-gray-600 text-sm">التأمين</span>
                  <p className="text-lg font-semibold text-gray-700">
                    {property.availableFor.insuranceDeposit.toLocaleString()} ر.ق
                  </p>
                </div>
              )}
            </div>
          ) : property.availableFor?.rent ? (
            // Rent only
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الإيجار الشهري</span>
                <div className="text-left">
                  <p className="text-2xl font-bold">
                    {(property.availableFor.rentPrice || property.rentalPrice)?.toLocaleString()} ر.ق
                  </p>
                  <span className="text-sm text-gray-500">/ شهر</span>
                </div>
              </div>
              {property.availableFor.insuranceDeposit && (
                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                  <span className="text-gray-600 text-sm">التأمين</span>
                  <p className="text-lg font-semibold text-gray-700">
                    {property.availableFor.insuranceDeposit.toLocaleString()} ر.ق
                  </p>
                </div>
              )}
              {property.availableFor.contractDuration && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 text-sm">مدة العقد</span>
                  <p className="text-lg font-semibold text-gray-700">
                    {property.availableFor.contractDuration} شهر
                  </p>
                </div>
              )}
            </div>
          ) : property.availableFor?.sale ? (
            // Sale only
            <div className="flex items-center justify-between">
              <span className="text-gray-600">السعر الكامل</span>
              <p className="text-2xl font-bold">
                {(property.availableFor.salePrice || property.salePrice)?.toLocaleString()} ر.ق
              </p>
            </div>
          ) : (
            // Fallback to old format
            <div className="space-y-3">
              {property.rentalPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">سعر الايجار</span>
                  <div className="text-left">
                    <p className="text-2xl font-bold">
                      {property.rentalPrice.toLocaleString()} ر.ق
                    </p>
                    <span className="text-sm text-gray-500">/ شهر</span>
                  </div>
                </div>
              )}
              {property.salePrice && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">سعر البيع</span>
                  <p className="text-2xl font-bold">
                    {property.salePrice.toLocaleString()} ر.ق
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Property Transfer Section - Only for rent properties */}
        {property.availableFor?.rent && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 mb-6 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">مستأجر حالي؟</h4>
                <p className="text-sm text-gray-600 mb-3">
                  إذا كنت مستأجراً لعقار آخر وترغب في الانتقال إلى هذا العقار، يمكنك تقديم طلب نقل
                </p>
                <button
                  onClick={() => router.push(`/property/${propertyId}/transfer-request`)}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors text-sm"
                >
                  تقديم طلب نقل عقار
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        {hasExistingBooking ? (
          /* Show message when user already has a booking */
          <div className="max-w-md mx-auto" dir="rtl">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">لديك حجز نشط بالفعل</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    لديك حجز نشط لهذا العقار. لا يمكنك حجز نفس العقار مرتين.
                  </p>
                  <button
                    onClick={() => router.push(`/my-bookings/${existingBooking._id}`)}
                    className="w-full py-2.5 px-4 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors text-sm"
                  >
                    عرض تفاصيل الحجز
                  </button>
                </div>
              </div>
            </div>

            {/* Still allow viewing requests */}
            <button
              onClick={() => router.push(`/property/${propertyId}/viewing`)}
              className="w-full mt-3 py-3 px-6 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              طلب معاينة
            </button>
          </div>
        ) : (
          /* Show normal booking buttons when no existing booking */
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              onClick={() => router.push(`/property/${propertyId}/viewing`)}
              className="py-3 px-6 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              طلب معاينة
            </button>
            <button
              onClick={() => {
                // If property available for both, show modal to choose
                if (property?.availableFor?.rent && property?.availableFor?.sale) {
                  setShowBookingModal(true);
                } else if (property?.availableFor?.rent) {
                  router.push(`/property/${propertyId}/booking?type=rent`);
                } else if (property?.availableFor?.sale) {
                  router.push(`/property/${propertyId}/booking?type=sale`);
                } else {
                  // Fallback to old category
                  router.push(`/property/${propertyId}/booking`);
                }
              }}
              className="py-3 px-6 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              حجز الوحدة
            </button>
          </div>
        )}
      </div>

      {/* Booking Type Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <h3 className="text-xl font-bold mb-4 text-center">اختر نوع الحجز</h3>
            <p className="text-gray-600 text-center mb-6">هذا العقار متاح للإيجار والبيع</p>

            <div className="space-y-3">
              {/* Rent Option */}
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  router.push(`/property/${propertyId}/booking?type=rent`);
                }}
                className="w-full py-4 px-6 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">إيجار شهري</span>
                  <span className="text-xl font-bold">
                    {property?.availableFor?.rentPrice?.toLocaleString()} ر.ق/شهر
                  </span>
                </div>
              </button>

              {/* Sale Option */}
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  router.push(`/property/${propertyId}/booking?type=sale`);
                }}
                className="w-full py-4 px-6 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">شراء كامل</span>
                  <span className="text-xl font-bold">
                    {property?.availableFor?.salePrice?.toLocaleString()} ر.ق
                  </span>
                </div>
              </button>

              {/* Cancel */}
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-full py-3 px-6 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
