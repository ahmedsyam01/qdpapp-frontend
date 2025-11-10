'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Settings, Gift, Download, ChevronRight } from 'lucide-react';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { contractService } from '@/services/contractService';
import { useAuthStore } from '@/store/authStore';
import { useAppSettings } from '@/hooks/useAppSettings';
import { API_BASE_URL } from '@/lib/config';

interface UserProfile {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  profilePicture?: string;
}

interface Contract {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    titleAr: string;
    images: Array<{ url: string; isCover: boolean }>;
    location: {
      address: string;
      city: string;
      area: string;
    };
    price: number;
  };
  contractType: 'rent' | 'sale';
  startDate: string;
  endDate?: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'account' | 'units' | 'ads';

interface PropertyListing {
  _id: string;
  title: string;
  titleAr: string;
  price: number;
  propertyType: string;
  listingType: 'rent' | 'sale';
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: {
    city: string;
    area: string;
  };
  images: Array<{ url: string; isCover: boolean }>;
  status: 'draft' | 'pending_approval' | 'active' | 'inactive';
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [myAds, setMyAds] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(false);

  // Get user from auth store
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Get app settings
  const { settings } = useAppSettings();

  // Map auth user to profile user format
  const user: UserProfile | null = authUser ? {
    fullName: authUser.fullName,
    phone: authUser.phone,
    email: authUser.email,
    address: 'الدوحة، قطر', // TODO: Get from user profile API
    profilePicture: authUser.profilePicture,
  } : null;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Load data based on active tab
    if (activeTab === 'units') {
      loadContracts();
    } else if (activeTab === 'ads') {
      loadMyAds();
    }
  }, [activeTab, isAuthenticated, router]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await contractService.getMyContracts();
      setContracts(data);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyAds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/properties/my-listings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMyAds(data);
      }
    } catch (error) {
      console.error('Failed to load my ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAccountTab = () => (
    <div className="space-y-6">
      {/* Name Field */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm text-gray-600 mb-1 block">الاسم</label>
          <p className="text-base font-medium text-gray-900">{user?.fullName}</p>
        </div>
        <button className="p-2">
          <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
        </button>
      </div>

      {/* Phone Field */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm text-gray-600 mb-1 block">رقم الهاتف</label>
          <p className="text-base font-medium text-gray-900 ltr">{user?.phone || '010000000000'}</p>
        </div>
        <button className="p-2">
          <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
        </button>
      </div>

      {/* Email Field */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm text-gray-600 mb-1 block">البريد الإلكتروني</label>
          <p className="text-base font-medium text-gray-900">{user?.email}</p>
        </div>
        <button className="p-2">
          <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
        </button>
      </div>

      {/* Address Field */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm text-gray-600 mb-1 block">العنوان</label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <p className="text-base font-medium text-gray-900">{user?.address}</p>
          </div>
        </div>
        <button className="p-2">
          <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
        </button>
      </div>

      {/* Map Preview */}
      <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          {/* TODO: Add Google Maps integration */}
          <MapPin className="w-8 h-8" />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="pt-6 space-y-3 border-t border-gray-200">
        <button
          onClick={() => router.push('/my-bookings')}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-right">
              <h4 className="font-medium text-gray-900">حجوزاتي</h4>
              <p className="text-sm text-gray-500">عرض جميع حجوزاتي والأقساط</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
        </button>

        <button
          onClick={() => router.push('/favorites')}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="text-right">
              <h4 className="font-medium text-gray-900">المفضلة</h4>
              <p className="text-sm text-gray-500">عقاراتي المفضلة</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
        </button>

        <button
          onClick={() => router.push('/my-transfers')}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="text-right">
              <h4 className="font-medium text-gray-900">طلبات النقل</h4>
              <p className="text-sm text-gray-500">عرض حالة طلبات النقل</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
        </button>
      </div>
    </div>
  );

  const renderUnitsTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      );
    }

    if (contracts.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>لا توجد عقود حتى الآن</p>
        </div>
      );
    }

    // Find the first active or pending_signature contract
    const activeContract = contracts.find(c => c.status === 'active' || c.status === 'pending_signature');
    const contract = activeContract || contracts[0];

    // Check if property data is populated
    if (!contract.propertyId) {
      return (
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-sm mx-auto">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              بيانات العقار غير متوفرة
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              العقد موجود ولكن لم يتم ربطه بعقار بعد. يرجى التواصل مع الدعم.
            </p>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-right">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">رقم العقد</span>
                  <span className="font-medium text-gray-900">{contract.contractNumber || contract._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">نوع العقد</span>
                  <span className="font-medium text-gray-900">
                    {contract.contractType === 'rent' ? 'إيجار' : 'بيع'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">القيمة</span>
                  <span className="font-medium text-gray-900">
                    {contract.amount.toLocaleString('ar-QA')} ريال
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">الحالة</span>
                  <span className="font-medium text-gray-900">
                    {contract.status === 'active' ? 'نشط' :
                     contract.status === 'pending_signature' ? 'بانتظار التوقيع' :
                     contract.status === 'draft' ? 'مسودة' : contract.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Calculate days until contract expiry
    const endDate = contract.endDate ? new Date(contract.endDate) : null;
    const today = new Date();
    const daysUntilExpiry = endDate
      ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : 30;
    const showWarning = daysUntilExpiry <= 30 && contract.contractType === 'rent';

    // Mock payment data (TODO: Get from payments API)
    const paymentsOnTime = 5;
    const totalPayments = 6;

    return (
      <div className="space-y-6">
        {/* Contract Expiry Warning */}
        {showWarning && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-error-500 text-white flex items-center justify-center text-sm flex-shrink-0">
              !
            </div>
            <div className="flex-1">
              <p className="text-sm text-error-500 leading-relaxed">
                منتهي، {daysUntilExpiry} يوم على انتهاء عقد ايجار وحدة{' '}
                <button className="underline font-bold" onClick={() => router.push(`/contracts/${contract._id}/renew`)}>
                  يجدد العقد الان
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Payment Due Section */}
        {contract.contractType === 'rent' && (
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">
              الدفع خلال 15 يوم
            </h3>
            <button
              onClick={() => router.push(`/contracts/${contract._id}/pay`)}
              className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              ادفع الآن
            </button>
          </div>
        )}

        {/* Commitment Reward Section */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Gift className="w-5 h-5 text-gray-900 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">مكافأة الالتزام</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                استفيد بالدفع في موعده بن شهر تحصل على شهر مجاني عند التجديد
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div>
            <p className="text-sm text-gray-700 mb-2">
              سددت {paymentsOnTime} من {totalPayments} دفعات في موعدها
            </p>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
              {[...Array(totalPayments)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-full ${
                    i < paymentsOnTime
                      ? 'bg-gradient-to-r from-green-500 to-green-400'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Unit Details Section */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">تفاصيل الوحدة</h3>

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            {/* Property Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <p className="text-base font-medium">
                {contract.propertyId.titleAr || contract.propertyId.title || 'وحدة رقم 2048'}
              </p>
            </div>

            {/* Contract Details */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">نوع العقد</span>
                <span className="text-sm font-medium text-gray-900">
                  {contract.contractType === 'rent' ? 'إيجار' : 'بيع'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">القيمة الشهرية</span>
                <span className="text-sm font-medium text-gray-900">
                  {contract.amount.toLocaleString('ar-QA')} ريال
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">الموقع</span>
                <span className="text-sm font-medium text-gray-900">
                  {contract.propertyId.location.area}, {contract.propertyId.location.city}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">تاريخ البداية</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(contract.startDate).toLocaleDateString('ar-QA')}
                </span>
              </div>
              {contract.endDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">تاريخ الانتهاء</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(contract.endDate).toLocaleDateString('ar-QA')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdsTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      );
    }

    if (myAds.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">لا توجد إعلانات حتى الآن</p>
          <button
            onClick={() => router.push('/add-property/step-1')}
            className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            إضافة إعلان جديد
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {myAds.map((ad) => {
          const coverImage = ad.images.find((img) => img.isCover) || ad.images[0];

          return (
            <div
              key={ad._id}
              onClick={() => router.push(`/property/${ad._id}`)}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Property Image */}
              <div className="relative h-48 w-full bg-gray-200">
                {coverImage && (
                  <Image
                    src={coverImage.url}
                    alt={ad.titleAr || ad.title}
                    fill
                    className="object-cover"
                  />
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ad.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : ad.status === 'pending_approval'
                        ? 'bg-yellow-100 text-yellow-700'
                        : ad.status === 'draft'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {ad.status === 'active'
                      ? 'نشط'
                      : ad.status === 'pending_approval'
                      ? 'قيد المراجعة'
                      : ad.status === 'draft'
                      ? 'مسودة'
                      : 'غير نشط'}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg text-gray-900">
                  {ad.titleAr || ad.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {ad.location.area}, {ad.location.city}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{ad.area} متر</span>
                    <span>{ad.bedrooms} غرف</span>
                    <span>{ad.bathrooms} حمام</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {ad.price.toLocaleString('ar-QA')} ريال
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      ad.listingType === 'rent'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {ad.listingType === 'rent' ? 'للإيجار' : 'للبيع'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Ad Button */}
        <button
          onClick={() => router.push('/add-property/step-1')}
          className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">+</span>
            </div>
            <span className="font-medium">إضافة إعلان جديد</span>
          </div>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        {/* Header */}
        <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <button
            onClick={() => router.push('/profile/settings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">تفاصيل الموعد</h1>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white px-5 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {user?.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.fullName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                  {user?.fullName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{user?.fullName}</h2>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{user?.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-5 py-4 border-b border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === 'account'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              حسابي
            </button>
            <button
              onClick={() => setActiveTab('units')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === 'units'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              وحدتي
            </button>
            {settings.showMyAdsTab && (
              <button
                onClick={() => setActiveTab('ads')}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'ads'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                إعلاناتي
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-5 py-6">
          {activeTab === 'account' && renderAccountTab()}
          {activeTab === 'units' && renderUnitsTab()}
          {settings.showMyAdsTab && activeTab === 'ads' && renderAdsTab()}
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}
