"use client";

import DigitalClinicFinance from '../../../finance dep';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FinancePage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("medco_auth");
    if (!auth) {
      router.push('/login?redirect=/finance');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) return null;

  return <DigitalClinicFinance />;
}
