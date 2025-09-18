import { useState, useEffect } from 'react';
import { getStorageInfo } from '../services/apiService';

const DataPersistenceStatus = ({ show = true, className = "" }) => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (show) {
      getStorageInfo().then(setStorageInfo).catch(console.error);
    }
  }, [show]);

  if (!show || !storageInfo || !storageInfo.storageSupported) {
    return null;
  }

  const getStatusColor = () => {
    if (!storageInfo.hasMainData) return 'text-red-500';
    if (!storageInfo.mainDataValid) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!storageInfo.hasMainData) return '❌';
    if (!storageInfo.mainDataValid) return '⚠️';
    return '✅';
  };

  const getStatusMessage = () => {
    if (!storageInfo.hasMainData) return 'Database disconnected';
    if (!storageInfo.mainDataValid) return 'Database connection error';
    if (storageInfo.connectionStatus === 'Connected') return 'Database connected';
    return 'Data saved to database';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm">{getStatusIcon()}</span>
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </span>
        </div>
        <span className="text-gray-400 text-xs">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100 mt-2 pt-2">
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Database Connection:</span>
              <span className={`font-medium ${storageInfo.connectionStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                {storageInfo.connectionStatus || 'Unknown'}
              </span>
            </div>
            
            {storageInfo.lastUpdated && (
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-medium">
                  {new Date(storageInfo.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Backup Available:</span>
              <span className={`font-medium ${storageInfo.hasBackup ? 'text-green-600' : 'text-gray-400'}`}>
                {storageInfo.hasBackup ? 'Yes' : 'No'}
              </span>
            </div>
            
            {storageInfo.estimatedSize > 0 && (
              <div className="flex justify-between">
                <span>Data Size:</span>
                <span className="font-medium">
                  {Math.round(storageInfo.estimatedSize / 1024)} KB
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              💡 Your evaluation data is automatically saved to the MongoDB database and synchronized in real-time across all sessions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPersistenceStatus;