'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ym) return;

    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');
    
    window.ym(109612757, 'hit', url);
  }, [pathname, searchParams]);

  return null;
}