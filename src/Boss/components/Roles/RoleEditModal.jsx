import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiCheck, FiSave } from 'react-icons/fi';
import api from '../../../api/axios';
import { PERMISSIONS } from '../../../data/permissions';

const RoleEditModal = ({ isOpen, onClose, onRefresh, roleData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    nameAz: '',
    permissions: [],
    companyId: ''
  });

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const companyId = user?.companyId;

  const fetchRole = useCallback(async () => {
    if (!roleData?.id || !companyId) return;
    try {
      const res = await api.get(`/Roles/${roleData.id}?companyId=${companyId}`);
      setFormData({
        id: res.data.id,
        nameAz: res.data.nameAz,
        permissions: res.data.permissions || [],
        companyId: companyId
      });
    } catch (err) {
      console.error(err);
      onClose();
    }
  }, [roleData, companyId, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchRole();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, fetchRole]);

  const handlePermissionChange = (id) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter(pId => pId !== id)
        : [...prev.permissions, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) return;

    setLoading(true);
    try {
      const payload = {
        id: formData.id,
        nameAz: formData.nameAz,
        permissions: formData.permissions,
        companyId: companyId
      };

      await api.put(`/Roles?companyId=${companyId}`, payload);
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Xəta!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 !left-0 !top-0 w-screen h-screen z-[99999] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <form 
        onSubmit={handleSubmit}
        className="bg-white w-[95%] max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] border border-gray-100 relative z-10 animate-modalIn overflow-hidden text-black"
      >
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <div className="text-left">
            <h2 className="text-xl font-black text-[#0f172a] uppercase italic tracking-tighter">Vəzifə Redaktəsi</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Səlahiyyət səviyyəsini dəyişirsiniz</p>
          </div>
          <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-[#fafbfc]">
          <div className="space-y-2 text-left">
            <label className="text-xs font-black text-gray-400 uppercase ml-2 tracking-widest">Vəzifə Adı (AZ)</label>
            <input 
              type="text" 
              required 
              value={formData.nameAz}
              onChange={e => setFormData({...formData, nameAz: e.target.value})}
              className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#0ea5e9] outline-none font-bold transition-all text-black shadow-sm"
              placeholder="Məs: Ofisiant"
            />
          </div>

          <div className="space-y-4 text-left">
            <label className="text-xs font-black text-gray-400 uppercase ml-2 tracking-widest block">İcazələr və Səlahiyyətlər</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
              {PERMISSIONS.map(p => {
                const isSelected = formData.permissions.includes(p.id);
                return (
                  <div 
                    key={p.id} 
                    onClick={() => handlePermissionChange(p.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 active:scale-95 shadow-sm ${
                      isSelected 
                        ? 'border-[#0ea5e9] bg-sky-50/50 text-[#0ea5e9]' 
                        : 'border-white bg-white text-gray-400 hover:border-gray-100'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#0ea5e9] border-[#0ea5e9]' : 'border-gray-200'}`}>
                      {isSelected && <FiCheck className="text-white" size={14} strokeWidth={4} />}
                    </div>
                    <span className="text-sm font-black uppercase tracking-tight">{p.nameAz}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 bg-white flex gap-4 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all">Ləğv Et</button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-[2] py-4 bg-[#0ea5e9] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Gözləyin..." : <><FiSave size={16}/> Yeniləməni Saxla</>}
          </button>
        </div>
      </form>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modalIn { animation: modalIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RoleEditModal;