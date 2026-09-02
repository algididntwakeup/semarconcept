// platform/frontend-mui/src/setupTests.ts
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

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