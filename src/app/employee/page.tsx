"use client";

import EmployeePortal from '../../../EmployeePortal';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EmployeePage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("medco_auth");
    if (!auth) {
      router.push('/login?redirect=/employee');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) return null; // Or a loading spinner

  return <EmployeePortal />;
}
