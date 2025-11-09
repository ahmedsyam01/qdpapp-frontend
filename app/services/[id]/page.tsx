'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Service } from '@/types/service.types';
import { serviceService } from '@/services/serviceService';
import { getServiceTypeName, getServiceStatusColor } from '@/utils/serviceConstants';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceService.getById(serviceId);
      setService(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Error fetching service details:', err);
      setError(error.response?.data?.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!service) return;

    try {
      setSubmittingRating(true);
      await serviceService.rate(service._id, { rating, feedback });
      setShowRatingModal(false);
      await fetchServiceDetails(); // Refresh data
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Error submitting rating:', err);
      alert(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: ar });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'م' : 'ص';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${displayHours}:${minutes} ${period}`;
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error || 'Service not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const statusColors = getServiceStatusColor(service.status);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white px-5 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">تفاصيل الموعد</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-5 py-6">
        {/* Main Info Card - Service Type, Property, Status */}
        <div className="bg-white rounded-xl p-5 mb-4">
          {/* Service Type Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-3 text-right">
            {getServiceTypeName(service.serviceType)}
          </h2>

          {/* Property/Unit Info */}
          {service.propertyId && (
            <p className="text-sm text-gray-600 mb-4 text-right">
              {service.propertyId.title}
            </p>
          )}

          {/* Status Badge */}
          <div className="text-right">
            <span
              className="inline-block px-4 py-1.5 rounded-xl text-xs font-medium"
              style={{
                backgroundColor: statusColors.bgColor,
                color: statusColors.color,
              }}
            >
              {service.status === 'pending' && 'قيد الانتظار'}
              {service.status === 'in_progress' && 'جاري التنفيذ'}
              {service.status === 'completed' && 'مكتمل'}
              {service.status === 'cancelled' && 'ملغي'}
            </span>
          </div>
        </div>

        {/* Appointment Date Card */}
        {service.scheduledDate && (
          <div className="bg-white rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {formatDate(service.scheduledDate)}
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">تاريخ الموعد</h3>
                <span className="text-xl">📅</span>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Time Card */}
        {service.scheduledDate && (
          <div className="bg-white rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {formatTime(service.scheduledDate)}
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">وقت الموعد</h3>
                <span className="text-xl">🕐</span>
              </div>
            </div>
          </div>
        )}

        {/* Problem Description Card */}
        <div className="bg-white rounded-xl p-5 mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-3 text-right">
            وصف المشكلة
          </h3>
          <p className="text-sm text-gray-600 text-right leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Technician Info Card */}
        <div className="bg-white rounded-xl p-5 mb-4">
          <h3 className="text-base font-bold text-gray-900 mb-4 text-right">
            بيانات الفني
          </h3>
          {service.technicianId ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">
                  {service.technicianId.fullName}
                </span>
                <span className="text-sm text-gray-600">الاسم:</span>
              </div>
              {service.technicianId.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900" dir="ltr">
                    {service.technicianId.phone}
                  </span>
                  <span className="text-sm text-gray-600">رقم التواصل:</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              لم يتم تعيين فني بعد
            </p>
          )}
        </div>

        {/* Cost Info - Separate Card if needed */}
        {(service.cost || service.estimatedCost) && (
          <div className="bg-white rounded-xl p-5 mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 text-right">التكلفة</h3>
            <div className="space-y-2">
              {service.estimatedCost && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    {service.estimatedCost} ر.ق
                  </span>
                  <span className="text-sm text-gray-600">التكلفة المتوقعة:</span>
                </div>
              )}
              {service.cost && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">
                    {service.cost} ر.ق
                  </span>
                  <span className="text-sm text-gray-600">التكلفة الفعلية:</span>
                </div>
              )}
              {service.isPaid && (
                <div className="mt-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg text-center">
                  <span className="text-sm text-green-700 font-medium">✓ تم الدفع</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rating Section */}
        {service.status === 'completed' && (
          <div className="bg-white rounded-xl p-5 mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 text-right">التقييم</h3>
            {service.rating ? (
              <div>
                <div className="flex items-center justify-end gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="text-2xl"
                    >
                      {star <= service.rating! ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                {service.feedback && (
                  <p className="text-sm text-gray-600 mt-2 text-right">{service.feedback}</p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full bg-black text-white rounded-lg py-3 font-medium hover:bg-gray-800 transition-colors"
              >
                قيّم الخدمة
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
              قيّم الخدمة
            </h3>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none mb-4"
              rows={4}
              placeholder="اكتب ملاحظاتك (اختياري)"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={submittingRating}
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmitRating}
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                disabled={submittingRating}
              >
                {submittingRating ? 'جاري الإرسال...' : 'إرسال'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
