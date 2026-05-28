import React, { useState, useEffect } from 'react';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      backgroundColor: '#ff9800',
      color: 'white',
      textAlign: 'center',
      padding: '10px',
      fontSize: '15px',
      fontWeight: 'bold',
      zIndex: 9999
    }}>
      ⚠️ İnternet bağlantısı yoxdur. Boss panel hazırda yalnız oxuma (keş) rejimindədir.
    </div>
  );
};

export default OfflineBanner;
