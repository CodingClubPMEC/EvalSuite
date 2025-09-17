import { memo, useState, useCallback } from 'react';
import { useLazyImage } from '../hooks/useIntersectionObserver';

/**
 * Optimized image component with lazy loading and error handling
 */
const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3C/svg%3E",
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
  ...props
}) {
  const [imageError, setImageError] = useState(false);
  
  // Use lazy loading hook for non-priority images
  const { ref: lazyRef, src: lazySrc, isLoaded, isError } = useLazyImage(
    priority ? '' : src,
    placeholder
  );

  // For priority images, load immediately
  const actualSrc = priority ? src : lazySrc;

  const handleLoad = useCallback((e) => {
    if (onLoad) onLoad(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    setImageError(true);
    if (onError) onError(e);
  }, [onError]);

  // Render error state
  if (imageError || isError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
        {...props}
      >
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <img
      ref={priority ? undefined : lazyRef}
      src={actualSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded || priority ? 'opacity-100' : 'opacity-50'} ${className}`}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
});

/**
 * Progressive image component that loads multiple sizes
 */
export const ProgressiveImage = memo(function ProgressiveImage({
  srcSet,
  sizes,
  src,
  alt,
  placeholder,
  className = '',
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    // Fallback to original src if srcSet fails
    if (currentSrc !== src) {
      setCurrentSrc(src);
    }
  }, [currentSrc, src]);

  return (
    <picture>
      {srcSet && (
        <source 
          srcSet={srcSet} 
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      <OptimizedImage
        src={currentSrc || src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-50'}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </picture>
  );
});

/**
 * Avatar image component with fallback
 */
export const AvatarImage = memo(function AvatarImage({
  src,
  alt,
  size = 40,
  fallbackText,
  className = '',
  ...props
}) {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const initials = fallbackText ? fallbackText.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  if (hasError || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        {...props}
      >
        {initials}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${className}`}
      width={size}
      height={size}
      onError={handleError}
      {...props}
    />
  );
});

export default OptimizedImage;