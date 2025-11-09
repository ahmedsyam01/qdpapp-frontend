'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyStore } from '@/store/propertyStore';

export default function FiltersPage() {
  const router = useRouter();
  const { filters, setFilters, resetFilters } = usePropertyStore();

  const [sortBy, setSortBy] = useState<string>(filters.sortBy || 'nearest');
  const [priceOrder, setPriceOrder] = useState<'asc' | 'desc'>('asc');
  const [unitType, setUnitType] = useState<'qdp' | 'external' | null>(null);
  const [selectedComplex, setSelectedComplex] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | null>(filters.bedrooms);

  const complexes = ['الواحة', 'الخزائن', 'النخيل', 'الزيان', 'المزيد'];
  const bedroomOptions = [1, 2, 3, 4, 5];

  const handleApply = () => {
    setFilters({
      sortBy: sortBy === 'price_asc' ? 'price_asc' : sortBy === 'price_desc' ? 'price_desc' : 'date_desc',
      bedrooms: selectedBedrooms,
      propertyType: unitType ? [unitType] : [],
    });
    router.push('/search/results');
  };

  const handleClear = () => {
    resetFilters();
    setSortBy('nearest');
    setPriceOrder('asc');
    setUnitType(null);
    setSelectedComplex([]);
    setSelectedBedrooms(null);
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-center">فلتر</h1>
          <div className="flex items-center justify-center gap-1 mt-1">
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-sm text-gray-500">الدوحة، قطر</span>
          </div>
        </div>
        <div className="w-6"></div>
      </div>

      {/* Filters Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Sort By */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
            </svg>
            <h3 className="font-semibold text-base">ترتيب حسب</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSortBy('nearest')}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                sortBy === 'nearest'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
                <span className="text-xs">الأقرب إليك</span>
              </div>
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                sortBy === 'rating'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span className="text-xs">الأعلى تقييم</span>
              </div>
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                sortBy === 'popular'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <span className="text-xs">الأكثر شيوعاً</span>
              </div>
            </button>
          </div>
        </div>

        {/* Price Order */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setPriceOrder('desc');
              setSortBy('price_desc');
            }}
            className={`py-3 px-4 rounded-lg border-2 transition-all ${
              priceOrder === 'desc'
                ? 'border-black bg-black text-white'
                : 'border-gray-200 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
              </svg>
              <span className="text-sm">الأعلى سعر</span>
            </div>
          </button>
          <button
            onClick={() => {
              setPriceOrder('asc');
              setSortBy('price_asc');
            }}
            className={`py-3 px-4 rounded-lg border-2 transition-all ${
              priceOrder === 'asc'
                ? 'border-black bg-black text-white'
                : 'border-gray-200 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
              </svg>
              <span className="text-sm">الأقل سعر</span>
            </div>
          </button>
        </div>

        {/* Unit Type */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H5v-5h5v5zm0-7H5V5h5v5zm7 7h-5v-5h5v5zm0-7h-5V5h5v5z"/>
            </svg>
            <h3 className="font-semibold text-base">نوع الوحدة</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUnitType('qdp')}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                unitType === 'qdp'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              عقارات QDP
            </button>
            <button
              onClick={() => setUnitType('external')}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                unitType === 'external'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              عقارات خارجية
            </button>
          </div>
        </div>

        {/* Residential Complex */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
            </svg>
            <h3 className="font-semibold text-base">المجمع السكني</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {complexes.map((complex) => (
              <button
                key={complex}
                onClick={() => {
                  setSelectedComplex((prev) =>
                    prev.includes(complex)
                      ? prev.filter((c) => c !== complex)
                      : [...prev, complex]
                  );
                }}
                className={`py-2 px-4 rounded-lg border-2 transition-all ${
                  selectedComplex.includes(complex)
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                {complex}
              </button>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
            </svg>
            <h3 className="font-semibold text-base">عدد الغرف</h3>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {bedroomOptions.map((num) => (
              <button
                key={num}
                onClick={() => setSelectedBedrooms(num)}
                className={`py-4 rounded-lg border-2 transition-all ${
                  selectedBedrooms === num
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                <span className="text-lg font-semibold">{num}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <button
            onClick={handleClear}
            className="py-3 px-6 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            مسح الاختيارات
          </button>
          <button
            onClick={handleApply}
            className="py-3 px-6 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors"
          >
            حفظ
          </button>
        </div>
      </div>

      {/* Bottom padding to prevent content being hidden behind fixed buttons */}
      <div className="h-20"></div>
    </div>
  );
}
