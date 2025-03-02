import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeIndicatorProps {
  isConnected: boolean;
}

const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({ isConnected }) => {
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-full shadow-md ${
      isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-xs font-medium">Canlı</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-xs font-medium">Çevrimdışı</span>
        </>
      )}
    </div>
  );
};

export default RealtimeIndicator;