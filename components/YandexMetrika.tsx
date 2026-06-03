'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Типизация для Яндекс Метрики
declare global {
  interface Window {
    ym: (id: number, method: string, ...args: any[]) => void;
  }
}

export default function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.ym !== 'function') return;

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    
    window.ym(109612757, 'hit', url);
  }, [pathname, searchParams]);

  return null;
}
