import { memo } from 'react';

const OfflineIndicator = memo(function OfflineIndicator({ isOnline }) {
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4 text-center text-sm font-semibold animate-fade-in">
      <div className="flex items-center justify-center space-x-2">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        <span>You are currently offline. Some features may not be available.</span>
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
      </div>
    </div>
  );
});

export default OfflineIndicator;