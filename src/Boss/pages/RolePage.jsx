import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiShield, FiMoreVertical } from 'react-icons/fi';
import api from '../../api/axios';
import RoleAddModal from '../components/Roles/RoleAddModal';
import RoleEditModal from '../components/Roles/RoleEditModal';
import GlobalDeleteModal from '../components/GlobalDeleteModal';

const RolePage = () => {
  const [roles, setRoles] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const companyId = user?.companyId;

  const fetchRoles = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await api.get(`/Roles?companyId=${companyId}`);
      const nonAdminRoles = res.data.filter(r => r.isAdmin === false);
      setRoles(nonAdminRoles);
    } catch (err) {
      console.error("Rollar yüklənərkən xəta:", err);
    }
  }, [companyId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openDeleteModal = (role) => {
    setSelectedRole(role);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRole || !companyId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/Roles/${selectedRole.id}?companyId=${companyId}`);
      setIsDeleteOpen(false);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Silinmə zamanı xəta!");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn p-4 md:p-8 bg-[#f8fafc] min-h-screen text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic leading-none">Vəzifələr</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2 italic">İşçi səlahiyyətlərinin idarə edilməsi</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto bg-[#0ea5e9] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest shadow-blue-100 shadow-lg"
        >
          <FiPlus strokeWidth={3} size={18} /> Yeni Vəzifə
        </button>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-black">
        
        {/* DESKTOP TABLE - md breakpointindən yuxarı */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                <th className="px-10 py-6 font-black">Sıra</th>
                <th className="px-10 py-6 font-black">Vəzifə Adı (AZ)</th>
                <th className="px-10 py-6 font-black text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {roles.length > 0 ? roles.map((role, index) => (
                <tr key={role.id} className="hover:bg-gray-50/50 transition-colors group font-black">
                  <td className="px-10 py-5 text-gray-300 font-black text-sm italic">#{index + 1}</td>
                  <td className="px-10 py-5 font-black text-[#1e293b] text-lg tracking-tighter uppercase italic">{role.nameAz}</td>
                  <td className="px-10 py-5">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => { setSelectedRole(role); setIsEditOpen(true); }}
                        className="p-3.5 bg-sky-50 text-[#0ea5e9] rounded-2xl hover:bg-[#0ea5e9] hover:text-white transition-all shadow-sm active:scale-90"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(role)}
                        className="p-3.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="3" className="p-24 text-center text-gray-300 font-black uppercase tracking-widest text-xs italic">Heç bir vəzifə tapılmadı</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS - md breakpointindən aşağı */}
        <div className="md:hidden divide-y divide-gray-50">
          {roles.length > 0 ? roles.map((role, index) => (
            <div key={role.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-all active:bg-sky-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-inner shrink-0 border border-blue-100">
                  <FiShield size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1e293b] uppercase tracking-tighter italic leading-none">{role.nameAz}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Sıra: #{index + 1}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedRole(role); setIsEditOpen(true); }}
                  className="w-11 h-11 bg-white border border-gray-100 text-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-sm active:scale-90"
                >
                  <FiEdit2 size={18} />
                </button>
                <button 
                  onClick={() => openDeleteModal(role)}
                  className="w-11 h-11 bg-white border border-gray-100 text-red-500 rounded-2xl flex items-center justify-center shadow-sm active:scale-90"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-16 text-center text-gray-300 font-black uppercase italic text-xs tracking-widest">Vəzifə yoxdur</div>
          )}
        </div>

      </div>

      {/* MODALS */}
      <RoleAddModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onRefresh={fetchRoles} />
      <RoleEditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onRefresh={fetchRoles} roleData={selectedRole} />
      <GlobalDeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title={selectedRole?.nameAz}
        description={`"${selectedRole?.nameAz}" vəzifəsini silməyə əminsiniz?`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default RolePage;