'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

/**
 * Add Property - Step 3
 * Design Reference: Add Adv-3.png
 *
 * Features:
 * - Ad Duration Selection (فترة ظهور الإعلان): من/إلى dates
 * - Cost Breakdown:
 *   - Property Evaluation Fee (تكلفة تقييم العقار): 20 QR
 *   - Ad Display Fee (تكلفة مدة ظهور الاعلان): 20 QR
 *   - Total Cost (إجمالي التكلفة): 420 QR
 * - Payment Method Selection:
 *   - Mastercard (ماستر كارد)
 *   - Apple Pay (ابل باي)
 *   - Google Pay (جوجل باي)
 *   - Visa (فيزا)
 *   - PayPal (باي بال)
 */

export default function AddPropertyStep3() {
  const router = useRouter();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mastercard');

  const evaluationFee = 20;
  const displayFee = 400;
  const totalCost = evaluationFee + displayFee;

  useEffect(() => {
    // Check if previous steps data exists
    const step1Data = sessionStorage.getItem('addPropertyStep1');
    const step2Data = sessionStorage.getItem('addPropertyStep2');

    if (!step1Data || !step2Data) {
      toast.error('الرجاء إكمال الخطوات السابقة');
      router.push('/add-property/step-1');
      return;
    }

    // Set default dates (30 days from now)
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(thirtyDaysLater.toISOString().split('T')[0]);
  }, [router]);

  const handleCompletePayment = async () => {
    if (!startDate || !endDate) {
      toast.error('الرجاء اختيار تواريخ الإعلان');
      return;
    }

    try {
      // Get all form data from sessionStorage
      const step1Data = JSON.parse(sessionStorage.getItem('addPropertyStep1') || '{}');
      const step2Data = JSON.parse(sessionStorage.getItem('addPropertyStep2') || '{}');

      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('الرجاء تسجيل الدخول أولاً');
        router.push('/auth/login');
        return;
      }

      // Create property in backend with ALL collected data
      const propertyData = {
        title: step1Data.title,
        description: step1Data.description,
        propertyType: step1Data.propertyType,
        category: step1Data.category,
        price: step1Data.price,
        currency: 'QAR',
        specifications: {
          bedrooms: step2Data.rooms,
          bathrooms: step2Data.bathrooms,
          livingRooms: step2Data.livingRooms,
          areaSqm: parseFloat(step2Data.propertyArea),
          parkingSpaces: step2Data.parkingSpaces,
          floorNumber: step2Data.floorNumber,
          totalFloors: step2Data.totalFloors,
        },
        propertyCondition: step2Data.propertyCondition,
        facade: step2Data.facade,
        location: {
          address: step2Data.address,
          city: step1Data.city,
          area: step1Data.city,
          landmark: step2Data.landmark || undefined,
          coordinates: {
            type: 'Point',
            coordinates: [51.5074, 25.2854], // Default Doha coordinates
          },
        },
        amenities: [],
      };

      const response = await fetch('http://localhost:3001/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.message || 'فشل في إنشاء العقار');
      }

      const property = await response.json();

      // Calculate ad duration based on date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Map days to duration enum
      let adDuration: '7_days' | '15_days' | '30_days' | '90_days' = '30_days';
      if (daysDiff <= 7) adDuration = '7_days';
      else if (daysDiff <= 15) adDuration = '15_days';
      else if (daysDiff <= 30) adDuration = '30_days';
      else adDuration = '90_days';

      // Create listing for the property
      const listingResponse = await fetch('http://localhost:3001/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: property._id,
          adDuration: adDuration,
          evaluationFee: evaluationFee,
          displayFee: displayFee,
          totalCost: totalCost,
        }),
      });

      if (!listingResponse.ok) {
        const errorData = await listingResponse.json();
        console.error('Listing creation error:', errorData);
        throw new Error(errorData.message || 'فشل في إنشاء قائمة الإعلان');
      }

      const listing = await listingResponse.json();

      // Store listing data for payment
      const listingData = {
        propertyId: property._id,
        listingId: listing._id,
        adDuration: {
          startDate,
          endDate,
        },
        evaluationFee,
        displayFee,
        totalCost,
        paymentMethod,
      };

      sessionStorage.setItem('pendingListing', JSON.stringify(listingData));

      // Navigate to checkout page to process payment
      toast.success('جاري الانتقال إلى صفحة الدفع...');

      setTimeout(() => {
        router.push(`/add-property/checkout?listingId=${listing._id}&amount=${totalCost}`);
      }, 500);

    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error creating property:', error);
      toast.error(err.message || 'حدث خطأ أثناء إنشاء الإعلان');
    }
  };

  const paymentMethods = [
    { id: 'mastercard', name: 'ماستر كارد', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
    { id: 'apple_pay', name: 'ابل باي', logo: '🍎' },
    { id: 'google_pay', name: 'جوجل باي', logo: 'G' },
    { id: 'visa', name: 'فيزا', logo: 'VISA' },
    { id: 'paypal', name: 'باي بال', logo: 'PayPal' },
  ];

  return (
    <div className="min-h-screen bg-white pb-32" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-bold text-gray-900">
            اضافة اعلان
          </h1>

          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Progress Indicator - Step 3 (All completed) */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-2">
            {/* Step 3 - Active */}
            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="w-20 h-0.5 bg-black"></div>

            {/* Step 2 - Completed */}
            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="w-20 h-0.5 bg-black"></div>

            {/* Step 1 - Completed */}
            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500">فترة ظهور الإعلان</p>
        </div>

        {/* Ad Duration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-4 text-right">
            فترة ظهور الإعلان
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 text-right">إلى</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 text-right">من</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-base mb-4 text-right">تكلفة الإعلان</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{evaluationFee} ر.ق</span>
              <span className="text-gray-900">تكلفة تقييم العقار</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{displayFee} ر.ق</span>
              <span className="text-gray-900">تكلفة مدة ظهور الاعلان</span>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between font-bold text-base">
                <span>{totalCost} ر.ق</span>
                <span>إجمالي التكلفة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-4 text-right">
            اختر طريقة الدفع
          </label>

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === method.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === method.id
                      ? 'border-black'
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === method.id && (
                      <div className="w-3 h-3 rounded-full bg-black"></div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{method.name}</span>
                </div>

                <div className="text-2xl">
                  {method.id === 'mastercard' && (
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-red-500"></div>
                      <div className="w-8 h-8 rounded-full bg-orange-500 -ml-4"></div>
                    </div>
                  )}
                  {method.id === 'visa' && <span className="font-bold text-blue-700">{method.logo}</span>}
                  {method.id !== 'mastercard' && method.id !== 'visa' && method.logo}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
        <button
          onClick={handleCompletePayment}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 transition-colors duration-200"
          dir="rtl"
        >
          إتمام الدفع
        </button>

        {/* Home indicator */}
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-32 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
