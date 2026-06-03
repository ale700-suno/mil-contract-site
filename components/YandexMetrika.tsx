'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Типизация Яндекс Метрики
declare global {
  interface Window {
    ym: (id: number, method: string, ...args: any[]) => void;
  }
}

export default function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Дополнительная защита от ошибок во время prerender
    if (typeof window === 'undefined' || typeof window.ym !== 'function') {
      return;
    }

    try {
      const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      window.ym(109612757, 'hit', url);
    } catch (error) {
      // Тихо игнорируем ошибки (чтобы не ломать билд)
      console.error('Yandex Metrika error:', error);
    }
  }, [pathname, searchParams]);

  return null;
}
