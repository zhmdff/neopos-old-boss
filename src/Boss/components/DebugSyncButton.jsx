import React, { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import api from '../../api/axios';

const DebugSyncButton = () => {
  const [syncing, setSyncing] = useState(false);

  const triggerSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await api.post('/System/trigger-sync');
      alert('Sinxronizasiya tamamlandı.');
    } catch (e) {
      console.error('Manual sync failed:', e);
      alert('Sinxronizasiya xətası: ' + (e.response?.data?.message || e.message));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button 
      onClick={triggerSync}
      disabled={syncing}
      className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-[#0ea5e9] hover:bg-sky-50 transition-all flex items-center justify-center border border-gray-100"
      title="Manual Sync to Master DB"
    >
      <FiRefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
    </button>
  );
};

export default DebugSyncButton;
