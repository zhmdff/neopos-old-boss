import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import BossModalRoot from './BossModalRoot';

const GlobalDeleteModal = ({ isOpen, onClose, onConfirm, title, loading = false }) => {
  return (
    <BossModalRoot isOpen={isOpen} onBackdropClose={loading ? undefined : onClose} maxWidth="max-w-md">
      <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl sm:rounded-[2.5rem]">
        <div className="p-6 flex justify-end">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <FiX size={20} className="text-gray-400" />
          </button>
        </div>
        
        <div className="px-8 pb-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle size={40} className="text-red-500" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-2">Əminsiniz?</h2>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            <span className="font-bold text-gray-800 italic">"{title}"</span> məlumatını silmək istəyirsiniz? <br /> 
            Bu əməliyyat geri qaytarıla bilməz.
          </p>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
            >
              Xeyr, qalsın
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Bəli, silinsin"
              )}
            </button>
          </div>
        </div>
      </div>
    </BossModalRoot>
  );
};

export default GlobalDeleteModal;