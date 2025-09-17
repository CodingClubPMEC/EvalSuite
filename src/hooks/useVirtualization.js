import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Custom hook for virtualizing large lists/tables
 * Optimizes rendering performance for large datasets
 */
export const useVirtualization = ({ 
  items = [], 
  itemHeight = 50, 
  containerHeight = 400,
  overscan = 3 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    
    return {
      start: Math.max(0, start - overscan),
      end,
      offsetY: Math.max(0, start - overscan) * itemHeight
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange.start, visibleRange.end]);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.offsetY,
    handleScroll
  };
};

/**
 * Custom hook for optimizing heavy computations
 */
export const useOptimizedCalculation = (calculation, dependencies, threshold = 16) => {
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    const performCalculation = () => {
      setIsCalculating(true);
      
      // Use requestIdleCallback if available, fallback to setTimeout
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          try {
            const newResult = calculation();
            setResult(newResult);
          } catch (error) {
            console.error('Calculation error:', error);
          } finally {
            setIsCalculating(false);
          }
        }, { timeout: threshold });
      } else {
        timeoutId = setTimeout(() => {
          try {
            const newResult = calculation();
            setResult(newResult);
          } catch (error) {
            console.error('Calculation error:', error);
          } finally {
            setIsCalculating(false);
          }
        }, 0);
      }
    };

    performCalculation();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, dependencies);

  return { result, isCalculating };
};