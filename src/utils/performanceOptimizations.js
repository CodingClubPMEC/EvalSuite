/**
 * Performance optimization utilities
 */

// Debounce function for frequent operations
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function for limiting execution frequency
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization utility for expensive computations
export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return (...args) => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Prevent memory leaks by limiting cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// Performance measurement utility
export const measurePerformance = (name, fn) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
};

// Memory-efficient array processing
export const processInChunks = async (array, chunkSize, processor, onProgress) => {
  const results = [];
  const totalChunks = Math.ceil(array.length / chunkSize);
  
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    const chunkResults = await processor(chunk);
    results.push(...chunkResults);
    
    if (onProgress) {
      const progress = Math.ceil((i + chunkSize) / array.length * 100);
      onProgress(Math.min(progress, 100), Math.floor(i / chunkSize) + 1, totalChunks);
    }
    
    // Allow browser to breathe between chunks
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};

// Efficient object deep clone
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone(obj[key]);
    });
    return clonedObj;
  }
};

// Optimized event listener management
export class EventManager {
  constructor() {
    this.listeners = new Map();
  }

  add(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    
    if (!this.listeners.has(element)) {
      this.listeners.set(element, []);
    }
    
    this.listeners.get(element).push({ event, handler, options });
  }

  remove(element, event, handler) {
    element.removeEventListener(event, handler);
    
    if (this.listeners.has(element)) {
      const elementListeners = this.listeners.get(element);
      const index = elementListeners.findIndex(
        listener => listener.event === event && listener.handler === handler
      );
      
      if (index > -1) {
        elementListeners.splice(index, 1);
      }
    }
  }

  removeAll() {
    this.listeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    
    this.listeners.clear();
  }
}

// Resource preloading utilities
export const preloadResource = (href, as, crossorigin = null) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }
    
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`Failed to preload ${href}`));
    
    document.head.appendChild(link);
  });
};

// Critical resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
    { rel: 'prefetch', href: '/src/utils/excelExport.js' },
    { rel: 'prefetch', href: '/src/pages/AdminPage.jsx' }
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.assign(link, hint);
    document.head.appendChild(link);
  });
};

// Performance monitoring
export const performanceMonitor = {
  marks: new Map(),
  
  mark(name) {
    this.marks.set(name, performance.now());
  },
  
  measure(name, startMark) {
    const start = this.marks.get(startMark);
    const end = performance.now();
    
    if (start) {
      const duration = end - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    
    return 0;
  },
  
  clear() {
    this.marks.clear();
  }
};

// Bundle analysis helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    console.group('[Bundle Analysis]');
    console.log('Scripts:', scripts.length);
    console.log('Stylesheets:', stylesheets.length);
    
    scripts.forEach(script => {
      console.log(`Script: ${script.src}`);
    });
    
    stylesheets.forEach(link => {
      console.log(`Stylesheet: ${link.href}`);
    });
    
    console.groupEnd();
  }
};

// Export all utilities
export default {
  debounce,
  throttle,
  memoize,
  measurePerformance,
  processInChunks,
  deepClone,
  EventManager,
  preloadResource,
  addResourceHints,
  performanceMonitor,
  analyzeBundleSize
};