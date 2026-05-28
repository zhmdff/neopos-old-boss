import React, { useState } from 'react';
import { FiX, FiUser, FiPhone, FiMapPin, FiFileText, FiLoader } from 'react-icons/fi';

const AddSupplierModal = ({ isOpen, onClose, onAdd, loading }) => {
  const [formData, setFormData] = useState({ name: '', phoneNumber: '', address: '', note: '' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', phoneNumber: '', address: '', note: '' });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp border border-gray-100">
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Yeni Tədarükçü</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FiX size={20} className="text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tədarükçü Adı</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input required type="text" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700 text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Telefon</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700 text-sm" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ünvan</label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700 text-sm" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Qeyd</label>
            <div className="relative">
              <FiFileText className="absolute left-4 top-5 text-gray-400" />
              <textarea rows="2" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700 text-sm resize-none" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-[#0ea5e9] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-sky-600 transition-all active:scale-95 flex justify-center items-center gap-2">
            {loading ? <FiLoader className="animate-spin" /> : 'Tədarükçünü Yarat'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal;