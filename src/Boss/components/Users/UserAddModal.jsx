import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../../api/axios';
import PasswordInput from '../../../components/PasswordInput';

const UsersAddModal = ({ isOpen, onClose, onRefresh }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const companyId = currentUser?.companyId;

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    pinCode: '',
    phoneNumber: '',
    roleId: '',
    isActive: true
  });

  useEffect(() => {
    if (isOpen && companyId) {
      // Yalnız cari şirkətin vəzifələrini gətiririk
      api.get(`/Roles?companyId=${companyId}`)
        .then(res => setRoles(res.data.filter(r => !r.isAdmin)))
        .catch(err => console.error("Rollar gəlmədi", err));
    }
  }, [isOpen, companyId]);

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) setFormData({ ...formData, pinCode: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) return;

    if (formData.pinCode.length !== 4) return alert("PİN kod 4 rəqəmli olmalıdır!");
    if (formData.pinCode === "0000") return alert("Təhlükəsizlik üçün '0000' olmaz!");

    setLoading(true);
    try {
      // Backend-ə companyId ilə birlikdə göndəririk
      await api.post('/Users', { ...formData, companyId });
      onRefresh();
      onClose();
      setFormData({ fullName: '', username: '', password: '', pinCode: '', phoneNumber: '', roleId: '', isActive: true });
    } catch (err) {
      alert(err.response?.data?.message || "Xəta baş verdi!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden text-black animate-slideUp">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between text-left">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Yeni İstifadəçi</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Əməkdaş məlumatlarını daxil edin</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><FiX size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Ad Soyad</label>
              <input type="text" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0ea5e9] font-bold text-sm text-black" 
                value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">İstifadəçi Adı</label>
              <input type="text" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0ea5e9] font-bold text-sm text-black" 
                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Giriş Şifrəsi</label>
              <PasswordInput required className="w-full px-5 py-4 pr-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0ea5e9] font-bold text-sm text-black" 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">PİN Kod (4 rəqəm)</label>
              <input type="text" inputMode="numeric" required placeholder="****" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0ea5e9] tracking-[0.5em] font-black text-center text-black" 
                value={formData.pinCode} onChange={handlePinChange} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Vəzifə Seçimi</label>
              <select required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0ea5e9] font-bold text-sm text-black cursor-pointer"
                value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})}>
                <option value="">Seçin...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nameAz}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#0ea5e9] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? "Yadda saxlanılır..." : "İSTİFADƏÇİNİ TƏSDİQLƏ"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsersAddModal;