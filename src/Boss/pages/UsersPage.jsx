import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser, FiLock, FiActivity } from 'react-icons/fi';
import api from '../../api/axios';
import UsersAddModal from '../components/Users/UserAddModal';
import UsersEditModal from '../components/Users/UsersEditModal';
import GlobalDeleteModal from '../components/GlobalDeleteModal';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const companyId = currentUser?.companyId;

  const fetchUsers = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await api.get(`/Users?companyId=${companyId}`);
      const filteredUsers = res.data.filter(u => 
        !u.roleIsAdmin && 
        u.roleNameEn !== "Admin" && 
        u.roleNameAz !== "Admin"
      );
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Yükləmə xətası:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const confirmDelete = async () => {
    if (!selectedUser || !companyId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/Users/${selectedUser.id}?companyId=${companyId}`);
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Silinmə zamanı xəta baş verdi!");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn p-4 md:p-8 bg-[#f8fafc] min-h-screen text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic leading-none">İstifadəçilər</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2 italic">Sistemə giriş icazəsi olan əməkdaşlar</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)} 
          className="w-full sm:w-auto bg-[#0ea5e9] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          <FiPlus strokeWidth={3} /> Yeni İstifadəçi
        </button>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-sky-50 border-t-[#0ea5e9] rounded-full animate-spin"></div>
            <span className="text-[#0ea5e9] font-black text-[10px] uppercase tracking-widest">Yüklənir...</span>
          </div>
        ) : users.length > 0 ? (
          <>
            {/* DESKTOP TABLE - md breakpointindən yuxarı */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                    <th className="px-8 py-6 font-black">Əməkdaş</th>
                    <th className="px-8 py-6 font-black">Vəzifə</th>
                    <th className="px-8 py-6 font-black text-center">PİN Kod</th>
                    <th className="px-8 py-6 font-black text-center">Status</th>
                    <th className="px-8 py-6 font-black text-right">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-sky-50 text-[#0ea5e9] rounded-xl flex items-center justify-center font-black border border-blue-100 uppercase shadow-sm group-hover:bg-[#0ea5e9] group-hover:text-white transition-all">
                            {u.fullName.charAt(0)}
                          </div>
                          <div className="text-left">
                            <div className="font-black text-[#1e293b] text-sm uppercase italic">{u.fullName}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black text-gray-600 uppercase bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                          {u.roleNameAz || u.roleName || 'Ofisiant'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center text-gray-400 font-mono tracking-widest font-black text-sm">
                        {u.pinCode}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${
                          u.isActive ? 'bg-green-50 text-green-500 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'
                        }`}>
                          {u.isActive ? 'Aktiv' : 'Deaktiv'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedUser(u); setIsEditOpen(true); }} 
                            className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#0ea5e9] hover:text-white transition-all shadow-sm"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(u); setIsDeleteOpen(true); }} 
                            className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS - lg breakpointindən aşağı */}
            <div className="lg:hidden divide-y divide-gray-50">
              {users.map((u) => (
                <div key={u.id} className="p-5 flex flex-col gap-4 hover:bg-gray-50 transition-all active:bg-sky-50/30">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center font-black border border-blue-100 text-lg uppercase shadow-sm">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-base uppercase leading-none italic tracking-tighter">{u.fullName}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">@{u.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedUser(u); setIsEditOpen(true); }} className="w-11 h-11 bg-white border border-gray-100 text-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-sm"><FiEdit2 size={18} /></button>
                      <button onClick={() => { setSelectedUser(u); setIsDeleteOpen(true); }} className="w-11 h-11 bg-white border border-gray-100 text-red-500 rounded-2xl flex items-center justify-center shadow-sm"><FiTrash2 size={18} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-gray-100">
                      <FiUser size={12} className="text-gray-400" />
                      <span className="text-[9px] font-black text-slate-600 uppercase text-center">{u.roleNameAz || 'Vəzifə'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-gray-100">
                      <FiLock size={12} className="text-gray-400" />
                      <span className="text-[10px] font-black text-slate-600 tracking-widest">{u.pinCode}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-gray-100">
                      <FiActivity size={12} className="text-gray-400" />
                      <span className={`text-[9px] font-black uppercase ${u.isActive ? 'text-green-500' : 'text-red-500'}`}>
                        {u.isActive ? 'Aktiv' : 'Yox'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                <FiSearch size={32} className="text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase italic">İstifadəçi tapılmadı</h3>
              <p className="text-gray-400 max-w-xs mx-auto text-xs font-bold uppercase tracking-widest mt-3 italic">
                Sistemdə hələ heç bir əməkdaş qeydiyyatı yoxdur.
              </p>
          </div>
        )}
      </div>

      <UsersAddModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onRefresh={fetchUsers} />
      {selectedUser && (
        <UsersEditModal 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          onRefresh={fetchUsers} 
          userData={selectedUser} 
        />
      )}
      <GlobalDeleteModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete} 
        title={selectedUser?.fullName} 
        description={`"${selectedUser?.fullName}" istifadəçisini silməyə əminsiniz?`}
        isLoading={deleteLoading} 
      />
    </div>
  );
};

export default UsersPage;