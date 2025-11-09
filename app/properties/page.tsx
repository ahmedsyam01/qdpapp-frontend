'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/config';
import { useInView } from 'react-intersection-observer';
import { API_BASE_URL } from '@/lib/config';
import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { API_BASE_URL } from '@/lib/config';
import { PropertyCardSkeleton } from '@/components/ui/PropertyCardSkeleton';
import { API_BASE_URL } from '@/lib/config';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { API_BASE_URL } from '@/lib/config';

interface Property {
  _id: string;
  title: string;
  price: number;
  category: string;
  propertyType: string;
  images: Array<{ url: string }>;
  location: {
    city: string;
    area: string;
  };
  specifications: {
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
  };
}

export default function PropertiesPage() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['properties-infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `${API_BASE_URL}/properties?offset=${pageParam}&limit=10`
      );
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedItems = allPages.reduce((acc, page) => acc + (page.properties?.length || 0), 0);
      if (loadedItems < lastPage.total) {
        return loadedItems;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-black">الوحدات</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.pages[0]?.total || 0} وحدة متاحة
          </p>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <PropertyCardSkeleton key={index} compact />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {data?.pages.map((page, pageIndex) =>
                page.properties?.map((property: Property, propertyIndex: number) => (
                  <div
                    key={property._id}
                    className="animate-fadeIn"
                    style={{
                      animationDelay: `${propertyIndex * 0.05}s`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <PropertyCard property={property} compact />
                  </div>
                ))
              )}
            </div>

            {/* Loading indicator for infinite scroll */}
            {hasNextPage && (
              <div ref={ref}>
                {isFetchingNextPage ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <PropertyCardSkeleton key={`loading-${index}`} compact />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    قم بالتمرير لتحميل المزيد
                  </div>
                )}
              </div>
            )}

            {!hasNextPage && data?.pages[0]?.properties?.length > 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                لا توجد المزيد من الوحدات
              </div>
            )}

            {data?.pages[0]?.properties?.length === 0 && (
              <div className="text-center py-20">
                <svg
                  className="w-20 h-20 mx-auto text-gray-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium">لا توجد وحدات متاحة</p>
                <p className="text-gray-400 text-sm mt-2">
                  تحقق مرة أخرى لاحقاً للوحدات الجديدة
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
