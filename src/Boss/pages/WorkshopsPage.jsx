import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiPrinter, FiSettings } from 'react-icons/fi';
import api from '../../api/axios';
import WorkshopAddModal from '../components/Workshops/WorkshopAddModal';
import WorkshopEditModal from '../components/Workshops/WorkshopEditModal';
import GlobalDeleteModal from '../components/GlobalDeleteModal';

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const companyId = user?.companyId;

  const fetchWorkshops = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await api.get(`/Workshops?companyId=${companyId}`);
      setWorkshops(res.data);
    } catch (err) {
      console.error("Emalatxanalar yüklənərkən xəta:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  const togglePrintStatus = async (workshop) => {
    if (!companyId) return;
    try {
      await api.put(`/Workshops`, {
        ...workshop,
        companyId: companyId,
        isPrinting: !workshop.isPrinting
      });
      fetchWorkshops();
    } catch (err) {
      alert(err.response?.data?.message || "Status dəyişdirilərkən xəta!");
    }
  };

  const handleDelete = async () => {
    if (!selectedWorkshop || !companyId) return;
    setIsActionLoading(true);
    try {
      await api.delete(`/Workshops/${selectedWorkshop.id}?companyId=${companyId}`);
      fetchWorkshops();
      setIsDeleteOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Silinmə zamanı xəta baş verdi!");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      
      {/* HEADER - Mobildə alt-alta, Tabletdə yan-yana */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic leading-none">Emalatxanalar</h1>
          <p className="text-gray-400 font-bold mt-2 text-[10px] uppercase tracking-widest italic">Hazırlıq nöqtələri və çap tənzimləmələri</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto bg-[#0ea5e9] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          <FiPlus strokeWidth={3} size={18} /> Yeni Emalatxana
        </button>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-100">
        
        {/* DESKTOP TABLE HEADER - Mobildə gizlədilir */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-6 bg-gray-50/50 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
          <div className="col-span-5">Emalatxana Adı</div>
          <div className="col-span-4 text-center">Çap Statusu</div>
          <div className="col-span-3 text-right">Əməliyyatlar</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-[#0ea5e9] rounded-full animate-spin"></div>
            <p className="text-[#0ea5e9] font-black italic tracking-widest uppercase text-[10px]">Məlumatlar gətirilir...</p>
          </div>
        ) : workshops.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="group">
                
                {/* DESKTOP ROW - md: grid */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-6 items-center hover:bg-gray-50/30 transition-all">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        <FiPrinter size={20} />
                    </div>
                    <span className="font-bold text-gray-700 text-lg tracking-tight">{workshop.nameAz}</span>
                  </div>

                  <div className="col-span-4 flex justify-center">
                    <button 
                      onClick={() => togglePrintStatus(workshop)}
                      className={`w-14 h-7 rounded-full relative transition-all duration-300 ${workshop.isPrinting ? 'bg-[#0ea5e9]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${workshop.isPrinting ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="col-span-3 flex justify-end gap-2 text-black">
                    <button 
                      onClick={() => { setSelectedWorkshop(workshop); setIsEditOpen(true); }}
                      className="p-3 bg-white border border-gray-100 text-[#0ea5e9] rounded-xl hover:bg-sky-50 transition-all"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => { setSelectedWorkshop(workshop); setIsDeleteOpen(true); }}
                      className="p-3 bg-white border border-gray-100 text-[#ef4444] rounded-xl hover:bg-red-50 transition-all"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* MOBILE CARD - md: hidden */}
                <div className="md:hidden p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center">
                            <FiPrinter size={22} />
                        </div>
                        <div>
                            <p className="font-black text-slate-800 text-lg leading-none">{workshop.nameAz}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest italic">Emalatxana</p>
                        </div>
                    </div>
                    <button 
                      onClick={() => togglePrintStatus(workshop)}
                      className={`w-14 h-7 rounded-full relative transition-all duration-300 ${workshop.isPrinting ? 'bg-[#0ea5e9]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${workshop.isPrinting ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => { setSelectedWorkshop(workshop); setIsEditOpen(true); }}
                      className="flex-1 py-4 bg-gray-50 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <FiEdit2 size={14} /> Düzəliş
                    </button>
                    <button 
                      onClick={() => { setSelectedWorkshop(workshop); setIsDeleteOpen(true); }}
                      className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <FiTrash2 size={14} /> Sil
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <FiSettings size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Heç bir emalatxana tapılmadı.</p>
          </div>
        )}
      </div>

      {/* MODALLAR */}
      <WorkshopAddModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onRefresh={fetchWorkshops} 
      />

      <WorkshopEditModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onRefresh={fetchWorkshops} 
        workshopData={selectedWorkshop}
      />

      <GlobalDeleteModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDelete}
        title="Emalatxanani Sil"
        description={`"${selectedWorkshop?.nameAz}" emalatxanasını silmək istədiyinizə əminsiniz?`}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default WorkshopsPage;