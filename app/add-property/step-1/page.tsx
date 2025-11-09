'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Upload } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

/**
 * Add Property - Step 1
 * Design Reference: Add Adv-1.png
 *
 * Fields:
 * - City (المدينة)
 * - Number of Rooms (عدد الغرف) - 1-5 selection boxes
 * - Number of Bathrooms (عدد الحمامات) - 1-2 selection boxes
 * - Property Images (صور العقار) - Upload up to 20 images
 * - Price (السعر)
 */

export default function AddPropertyStep1() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    city: '',
    propertyType: 'apartment' as 'apartment' | 'villa' | 'office' | 'land' | 'warehouse' | 'showroom',
    category: 'sale' as 'sale' | 'rent',
    title: '',
    description: '',
    rooms: 3,
    bathrooms: 2,
    images: [] as File[],
    price: '',
    // Dual Purpose Support
    availableForRent: false,
    availableForSale: true,
    rentPrice: '',
    salePrice: '',
    contractDuration: '12',
    numberOfInstallments: '12',
    insuranceDeposit: '',
  });

  const propertyTypes = [
    { value: 'apartment', label: 'شقة' },
    { value: 'villa', label: 'فيلا' },
    { value: 'office', label: 'مكتب' },
    { value: 'land', label: 'أرض' },
    { value: 'warehouse', label: 'مستودع' },
    { value: 'showroom', label: 'صالة عرض' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 20) {
      toast.error('الحد الأقصى هو 20 صورة');
      return;
    }
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleContinue = () => {
    if (!formData.city.trim()) {
      toast.error('الرجاء إدخال المدينة');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('الرجاء إدخال عنوان العقار');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('الرجاء إدخال وصف العقار');
      return;
    }
    if (!formData.availableForRent && !formData.availableForSale) {
      toast.error('الرجاء اختيار نوع العرض (إيجار أو بيع)');
      return;
    }
    if (formData.availableForRent && !formData.rentPrice.trim()) {
      toast.error('الرجاء إدخال سعر الإيجار الشهري');
      return;
    }
    if (formData.availableForSale && !formData.salePrice.trim()) {
      toast.error('الرجاء إدخال سعر البيع');
      return;
    }
    if (formData.availableForRent && !formData.insuranceDeposit.trim()) {
      toast.error('الرجاء إدخال مبلغ التأمين');
      return;
    }
    if (formData.images.length === 0) {
      toast.error('الرجاء إضافة صورة واحدة على الأقل');
      return;
    }

    // Store data in sessionStorage to pass to next step
    const step1Data = {
      city: formData.city,
      propertyType: formData.propertyType,
      category: formData.category,
      title: formData.title,
      description: formData.description,
      rooms: formData.rooms,
      bathrooms: formData.bathrooms,
      price: parseFloat(formData.price || formData.rentPrice || formData.salePrice), // Fallback for backward compatibility
      imageCount: formData.images.length,
      // New dual-purpose fields
      availableFor: {
        rent: formData.availableForRent,
        sale: formData.availableForSale,
        ...(formData.availableForRent && {
          rentPrice: parseFloat(formData.rentPrice),
          contractDuration: parseInt(formData.contractDuration),
          numberOfInstallments: parseInt(formData.numberOfInstallments),
          insuranceDeposit: parseFloat(formData.insuranceDeposit),
        }),
        ...(formData.availableForSale && {
          salePrice: parseFloat(formData.salePrice),
        }),
      },
    };
    sessionStorage.setItem('addPropertyStep1', JSON.stringify(step1Data));

    router.push('/add-property/step-2');
  };

  return (
    <div className="min-h-screen bg-white pb-32" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => router.push('/home')}
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
        {/* Progress Indicator - 3 Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-2">
            {/* Step 3 */}
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <div className="w-20 h-0.5 bg-gray-300"></div>

            {/* Step 2 */}
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <div className="w-20 h-0.5 bg-gray-300"></div>

            {/* Step 1 - Active */}
            <div className="w-4 h-4 rounded-full bg-black"></div>
          </div>
          <p className="text-center text-sm text-gray-500">المدينة</p>
        </div>

        {/* Property Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            نوع العقار
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) => updateField('propertyType', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Type - Can select both */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3 text-right">
            نوع العرض المتاح
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-end gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <span className="text-gray-900">متاح للإيجار</span>
              <input
                type="checkbox"
                checked={formData.availableForRent}
                onChange={(e) => {
                  updateField('availableForRent', e.target.checked);
                  if (e.target.checked) updateField('category', 'rent');
                }}
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />
            </label>
            <label className="flex items-center justify-end gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <span className="text-gray-900">متاح للبيع</span>
              <input
                type="checkbox"
                checked={formData.availableForSale}
                onChange={(e) => {
                  updateField('availableForSale', e.target.checked);
                  if (e.target.checked) updateField('category', 'sale');
                }}
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />
            </label>
          </div>
          {formData.availableForRent && formData.availableForSale && (
            <p className="mt-2 text-sm text-green-600 text-right">
              ✓ هذا العقار متاح للإيجار والبيع
            </p>
          )}
        </div>

        {/* City Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            ادخل المدينة الموجود بيها العقار
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="مثال: الدوحة"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Property Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            عنوان العقار
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="مثال: شقة فاخرة في الدوحة"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Property Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            وصف العقار
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="اكتب وصفاً تفصيلياً للعقار"
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
        </div>

        {/* Number of Rooms */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3 text-right">
            عدد الغرف
          </label>
          <div className="flex gap-2 justify-end">
            {[5, 4, 3, 2, 1].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => updateField('rooms', num)}
                className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-lg font-medium transition-colors ${
                  formData.rooms === num
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Bathrooms */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3 text-right">
            عدد الحمامات
          </label>
          <div className="flex gap-2 justify-end">
            {[2, 1].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => updateField('bathrooms', num)}
                className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-lg font-medium transition-colors ${
                  formData.bathrooms === num
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Property Images */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3 text-right">
            صور العقار
          </label>

          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">يمكنك رفع صور / فيديو</p>
            <p className="text-xs text-gray-400 mt-1">اقصى حد للصور 20 صورة</p>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {/* Display uploaded images count */}
          {formData.images.length > 0 && (
            <div className="mt-3 text-sm text-gray-600 text-right">
              تم رفع {formData.images.length} صورة
            </div>
          )}
        </div>

        {/* Rent Details - Show if available for rent */}
        {formData.availableForRent && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4 text-right">
              تفاصيل الإيجار
            </h3>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2 text-right">
                السعر الشهري (ريال قطري)
              </label>
              <input
                type="number"
                value={formData.rentPrice}
                onChange={(e) => updateField('rentPrice', e.target.value)}
                placeholder="مثال: 5000"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2 text-right">
                مدة العقد (بالأشهر)
              </label>
              <select
                value={formData.contractDuration}
                onChange={(e) => {
                  updateField('contractDuration', e.target.value);
                  updateField('numberOfInstallments', e.target.value); // Auto-set installments = duration
                }}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="6">6 أشهر</option>
                <option value="12">12 شهر</option>
                <option value="24">24 شهر</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2 text-right">
                عدد الأقساط الشهرية
              </label>
              <input
                type="number"
                value={formData.numberOfInstallments}
                onChange={(e) => updateField('numberOfInstallments', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 text-right">
                مبلغ التأمين (ريال قطري)
              </label>
              <input
                type="number"
                value={formData.insuranceDeposit}
                onChange={(e) => updateField('insuranceDeposit', e.target.value)}
                placeholder="عادة ما يساوي شهر واحد"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Sale Details - Show if available for sale */}
        {formData.availableForSale && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4 text-right">
              تفاصيل البيع
            </h3>

            <div>
              <label className="block text-sm text-gray-700 mb-2 text-right">
                سعر البيع (ريال قطري)
              </label>
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) => updateField('salePrice', e.target.value)}
                placeholder="مثال: 2500000"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
        <button
          onClick={handleContinue}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 transition-colors duration-200"
          dir="rtl"
        >
          متابعة
        </button>

        {/* Home indicator */}
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-32 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
