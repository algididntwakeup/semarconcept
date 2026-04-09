// platform/frontend-mui/src/hooks/useComponentProfiler.ts
import { useEffect, useRef, useCallback } from 'react';
import { getDebugManager } from '../utils/debug-manager';

export const useComponentProfiler = (componentName: string, props?: any) => {
  const startTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);

  const trackRender = useCallback((
    phase: 'mount' | 'update', 
    actualDuration: number, 
    baseDuration: number, 
    startTime: number, 
    commitTime: number
  ) => {
    renderCountRef.current++;
    
    const debugManager = getDebugManager();
    debugManager.trackView({
      id: `${componentName}-${Date.now()}-${Math.random()}`,
      component: componentName,
      displayName: componentName,
      renderTime: actualDuration,
      timestamp: new Date().toISOString(),
      props: props ? JSON.stringify(props).slice(0, 1000) : undefined,
      phase,
      renderCount: renderCountRef.current,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      componentStack: new Error().stack?.split('\n').slice(2, 5).join('\n')
    });
  }, [componentName, props]);

  // Track mount
  useEffect(() => {
    mountTimeRef.current = performance.now();
    trackRender('mount', 0, 0, mountTimeRef.current, performance.now());
    
    return () => {
      // Track unmount
      const debugManager = getDebugManager();
      debugManager.trackView({
        id: `${componentName}-unmount-${Date.now()}`,
        component: componentName,
        displayName: `${componentName} (unmounting)`,
        renderTime: 0,
        timestamp: new Date().toISOString(),
        phase: 'unmount',
        renderCount: renderCountRef.current,
        actualDuration: 0,
        baseDuration: 0,
        startTime: mountTimeRef.current,
        commitTime: performance.now()
      });
    };
  }, [componentName, trackRender]);

  // Track updates
  useEffect(() => {
    if (renderCountRef.current > 1) {
      const endTime = performance.now();
      trackRender('update', endTime - startTimeRef.current, 0, startTimeRef.current, endTime);
    }
    startTimeRef.current = performance.now();
  });

  return {
    renderCount: renderCountRef.current,
    trackCustomEvent: (eventName: string, data?: any) => {
      const debugManager = getDebugManager();
      debugManager.trackView({
        id: `${componentName}-${eventName}-${Date.now()}`,
        component: `${componentName}.${eventName}`,
        displayName: `${componentName} - ${eventName}`,
        renderTime: 0,
        timestamp: new Date().toISOString(),
        props: data,
        phase: 'update',
        renderCount: renderCountRef.current,
        actualDuration: 0,
        baseDuration: 0,
        startTime: performance.now(),
        commitTime: performance.now()
      });
    }
  };
};



