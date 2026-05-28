import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiPlus, FiUser, FiPhone, FiEdit2, FiTrash2, FiSearch, FiMapPin } from 'react-icons/fi';
import AddSupplierModal from '../components/Supplier/AddSupplierModal';
import EditSupplierModal from '../components/Supplier/EditSupplierModal';
import GlobalDeleteModal from '../components/GlobalDeleteModal';

const SuppliersPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const userData = JSON.parse(localStorage.getItem('user'));
  const companyId = userData?.companyId;

  useEffect(() => { if (companyId) fetchSuppliers(); }, [companyId]);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_URL}/Suppliers/company/${companyId}`);
      setSuppliers(res.data);
    } catch (err) { toast.error("Məlumatlar gəlmədi"); }
    finally { setLoading(false); }
  };

  const handleAdd = async (formData) => {
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/Suppliers`, { ...formData, companyId });
      toast.success("Tədarükçü əlavə edildi");
      setIsAddOpen(false);
      fetchSuppliers();
    } catch (err) { toast.error("Xəta baş verdi"); }
    finally { setActionLoading(false); }
  };

  const handleUpdate = async (formData) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/Suppliers/${selectedSupplier.id}`, { ...formData, companyId });
      toast.success("Məlumatlar yeniləndi");
      setIsEditOpen(false);
      fetchSuppliers();
    } catch (err) { toast.error("Xəta baş verdi"); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/Suppliers/${selectedSupplier.id}`);
      toast.success("Tədarükçü silindi");
      setIsDeleteOpen(false);
      fetchSuppliers();
    } catch (err) { toast.error(err.response?.data?.message || "Silmək mümkün olmadı"); }
    finally { setActionLoading(false); }
  };

  const filteredData = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-3 md:p-8 max-w-[1600px] mx-auto animate-fadeIn bg-[#f8fafc] min-h-screen italic font-black text-left">
      <Toaster position="top-right" />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center mb-6 gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 font-bold">
        <div className="flex items-center gap-4 text-left leading-none">
          <div className="w-14 h-14 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <FiUser size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#0f172a] uppercase tracking-tighter italic leading-none">Tədarükçülər</h1>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-2 not-italic font-bold italic leading-none">Mal aldığınız tərəfdaşlar</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 font-black italic">
          <div className="relative flex-1 sm:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Axtar..." 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#0ea5e9] transition-all italic shadow-inner outline-none" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => setIsAddOpen(true)} 
            className="bg-[#0ea5e9] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 not-italic"
          >
            <FiPlus size={18} /> Əlavə Et
          </button>
        </div>
      </div>

      {/* DATA CONTAINER */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden font-black italic">
        
        {/* DESKTOP TABLE - md breakpointindən yuxarı */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tədarükçü</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Telefon</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ünvan</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-black italic text-black">
              {loading ? (
                [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="4" className="px-8 py-6 h-20 bg-gray-50/30"></td></tr>)
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="4" className="px-8 py-24 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">Məlumat tapılmadı</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#0ea5e9] group-hover:text-white transition-all shadow-sm"><FiUser size={18} /></div>
                        <span className="font-black text-gray-800 uppercase italic tracking-tighter text-base leading-none">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <a href={`tel:${item.phoneNumber}`} className="font-black text-gray-600 text-sm italic hover:text-[#0ea5e9] transition-all flex items-center gap-2">
                        <FiPhone size={14} className="text-blue-400" />{item.phoneNumber || "—"}
                      </a>
                    </td>
                    <td className="px-8 py-5 font-black text-gray-500 text-xs italic">
                      <div className="flex items-center gap-2">
                         <FiMapPin size={14} className="text-gray-300" /> {item.address || "—"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => { setSelectedSupplier(item); setIsEditOpen(true); }} className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-amber-500 transition-all shadow-sm border border-transparent hover:border-amber-100"><FiEdit2 size={18} /></button>
                        <button onClick={() => { setSelectedSupplier(item); setIsDeleteOpen(true); }} className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-red-500 transition-all shadow-sm border border-transparent hover:border-red-100"><FiTrash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE LIST - md breakpointindən aşağı */}
        <div className="md:hidden divide-y divide-gray-50">
          {loading ? (
             <div className="p-10 text-center animate-pulse text-[#0ea5e9] font-black uppercase text-xs">Yüklənir...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs italic">Tədarükçü tapılmadı</div>
          ) : (
            filteredData.map((item) => (
              <div key={item.id} className="p-5 flex flex-col gap-4 hover:bg-gray-50 transition-all active:bg-sky-50/30">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-sm">
                      <FiUser size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#1e293b] uppercase tracking-tighter italic leading-none">{item.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest not-italic">Tədarükçü</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedSupplier(item); setIsEditOpen(true); }} className="w-11 h-11 bg-white border border-gray-100 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm"><FiEdit2 size={18} /></button>
                    <button onClick={() => { setSelectedSupplier(item); setIsDeleteOpen(true); }} className="w-11 h-11 bg-white border border-gray-100 text-red-500 rounded-2xl flex items-center justify-center shadow-sm"><FiTrash2 size={18} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                   <a href={`tel:${item.phoneNumber}`} className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <FiPhone size={14} className="text-[#0ea5e9] shrink-0" />
                      <span className="text-[11px] font-black italic truncate">{item.phoneNumber || "Nömrə yoxdur"}</span>
                   </a>
                   <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <FiMapPin size={14} className="text-gray-400 shrink-0" />
                      <span className="text-[11px] font-black italic truncate">{item.address || "Ünvan yoxdur"}</span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODALS */}
      <AddSupplierModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} loading={actionLoading} />
      <EditSupplierModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onUpdate={handleUpdate} supplier={selectedSupplier} loading={actionLoading} />
      <GlobalDeleteModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title={selectedSupplier?.name} loading={actionLoading} />
    </div>
  );
};

export default SuppliersPage;