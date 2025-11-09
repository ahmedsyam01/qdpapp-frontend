'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { paymentService } from '@/services/paymentService';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Add Property Payment Checkout
 * Process payment for property listing (420 QR)
 */

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(16, 'رقم البطاقة غير صحيح')
    .max(19, 'رقم البطاقة غير صحيح')
    .regex(/^[\d\s]+$/, 'رقم البطاقة يجب أن يحتوي على أرقام فقط'),
  cardHolderName: z
    .string()
    .min(3, 'اسم حامل البطاقة مطلوب')
    .regex(/^[a-zA-Z\s]+$/, 'اسم حامل البطاقة يجب أن يحتوي على حروف فقط'),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'تاريخ الانتهاء غير صحيح (MM/YY)'),
  cvv: z
    .string()
    .length(3, 'CVV يجب أن يحتوي على 3 أرقام')
    .regex(/^\d{3}$/, 'CVV يجب أن يحتوي على أرقام فقط'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const amount = searchParams.get('amount');

  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const cardNumber = watch('cardNumber');

  useEffect(() => {
    if (!listingId || !amount) {
      toast.error('معلومات الدفع غير صحيحة');
      router.push('/add-property/step-1');
    }
  }, [listingId, amount, router]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setValue('cardNumber', formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setValue('expiryDate', value);
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setProcessing(true);

      const [expiryMonth, expiryYear] = data.expiryDate.split('/');
      const fullYear = expiryYear.length === 2 ? `20${expiryYear}` : expiryYear;

      const cardNumberClean = data.cardNumber.replace(/\s/g, '');
      const cardBrand = cardNumberClean.startsWith('4') ? 'visa' :
                        /^5[1-5]/.test(cardNumberClean) ? 'mastercard' : 'card';

      // Process payment for listing
      const payment = await paymentService.process({
        amount: parseFloat(amount!),
        paymentMethod: cardBrand,
        paymentType: 'listing',
        referenceId: listingId!,
        cardDetails: {
          cardNumber: cardNumberClean,
          cardHolderName: data.cardHolderName,
          expiryMonth: expiryMonth,
          expiryYear: fullYear,
          cvv: data.cvv,
        },
        currency: 'QAR',
      });

      toast.success('تم الدفع بنجاح!');

      // Clear session storage
      sessionStorage.removeItem('addPropertyStep1');
      sessionStorage.removeItem('addPropertyStep2');
      sessionStorage.removeItem('pendingListing');

      // Navigate to success page
      router.push(`/property/booking/success?paymentId=${payment._id}&type=listing`);
    } catch (error: unknown) {
      console.error('Payment error:', error);
      const err = error as { response?: { data?: { message?: string | string[] } } };
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message ||
                       (Array.isArray(err.response?.data?.message) ? err.response?.data?.message.join(', ') : null) ||
                       'فشل الدفع';
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    return 'unknown';
  };

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
            بيانات البطاقة
          </h1>

          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Test Card Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">💳 بطاقة اختبار للتطوير</p>
            <div className="space-y-1 text-xs text-blue-800">
              <p dir="ltr">Card: 4111 1111 1111 1111</p>
              <p dir="ltr">Expiry: 12/25 | CVV: 123 | Name: JOHN DOE</p>
            </div>
          </div>
        )}

        {/* Payment Amount Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{amount} ر.ق</span>
            <span className="text-gray-600">المبلغ المطلوب</span>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-right">
            رسوم إضافة الإعلان (20 ر.ق تقييم + 400 ر.ق عرض)
          </p>
        </div>

        {/* Visual Credit Card Display */}
        <div className="mb-8">
          <div className="relative w-full aspect-[1.586/1] rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-teal-600 via-blue-600 to-blue-700">
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md"></div>
                </div>
                <div className="text-2xl font-bold">
                  {getCardBrand(cardNumber || '') === 'visa' ? 'VISA' :
                   getCardBrand(cardNumber || '') === 'mastercard' ? 'Mastercard' : 'VISA'}
                </div>
              </div>

              <div className="text-2xl font-mono tracking-wider">
                {cardNumber || '0000 0000 0000 0000'}
              </div>

              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <div className="text-xs text-white/70 mb-1" style={{ fontSize: '10px' }}>MM/YY</div>
                  <div className="text-base font-mono">{watch('expiryDate') || '00/00'}</div>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium uppercase tracking-wide">
                    {watch('cardHolderName') || 'CARDHOLDER NAME'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
              رقم البطاقة الائتمانية
            </label>
            <input
              {...register('cardNumber')}
              onChange={handleCardNumberChange}
              type="text"
              maxLength={19}
              placeholder="ادخل رقم البطاقة الائتمانية"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              dir="ltr"
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-500 text-right">{errors.cardNumber.message}</p>
            )}
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
              اسم حامل الهوية
            </label>
            <input
              {...register('cardHolderName')}
              type="text"
              placeholder="ادخل اسم حامل الهوية"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent uppercase"
              dir="ltr"
            />
            {errors.cardHolderName && (
              <p className="mt-1 text-sm text-red-500 text-right">{errors.cardHolderName.message}</p>
            )}
          </div>

          {/* Expiry Date & CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
                تاريخ الانتهاء
              </label>
              <input
                {...register('expiryDate')}
                onChange={handleExpiryDateChange}
                type="text"
                maxLength={5}
                placeholder="08/21"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                dir="ltr"
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-500 text-right">{errors.expiryDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
                CVV
              </label>
              <input
                {...register('cvv')}
                type="password"
                maxLength={3}
                placeholder="XXX"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                dir="ltr"
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-500 text-right">{errors.cvv.message}</p>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={processing}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          dir="rtl"
        >
          {processing ? 'جاري معالجة الدفع...' : 'إتمام الدفع'}
        </button>

        <div className="mt-4 flex justify-center">
          <div className="h-1 w-32 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}

export default function AddPropertyCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
