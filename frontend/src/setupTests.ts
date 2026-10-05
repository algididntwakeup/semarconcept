// platform/frontend-mui/src/setupTests.ts
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { configure } from '@testing-library/dom';

// Naikkan timeout default findBy*/waitFor: saat seluruh suite berjalan paralel,
// resolusi React Query + render kadang melewati batas 1000 ms bawaan.
configure({ asyncUtilTimeout: 5000 });

// jsdom tidak mengimplementasikan matchMedia (dipakai MainLayout & MUI).
window.matchMedia =
  window.matchMedia ||
  ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList));

// ResizeObserver tidak tersedia pada jsdom (dipakai chart/advanced grid).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver || ResizeObserverStub;

// Clean up setelah setiap test (rekomendasi @testing-library/react).
afterEach(() => {
  cleanup();
});