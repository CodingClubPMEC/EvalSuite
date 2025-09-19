import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing memory and preventing memory leaks
 */
export const useMemoryManagement = () => {
  const timeouts = useRef(new Set());
  const intervals = useRef(new Set());
  const eventListeners = useRef(new Map());
  const abortControllers = useRef(new Set());

  // Managed setTimeout
  const createTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      callback();
      timeouts.current.delete(timeoutId);
    }, delay);
    
    timeouts.current.add(timeoutId);
    return timeoutId;
  }, []);

  // Managed setInterval
  const createInterval = useCallback((callback, delay) => {
    const intervalId = setInterval(callback, delay);
    intervals.current.add(intervalId);
    return intervalId;
  }, []);

  // Managed event listeners
  const addEventListener = useCallback((element, event, handler, options) => {
    element.addEventListener(event, handler, options);
    
    if (!eventListeners.current.has(element)) {
      eventListeners.current.set(element, []);
    }
    eventListeners.current.get(element).push({ event, handler, options });
  }, []);

  // Managed AbortController for fetch requests
  const createAbortController = useCallback(() => {
    const controller = new AbortController();
    abortControllers.current.add(controller);
    return controller;
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear timeouts
    timeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeouts.current.clear();

    // Clear intervals
    intervals.current.forEach(intervalId => clearInterval(intervalId));
    intervals.current.clear();

    // Remove event listeners
    eventListeners.current.forEach((listeners, element) => {
      listeners.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
    });
    eventListeners.current.clear();

    // Abort pending requests
    abortControllers.current.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
    abortControllers.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    createTimeout,
    createInterval,
    addEventListener,
    createAbortController,
    cleanup
  };
};

/**
 * Custom hook for optimizing React component re-renders
 */
export const useRenderOptimization = (deps = []) => {
  const renderCount = useRef(0);
  const lastDeps = useRef(deps);
  const forceUpdate = useRef(0);

  // Track render count
  renderCount.current += 1;

  // Check if dependencies changed
  const depsChanged = deps.some((dep, index) => {
    return dep !== lastDeps.current[index];
  });

  if (depsChanged) {
    lastDeps.current = deps;
  }

  // Force re-render function
  const forceRender = useCallback(() => {
    forceUpdate.current += 1;
  }, []);

  // Development warnings
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (renderCount.current > 100) {
        console.warn(`Component has rendered ${renderCount.current} times. Consider optimization.`);
      }
    }
  }, deps);

  return {
    renderCount: renderCount.current,
    depsChanged,
    forceRender
  };
};

/**
 * Custom hook for managing component state with persistence
 */
export const usePersistedState = (key, initialValue, storage = localStorage) => {
  const [state, setState] = useState(() => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading ${key} from storage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
      storage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error saving ${key} to storage:`, error);
    }
  }, [key, state, storage]);

  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setState(initialValue);
    } catch (error) {
      console.warn(`Error removing ${key} from storage:`, error);
    }
  }, [key, initialValue, storage]);

  return [state, setValue, removeValue];
};

/**
 * Custom hook for efficient batch updates
 */
export const useBatchUpdates = () => {
  const batchedUpdates = useRef([]);
  const timeoutRef = useRef(null);

  const batchUpdate = useCallback((updateFn) => {
    batchedUpdates.current.push(updateFn);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Apply all batched updates
      batchedUpdates.current.forEach(fn => fn());
      batchedUpdates.current = [];
      timeoutRef.current = null;
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

/**
 * Custom hook for detecting memory leaks
 */
export const useMemoryLeakDetector = (componentName) => {
  const mountTime = useRef(Date.now());
  const leakDetectors = useRef([]);

  const detectPotentialLeak = useCallback((resourceName, resourceCount) => {
    if (resourceCount > 100) {
      console.warn(`[Memory Leak] ${componentName} has ${resourceCount} ${resourceName}. Potential memory leak detected.`);
    }
  }, [componentName]);

  const trackResource = useCallback((resourceName, getResourceCount) => {
    const detector = setInterval(() => {
      const count = getResourceCount();
      detectPotentialLeak(resourceName, count);
    }, 10000); // Check every 10 seconds

    leakDetectors.current.push(detector);
  }, [detectPotentialLeak]);

  useEffect(() => {
    return () => {
      leakDetectors.current.forEach(detector => clearInterval(detector));
      
      const componentLifetime = Date.now() - mountTime.current;
      if (componentLifetime > 300000) { // 5 minutes
        console.info(`[Memory] ${componentName} lived for ${Math.round(componentLifetime / 1000)}s`);
      }
    };
  }, [componentName]);

  return { trackResource };
};