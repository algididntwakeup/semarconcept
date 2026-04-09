// platform/frontend-mui/src/hooks/usePageLogger.ts
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import logger from '../utils/logger';

/**
 * Custom hook to log page navigation events
 * 
 * This hook automatically logs when a user navigates to a new page,
 * including the time spent on the previous page.
 */
export function usePageLogger(): void {
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);
  const pageEntryTimeRef = useRef<number>(Date.now());
  const isInitialRenderRef = useRef<boolean>(true);

  useEffect(() => {
    const currentPath = location.pathname;
    const currentTime = Date.now();
    const timeOnPrevPage = currentTime - pageEntryTimeRef.current;
    
    // Handle initial render
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      
      // Log initial page load
      logger.info('Initial page load', {
        path: location.pathname,
        search: location.search,
        hash: location.hash,
        referrer: document.referrer,
      });
      
      // Log performance metrics if available
      try {
        if (window.performance && window.performance.timing) {
          const perfData = window.performance.timing;
          const navigationStart = perfData.navigationStart;
          
          if (navigationStart > 0) {
            const pageLoadTime = perfData.loadEventEnd - navigationStart;
            const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
            const tcpTime = perfData.connectEnd - perfData.connectStart;
            const ttfb = perfData.responseStart - perfData.requestStart;
            
            logger.debug('Page load performance', {
              totalLoadTime: pageLoadTime || 0,
              dnsLookupTime: dnsTime || 0,
              tcpConnectionTime: tcpTime || 0,
              timeToFirstByte: ttfb || 0,
              domContentLoaded: (perfData.domContentLoadedEventEnd - navigationStart) || 0,
              domInteractive: (perfData.domInteractive - navigationStart) || 0,
            });
          }
        }
      } catch (error) {
        logger.debug('Performance measurement unavailable', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      
      // Set initial values
      prevPathRef.current = currentPath;
      pageEntryTimeRef.current = currentTime;
      return;
    }
    
    // Only log navigation if this is not the initial render and path has changed
    if (prevPathRef.current !== currentPath) {
      // Log navigation event
      logger.info('Page navigation', {
        from: prevPathRef.current,
        to: currentPath,
        timeOnPrevPage: `${(timeOnPrevPage / 1000).toFixed(2)}s`,
        search: location.search,
        hash: location.hash,
      });
      
      // Update refs for next navigation
      prevPathRef.current = currentPath;
      pageEntryTimeRef.current = currentTime;
      
      // Log page view event
      logger.logUserAction('page_view', {
        path: currentPath,
        fullUrl: window.location.href,
        referrer: document.referrer,
      });
      
      // Start performance measurement for page render
      try {
        const endMeasure = logger.measure(`Page Render: ${currentPath}`);
        
        // Use requestAnimationFrame to measure when the page has rendered
        requestAnimationFrame(() => {
          // Use setTimeout to ensure measurement happens after render is complete
          setTimeout(() => {
            const renderTime = endMeasure();
            logger.debug('Page render complete', {
              path: currentPath,
              renderTime: `${renderTime.toFixed(2)}ms`,
            });
          }, 0);
        });
      } catch (error) {
        logger.debug('Performance measurement failed', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    // Log page exit on component unmount
    return () => {
      const timeOnPage = Date.now() - pageEntryTimeRef.current;
      logger.debug('Page exit', {
        path: currentPath,
        timeOnPage: `${(timeOnPage / 1000).toFixed(2)}s`,
      });
    };
  }, [location]);
}

export default usePageLogger;