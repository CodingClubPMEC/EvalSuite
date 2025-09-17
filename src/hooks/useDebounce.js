import React, { useRef, useCallback } from 'react';

/**
 * Custom hook for debouncing function calls
 * @param {Function} callback - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  // Cleanup function to cancel pending debounced calls
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Immediate execution function
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      callback();
      timeoutRef.current = null;
    }
  }, [callback]);

  return { debouncedCallback, cancel, flush };
};

/**
 * Custom hook for throttling function calls
 * @param {Function} callback - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export const useThrottle = (callback, limit) => {
  const inThrottle = useRef(false);

  const throttledCallback = useCallback((...args) => {
    if (!inThrottle.current) {
      callback(...args);
      inThrottle.current = true;
      setTimeout(() => {
        inThrottle.current = false;
      }, limit);
    }
  }, [callback, limit]);

  return throttledCallback;
};

/**
 * Custom hook for auto-save functionality with debouncing
 * @param {Function} saveFunction - The function to call for saving
 * @param {any} data - The data to save
 * @param {Object} options - Configuration options
 * @returns {Object} - Save status and controls
 */
export const useAutoSave = (saveFunction, data, options = {}) => {
  const {
    delay = 2000,
    enabled = true,
    onSuccess,
    onError
  } = options;

  const timeoutRef = useRef(null);
  const isInitialRender = useRef(true);

  const performSave = useCallback(async () => {
    try {
      await saveFunction(data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Auto-save failed:', error);
      if (onError) onError(error);
    }
  }, [saveFunction, data, onSuccess, onError]);

  const { debouncedCallback: debouncedSave, cancel, flush } = useDebounce(
    performSave,
    delay
  );

  // Auto-save when data changes (skip initial render)
  React.useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (enabled && data) {
      debouncedSave();
    }

    return () => {
      cancel();
    };
  }, [data, enabled, debouncedSave, cancel]);

  return {
    saveNow: flush,
    cancelAutoSave: cancel,
    isAutoSaveEnabled: enabled
  };
};