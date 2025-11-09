'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/forms';

export default function Splash4() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Logo and Company Name - Top Section */}
      <div className="flex-1 flex items-center justify-center px-8">
        {/* QDP Logo with Company Name */}
        <Image
          src="/logo-with-text.png"
          alt="QDP Logo"
          width={280}
          height={150}
          priority
        />
      </div>

      {/* Action Buttons - Bottom Section */}
      <div className="px-5 pb-8 space-y-3">
        {/* Login Button - Beige Background, Black Text */}
        <Button
          variant="cream"
          size="lg"
          fullWidth
          onClick={() => router.push('/auth/login')}
          className="h-14 !bg-[#D9D1BE] !text-black hover:!bg-[#C9C1AE]"
        >
          <span className="font-semibold">تسجيل الدخول</span>
        </Button>

        {/* Sign Up Button - Light Gray Background, Black Text */}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => router.push('/auth/signup')}
          className="h-14 !bg-qdp-cream-light !text-black hover:!bg-[#D6D6D6] !border-none"
        >
          <span className="font-semibold">إنشاء حساب جديد</span>
        </Button>
      </div>

      {/* Home Indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}
