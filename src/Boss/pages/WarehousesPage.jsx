import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiPlus, FiHome, FiMapPin, FiEdit2, FiTrash2, FiSearch, FiCheckCircle } from 'react-icons/fi';
import AddWarehouseModal from '../components/Warehouse/AddWarehouseModal';
import EditWarehouseModal from '../components/Warehouse/EditWarehouseModal';
import GlobalDeleteModal from '../components/GlobalDeleteModal';

const WarehousesPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const userData = JSON.parse(localStorage.getItem('user'));
  const companyId = userData?.companyId;

  useEffect(() => { 
    if (companyId) fetchWarehouses(); 
  }, [companyId]);

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get(`${API_URL}/Warehouses/company/${companyId}`);
      setWarehouses(res.data);
    } catch (err) { 
      toast.error("Məlumatlar gəlmədi"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSetDefault = async (id) => {
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/Warehouses/${id}/set-default-sale?companyId=${companyId}`);
      toast.success("Satış anbarı təyin edildi!");
      fetchWarehouses();
    } catch (err) {
      toast.error("Xəta baş verdi");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredData = warehouses.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (formData) => {
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/Warehouses`, { ...formData, companyId });
      toast.success("Anbar yaradıldı");
      setIsAddOpen(false);
      fetchWarehouses();
    } catch (err) { toast.error(err.response?.data?.message || "Xəta!"); }
    finally { setActionLoading(false); }
  };

  const handleUpdate = async (formData) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/Warehouses/${selectedWarehouse.id}`, { ...formData, companyId });
      toast.success("Yeniləndi");
      setIsEditOpen(false);
      fetchWarehouses();
    } catch (err) { toast.error("Xəta!"); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/Warehouses/${selectedWarehouse.id}`);
      toast.success("Silindi");
      setIsDeleteOpen(false);
      fetchWarehouses();
    } catch (err) { toast.error("Silmək mümkün olmadı"); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="p-3 md:p-8 max-w-[1600px] mx-auto animate-fadeIn font-black italic text-left bg-[#f8fafc] min-h-screen">
      <Toaster position="top-right" />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center mb-6 gap-6 bg-white p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 text-left leading-none">
          <div className="w-14 h-14 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <FiHome size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#0f172a] uppercase tracking-tighter italic leading-none">Anbar Strukturu</h1>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-2 not-italic font-bold italic leading-none">{userData?.companyName}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 font-black italic">
          <div className="relative flex-1 sm:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Anbar axtar..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#0ea5e9] transition-all italic shadow-inner outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-[#0ea5e9] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 not-italic"
          >
            <FiPlus size={18} /> Yeni Anbar
          </button>
        </div>
      </div>

      {/* DATA CONTAINER */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden font-black italic">
        
        {/* DESKTOP TABLE - md-dən yuxarı */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                <th className="px-8 py-5 text-[10px] text-gray-400 uppercase tracking-widest">Anbar / Status</th>
                <th className="px-8 py-5 text-[10px] text-gray-400 uppercase tracking-widest">Ünvan</th>
                <th className="px-8 py-5 text-[10px] text-gray-400 uppercase tracking-widest text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 italic font-black">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse"><td colSpan="3" className="px-8 py-6 h-24 bg-gray-50/10"></td></tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="3" className="py-24 text-center text-gray-300 uppercase text-xs font-black tracking-widest italic">Məlumat tapılmadı</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-sky-50/30 transition-all font-bold group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <span className="font-black text-gray-800 uppercase italic tracking-tighter text-base leading-none">{item.name}</span>
                            {item.isDefaultSale && (
                                <span className="bg-green-50 text-green-600 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5 not-italic border border-green-100">
                                  <FiCheckCircle size={12} /> Satış Üçün Aktiv
                                </span>
                            )}
                        </div>
                        {!item.isDefaultSale && (
                            <button 
                                onClick={() => handleSetDefault(item.id)}
                                className="text-[10px] text-blue-500 font-black uppercase tracking-widest hover:text-[#0ea5e9] transition-colors w-fit underline decoration-2 underline-offset-4"
                            >
                                Satış Anbarı Et
                            </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5 text-gray-500 font-black italic text-sm">
                        <FiMapPin size={14} className="text-[#0ea5e9] shrink-0" />
                        <span className="truncate max-w-[200px] xl:max-w-md">{item.address || "ÜNVAN QEYD EDİLMƏYİB"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => { setSelectedWarehouse(item); setIsEditOpen(true); }}
                          className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button 
                          onClick={() => { setSelectedWarehouse(item); setIsDeleteOpen(true); }}
                          className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE LIST - md-dən aşağı */}
        <div className="md:hidden divide-y divide-gray-50">
          {loading ? (
             <div className="p-10 text-center animate-pulse text-[#0ea5e9] font-black uppercase text-xs">Yüklənir...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs italic">Anbar yoxdur</div>
          ) : (
            filteredData.map((item) => (
              <div key={item.id} className="p-5 flex flex-col gap-4 hover:bg-gray-50 transition-all active:bg-sky-50/30">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <span className="font-black text-slate-800 uppercase italic tracking-tighter text-lg leading-none">{item.name}</span>
                    {item.isDefaultSale ? (
                      <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-2 not-italic border border-green-100 w-fit">
                        <FiCheckCircle size={14} /> Satış Üçün Aktiv
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleSetDefault(item.id)}
                        className="text-[11px] text-[#0ea5e9] font-black uppercase tracking-widest underline decoration-2 underline-offset-4 w-fit"
                      >
                        Satış Anbarı Et
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedWarehouse(item); setIsEditOpen(true); }} className="w-11 h-11 bg-white border border-gray-100 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm"><FiEdit2 size={18} /></button>
                    <button onClick={() => { setSelectedWarehouse(item); setIsDeleteOpen(true); }} className="w-11 h-11 bg-white border border-gray-100 text-red-500 rounded-2xl flex items-center justify-center shadow-sm"><FiTrash2 size={18} /></button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-500 font-black italic text-[11px] bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <FiMapPin size={14} className="text-[#0ea5e9] shrink-0" />
                   <span>{item.address || "ÜNVAN QEYD EDİLMƏYİB"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddWarehouseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} loading={actionLoading} />
      <EditWarehouseModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onUpdate={handleUpdate} warehouse={selectedWarehouse} loading={actionLoading} />
      <GlobalDeleteModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title={selectedWarehouse?.name} loading={actionLoading} />
    </div>
  );
};

export default WarehousesPage;