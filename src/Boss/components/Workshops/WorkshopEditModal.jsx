import React, { useState, useEffect } from 'react';
import { FiX, FiPrinter, FiActivity } from 'react-icons/fi';
import api from '../../../api/axios';

const WorkshopEditModal = ({ isOpen, onClose, onRefresh, workshopData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    nameAz: '',
    isPrinting: true,
    printerType: '',
    printerValue: ''
  });

  useEffect(() => {
    if (workshopData && isOpen) {
      setFormData({
        id: workshopData.id,
        nameAz: workshopData.nameAz || '',
        isPrinting: workshopData.isPrinting ?? true,
        printerType: workshopData.printerType || 'None',
        printerValue: workshopData.printerValue || 'Default'
      });
    }
  }, [workshopData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Backend-in gözlədiyi WorkshopPutDto formatı
      const payload = {
        id: formData.id,
        nameAz: formData.nameAz,
        isPrinting: formData.isPrinting,
        companyId: user.companyId,
        printerType: formData.printerType,
        printerValue: formData.printerValue
      };

      await api.put('/Workshops', payload);
      
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Yeniləmə xətası:", err.response?.data);
      alert(err.response?.data?.message || "Yeniləmə zamanı xəta!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Redaktə Et</h2>
            <p className="text-[10px] font-bold text-[#0ea5e9] uppercase mt-2 italic tracking-widest">Məlumatları yenilə</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm text-gray-400 hover:text-red-500">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase ml-1 mb-2">
              <FiActivity className="text-[#0ea5e9]" /> Emalatxana Adı
            </label>
            <input 
              type="text" required 
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:bg-white transition-all font-bold text-gray-700" 
              value={formData.nameAz}
              onChange={e => setFormData({...formData, nameAz: e.target.value})} 
            />
          </div>

          <div className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-all ${formData.isPrinting ? 'bg-sky-50 text-[#0ea5e9]' : 'bg-gray-200 text-gray-400'}`}>
                <FiPrinter size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-800 uppercase leading-none">Çap Rejimi</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 italic">Sifariş çeki çıxsın?</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setFormData({...formData, isPrinting: !formData.isPrinting})}
              className={`w-14 h-8 rounded-full transition-all relative ${formData.isPrinting ? 'bg-[#0ea5e9]' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${formData.isPrinting ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {formData.isPrinting && (
            <div className="space-y-4 p-5 bg-gray-50 rounded-3xl border border-gray-100 animate-fadeIn">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 italic">Printer Tipi</label>
                <select 
                  className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700 text-sm"
                  value={formData.printerType}
                  onChange={e => setFormData({...formData, printerType: e.target.value})}
                >
                  <option value="None">Yoxdur</option>
                  <option value="Network">Şəbəkə (LAN IP)</option>
                  <option value="Default">Sistem Default</option>
                </select>
              </div>
              
              {formData.printerType === 'Network' && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 italic">Printer IP Ünvanı</label>
                  <input 
                    type="text" placeholder="Məs: 192.168.1.50"
                    className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700 text-sm" 
                    value={formData.printerValue}
                    onChange={e => setFormData({...formData, printerValue: e.target.value})} 
                  />
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" disabled={loading} 
            className="w-full bg-[#0ea5e9] text-white py-5 rounded-full font-black text-lg shadow-xl shadow-[#0ea5e9]/20 active:scale-[0.97] transition-all uppercase tracking-widest"
          >
            {loading ? "Yenilənir..." : "Dəyişiklikləri Saxla"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkshopEditModal;