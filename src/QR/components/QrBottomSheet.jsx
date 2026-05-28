import React from 'react';
import { FiX } from 'react-icons/fi';

export default function QrBottomSheet({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="mx-auto w-full max-w-lg animate-slideUp rounded-t-[1.75rem] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl ring-1 ring-gray-200 dark:bg-black dark:ring-white/10">
        <div className="relative mb-4 flex items-center justify-center">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition active:scale-95 dark:bg-[#1C1C1E] dark:text-white/80"
            aria-label="Bağla"
          >
            <FiX size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
