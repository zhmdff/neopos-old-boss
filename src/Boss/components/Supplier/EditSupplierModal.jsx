import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiPhone, FiMapPin, FiFileText, FiLoader, FiEdit3 } from 'react-icons/fi';

const EditSupplierModal = ({ isOpen, onClose, onUpdate, supplier, loading }) => {
  const [formData, setFormData] = useState({ name: '', phoneNumber: '', address: '', note: '' });

  useEffect(() => {
    if (supplier) setFormData({ 
      name: supplier.name, 
      phoneNumber: supplier.phoneNumber || '', 
      address: supplier.address || '', 
      note: supplier.note || '' 
    });
  }, [supplier]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp border border-gray-100">
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center text-[#0ea5e9] shadow-inner"><FiEdit3 size={20} /></div>
            <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Redaktə Et</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FiX size={20} className="text-gray-400" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onUpdate(formData); }} className="p-8 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tədarükçü Adı</label>
            <input required type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700 text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Telefon</label>
              <input type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700 text-sm" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ünvan</label>
              <input type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700 text-sm" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Qeyd</label>
            <textarea rows="2" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700 text-sm resize-none" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-[#0ea5e9] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-sky-600 transition-all active:scale-95 flex justify-center items-center gap-2">
            {loading ? <FiLoader className="animate-spin" /> : 'Yadda Saxla'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSupplierModal;