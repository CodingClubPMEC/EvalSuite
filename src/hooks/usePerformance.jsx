import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for performance monitoring and optimization
 */
export const usePerformance = (componentName = 'Component') => {
  const renderCount = useRef(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    renderCount: 0,
    memoryUsage: 0,
    lastRender: null
  });

  // Track render count and timing
  useEffect(() => {
    renderCount.current += 1;
    const renderStart = performance.now();

    // Update metrics after render
    const updateMetrics = () => {
      const renderTime = performance.now() - renderStart;
      const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize : 0;

      setPerformanceMetrics(prev => ({
        renderTime: Math.round(renderTime * 100) / 100,
        renderCount: renderCount.current,
        memoryUsage: Math.round(memoryUsage / 1024 / 1024 * 100) / 100, // MB
        lastRender: new Date().toISOString()
      }));
    };

    // Use requestAnimationFrame to measure after DOM updates
    requestAnimationFrame(updateMetrics);

    // Log performance warnings in development
    if (process.env.NODE_ENV === 'development') {
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
      if (renderCount.current > 100) {
        console.warn(`[Performance] ${componentName} has rendered ${renderCount.current} times`);
      }
    }
  });

  return performanceMetrics;
};

/**
 * Custom hook for Web Vitals monitoring
 */
export const useWebVitals = () => {
  const [vitals, setVitals] = useState({
    fcp: null, // First Contentful Paint
    lcp: null, // Largest Contentful Paint
    fid: null, // First Input Delay
    cls: null, // Cumulative Layout Shift
    ttfb: null // Time to First Byte
  });

  useEffect(() => {
    // Measure FCP
    const measureFCP = () => {
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        setVitals(prev => ({ ...prev, fcp: Math.round(fcpEntry.startTime) }));
      }
    };

    // Measure LCP using PerformanceObserver
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          setVitals(prev => ({ ...prev, lcp: Math.round(lastEntry.startTime) }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Measure FID
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            setVitals(prev => ({ ...prev, fid: Math.round(entry.processingStart - entry.startTime) }));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Measure CLS
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = 0;
          entryList.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          setVitals(prev => ({ ...prev, cls: Math.round(clsValue * 1000) / 1000 }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (error) {
        console.warn('[Performance] PerformanceObserver not fully supported:', error);
      }
    }

    // Measure TTFB
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      setVitals(prev => ({ ...prev, ttfb: Math.round(ttfb) }));
    }

    measureFCP();
  }, []);

  return vitals;
};

/**
 * Custom hook for frame rate monitoring
 */
export const useFrameRate = () => {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef(null);

  const measureFrameRate = useCallback(() => {
    frameCount.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime.current >= 1000) {
      setFps(frameCount.current);
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
    
    animationId.current = requestAnimationFrame(measureFrameRate);
  }, []);

  useEffect(() => {
    animationId.current = requestAnimationFrame(measureFrameRate);
    
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [measureFrameRate]);

  return fps;
};

/**
 * Custom hook for memory monitoring
 */
export const useMemoryMonitoring = () => {
  const [memoryInfo, setMemoryInfo] = useState({
    used: 0,
    total: 0,
    percentage: 0
  });

  useEffect(() => {
    const updateMemoryInfo = () => {
      if (performance.memory) {
        const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
        const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024 * 100) / 100;
        const percentage = Math.round(used / total * 100);

        setMemoryInfo({ used, total, percentage });

        // Warn about high memory usage
        if (percentage > 80) {
          console.warn(`[Performance] High memory usage: ${percentage}% (${used}MB/${total}MB)`);
        }
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

/**
 * Performance debugging component for development
 */
export const PerformanceMonitor = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const vitals = useWebVitals();
  const fps = useFrameRate();
  const memory = useMemoryMonitoring();

  if (!enabled) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        minWidth: '200px'
      }}
    >
      <div><strong>Performance Monitor</strong></div>
      <div>FPS: {fps}</div>
      <div>Memory: {memory.used}MB ({memory.percentage}%)</div>
      {vitals.fcp && <div>FCP: {vitals.fcp}ms</div>}
      {vitals.lcp && <div>LCP: {vitals.lcp}ms</div>}
      {vitals.fid && <div>FID: {vitals.fid}ms</div>}
      {vitals.cls && <div>CLS: {vitals.cls}</div>}
      {vitals.ttfb && <div>TTFB: {vitals.ttfb}ms</div>}
    </div>
  );
};