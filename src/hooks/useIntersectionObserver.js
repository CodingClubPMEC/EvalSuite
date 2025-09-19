import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Custom hook for Intersection Observer API
 * Useful for lazy loading, infinite scroll, and visibility tracking
 */
export const useIntersectionObserver = (options = {}) => {
  const [entries, setEntries] = useState([]);
  const observer = useRef(null);
  const elementsRef = useRef(new Map());

  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
  } = options;

  const observe = useCallback((element) => {
    if (!element || elementsRef.current.has(element)) return;

    elementsRef.current.set(element, true);
    if (observer.current) {
      observer.current.observe(element);
    }
  }, []);

  const unobserve = useCallback((element) => {
    if (!element || !elementsRef.current.has(element)) return;

    elementsRef.current.delete(element);
    if (observer.current) {
      observer.current.unobserve(element);
    }
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver((observedEntries) => {
      setEntries(observedEntries);

      if (freezeOnceVisible) {
        observedEntries.forEach(entry => {
          if (entry.isIntersecting && observer.current) {
            observer.current.unobserve(entry.target);
            elementsRef.current.delete(entry.target);
          }
        });
      }
    }, { threshold, root, rootMargin });

    // Observe any elements that were added before the observer was created
    elementsRef.current.forEach((_, element) => {
      observer.current.observe(element);
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
      elementsRef.current.clear();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return { entries, observe, unobserve };
};

/**
 * Simplified hook for lazy loading images
 */
export const useLazyImage = (src, placeholder = '') => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef(null);

  const { entries, observe } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  });

  useEffect(() => {
    if (imgRef.current) {
      observe(imgRef.current);
    }
  }, [observe]);

  useEffect(() => {
    const entry = entries.find(entry => entry.target === imgRef.current);
    
    if (entry && entry.isIntersecting && !isLoaded && !isError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        setIsError(true);
      };
      
      img.src = src;
    }
  }, [entries, src, isLoaded, isError]);

  return {
    ref: imgRef,
    src: imageSrc,
    isLoaded,
    isError
  };
};

/**
 * Hook for visibility tracking
 */
export const useVisibility = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  const { entries, observe } = useIntersectionObserver({
    threshold,
    freezeOnceVisible: false
  });

  useEffect(() => {
    if (elementRef.current) {
      observe(elementRef.current);
    }
  }, [observe]);

  useEffect(() => {
    const entry = entries.find(entry => entry.target === elementRef.current);
    if (entry) {
      setIsVisible(entry.isIntersecting);
    }
  }, [entries]);

  return {
    ref: elementRef,
    isVisible
  };
};

/**
 * Hook for infinite scroll
 */
export const useInfiniteScroll = (loadMore, hasMore = true, threshold = 1.0) => {
  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef(null);

  const { entries, observe } = useIntersectionObserver({
    threshold,
    freezeOnceVisible: false
  });

  useEffect(() => {
    if (sentinelRef.current && hasMore) {
      observe(sentinelRef.current);
    }
  }, [observe, hasMore]);

  useEffect(() => {
    const entry = entries.find(entry => entry.target === sentinelRef.current);
    
    if (entry && entry.isIntersecting && hasMore && !isFetching) {
      setIsFetching(true);
      loadMore().finally(() => setIsFetching(false));
    }
  }, [entries, hasMore, isFetching, loadMore]);

  return {
    sentinelRef,
    isFetching
  };
};

/**
 * Hook for element size tracking with performance optimization
 */
export const useElementSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef(null);
  const resizeObserver = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      resizeObserver.current = new ResizeObserver((entries) => {
        if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          setSize({ width: Math.round(width), height: Math.round(height) });
        }
      });

      resizeObserver.current.observe(elementRef.current);
    }

    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, []);

  return {
    ref: elementRef,
    size
  };
};