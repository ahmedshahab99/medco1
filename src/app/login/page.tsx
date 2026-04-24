// src/app/login/page.tsx
"use client";

import LoginForm from '@/components/ui/LoginForm';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect');

  const handleLoginSuccess = (identifier: string) => {
    // Basic redirect map
    if (redirect) {
      router.push(redirect);
    } else if (identifier.toLowerCase().includes('finance')) {
      router.push('/finance');
    } else {
      router.push('/employee');
    }
  };

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0b0f18', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Loading...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
