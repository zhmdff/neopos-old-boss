import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiMapPin, FiLoader, FiEdit3, FiHome } from 'react-icons/fi';

const EditWarehouseModal = ({ isOpen, onClose, onUpdate, warehouse, loading }) => {
  const [formData, setFormData] = useState({ name: '', address: '', isDefaultSale: false });

  useEffect(() => {
    if (warehouse) setFormData({ 
        name: warehouse.name, 
        address: warehouse.address || '',
        isDefaultSale: warehouse.isDefaultSale // Köhnə statusu qoruyur, amma checkbox yoxdur deyə dəyişmir
    });
  }, [warehouse]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-modalShow relative z-10 border border-gray-100 font-black italic">
        
        <div className="px-8 py-6 flex justify-between items-center border-b border-gray-50">
          <div className="flex items-center gap-3 leading-none">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-inner">
               <FiEdit3 size={20} />
            </div>
            <h2 className="text-xl font-black text-[#1e293b] uppercase italic tracking-tighter leading-none">Məlumatı Yenilə</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"><FiX size={24} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onUpdate(formData); }} className="p-10 space-y-6 text-left bg-[#fafbfc]">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Anbar Adı</label>
            <div className="relative">
                <FiHome className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                required
                type="text"
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#0ea5e9] transition-all font-black italic shadow-sm outline-none text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Ünvan</label>
            <div className="relative">
               <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input
                 type="text"
                 className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#0ea5e9] transition-all font-black italic shadow-sm outline-none text-sm"
                 value={formData.address}
                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
               />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#1e293b] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex justify-center items-center gap-2 not-italic disabled:opacity-50"
          >
            {loading ? <FiLoader className="animate-spin" /> : 'Yadda Saxla'}
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditWarehouseModal;