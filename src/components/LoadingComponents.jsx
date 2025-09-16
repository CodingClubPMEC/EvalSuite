import React from 'react';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', color = 'orange' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    orange: 'border-orange-500',
    slate: 'border-slate-500',
    white: 'border-white',
    blue: 'border-blue-500'
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${colorClasses[color]}`} />
  );
};

// Loading Overlay Component
export const LoadingOverlay = ({ message = 'Loading...', isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200 text-center max-w-sm mx-4">
        <LoadingSpinner size="lg" color="orange" />
        <p className="mt-4 text-slate-800 font-semibold tracking-wide">{message}</p>
      </div>
    </div>
  );
};

// Page Loading Component
export const PageLoading = ({ message = 'Loading page...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8 text-center">
        <LoadingSpinner size="xl" color="white" />
        <p className="mt-6 text-white font-semibold tracking-wide text-lg">{message}</p>
      </div>
    </div>
  );
};

// Component Loading (for lazy loading)
export const ComponentLoading = ({ height = 'h-32' }) => {
  return (
    <div className={`${height} flex items-center justify-center bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-200`}>
      <LoadingSpinner size="lg" color="orange" />
    </div>
  );
};

// Button Loading State
export const ButtonLoading = ({ isLoading, children, ...props }) => {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm" color="white" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Table Loading Component
export const TableLoading = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="animate-pulse">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-t-lg">
        <div className="grid grid-cols-6 gap-4">
          {Array(columns).fill(0).map((_, i) => (
            <div key={i} className="h-4 bg-white/20 rounded"></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-b-lg p-4 space-y-3">
        {Array(rows).fill(0).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-6 gap-4">
            {Array(columns).fill(0).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};