import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import api from '../../../api/axios';
import { PERMISSIONS } from '../../../data/permissions';

const RoleAddModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAz: '',
    isAdmin: false,
    permissions: [] 
  });

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
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const companyId = user?.companyId || user?.CompanyId;

      const payload = {
        nameAz: formData.nameAz,
        isAdmin: false,
        companyId: companyId,
        permissions: formData.permissions // Backend-dəki List<int> Permissions
      };

      await api.post('/Roles', payload);
      onRefresh();
      onClose();
      setFormData({ nameAz: '', isAdmin: false, permissions: [] });
    } catch (err) {
      alert(err.response?.data?.message || "Yenilənmə xətası!");
      alert("Xəta baş verdi!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 uppercase">Yeni Vəzifə</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FiX size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Vəzifə Adı</label>
            <input 
              type="text" required value={formData.nameAz}
              onChange={e => setFormData({...formData, nameAz: e.target.value})}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
              placeholder="Məs: Ofisiant"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Səlahiyyətlər</label>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1 custom-scrollbar">
              {PERMISSIONS.map(p => (
                <div 
                  key={p.id} onClick={() => handlePermissionChange(p.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                    formData.permissions.includes(p.id) ? 'border-[#0ea5e9] bg-sky-50 text-[#0ea5e9]' : 'border-gray-100 bg-white text-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${formData.permissions.includes(p.id) ? 'bg-[#0ea5e9] border-[#0ea5e9]' : 'border-gray-200'}`}>
                    {formData.permissions.includes(p.id) && <FiCheck className="text-white" size={12} strokeWidth={4} />}
                  </div>
                  <span className="text-sm font-bold">{p.nameAz}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#0ea5e9] text-white py-5 rounded-4xl font-black text-lg disabled:opacity-50">
            {loading ? "GÖZLƏYİN..." : "YADDA SAXLA"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleAddModal;