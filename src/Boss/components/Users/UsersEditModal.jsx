import React, { useState, useEffect, useCallback } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import api from '../../../api/axios';

const UsersEditModal = ({ isOpen, onClose, onRefresh, userData }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1. Şirkət ID-sini localstorage-dən çəkirik
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const companyId = currentUser?.companyId;

  const [formData, setFormData] = useState({
    id: '', 
    fullName: '', 
    username: '', 
    pinCode: '', 
    roleId: '', 
    isActive: true,
    companyId: '' // Update zamanı mütləqdir
  });

  // 2. Vəzifələri yalnız bu şirkətə görə çəkən funksiya
  const fetchRoles = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await api.get(`/Roles?companyId=${companyId}`);
      // Sistem adminlərini siyahıdan çıxarırıq
      setRoles(res.data.filter(r => !r.isAdmin));
    } catch (err) {
      console.error("Vəzifələr yüklənərkən xəta:", err);
    }
  }, [companyId]);

  useEffect(() => {
    if (isOpen && userData && companyId) {
      setFormData({
        id: userData.id,
        fullName: userData.fullName,
        username: userData.username,
        pinCode: userData.pinCode,
        roleId: userData.roleId,
        isActive: userData.isActive,
        companyId: companyId
      });
      fetchRoles();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, userData, companyId, fetchRoles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) return alert("Şirkət məlumatı tapılmadı!");

    setLoading(true);
    try {
      // Backend-dəki UpdateAsync(dto) metoduna uyğun sorğu
      await api.put('/Users', {
        ...formData,
        companyId: companyId // Body daxilində göndəririk
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Yenilənmə xətası!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn text-black">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-sky-50/30 text-left">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">İşçini Redaktə Et</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">@{formData.username} məlumatlarını yeniləyirsiniz</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
          {/* Ad Soyad */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Ad Soyad</label>
            <input 
              type="text" 
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0ea5e9] font-bold text-sm text-black transition-all" 
              value={formData.fullName} 
              onChange={e => setFormData({...formData, fullName: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* PİN Kod */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">PİN Kod (4 rəqəm)</label>
              <input 
                type="text" 
                maxLength={4}
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0ea5e9] font-black text-center tracking-[0.3em] text-black transition-all" 
                value={formData.pinCode} 
                onChange={e => setFormData({...formData, pinCode: e.target.value.replace(/\D/g, '')})} 
              />
            </div>

            {/* Vəzifə */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Vəzifə</label>
              <select 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0ea5e9] font-bold text-sm text-black cursor-pointer transition-all"
                value={formData.roleId} 
                onChange={e => setFormData({...formData, roleId: e.target.value})}
              >
                {roles.map(r => <option key={r.id} value={r.id}>{r.nameAz}</option>)}
              </select>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Giriş İcazəsi (Aktiv)</span>
             <button 
                type="button"
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.isActive ? 'bg-green-500' : 'bg-red-400'}`}
             >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.isActive ? 'right-1' : 'left-1'}`} />
             </button>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#0ea5e9] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Gözləyin..." : <><FiSave size={18} /> Dəyişiklikləri Saxla</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsersEditModal;