import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiPlus, FiShoppingBag, FiEye, FiCalendar, FiHash } from 'react-icons/fi';
import moment from 'moment';
import AddPurchaseModal from '../components/Purchases/AddPurchaseModal';
import PurchaseViewModal from '../components/Purchases/PurchaseViewModal';
import BossPaginationBar from '../components/common/BossPaginationBar';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const PurchasesPage = () => {
  const BASE_URL = getApiBaseUrl().replace(/\/api\/?$/i, '');

  const [data, setData] = useState({ items: [], totalCount: 0 });
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8; // Mobildə daha çox element görmək üçün artırdıq

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const userData = JSON.parse(localStorage.getItem('user'));
  const companyId = userData?.companyId;

  useEffect(() => {
    if (companyId) {
      fetchData();
      loadOptions();
    }
  }, [companyId, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/Purchases/company/${companyId}?pageNumber=${page}&pageSize=${pageSize}`);
      setData(res.data);
    } catch (err) {
      toast.error("Mədaxil siyahısı yüklənmədi");
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [p, s, w] = await Promise.all([
        axios.get(`${BASE_URL}/Products?companyId=${companyId}&take=1000`),
        axios.get(`${BASE_URL}/Suppliers/company/${companyId}`),
        axios.get(`${BASE_URL}/Warehouses/company/${companyId}`)
      ]);
      setProducts(p.data.items || p.data);
      setSuppliers(s.data);
      setWarehouses(w.data);
    } catch (err) {
      console.error("Filtr məlumatları gəlmədi:", err);
    }
  };

  const handleAdd = async (formData) => {
    setActionLoading(true);
    try {
      await axios.post(`${BASE_URL}/Purchases`, { ...formData, companyId });
      toast.success("Mədaxil uğurla tamamlandı!");
      setIsAddOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Sistem xətası baş verdi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedPurchase(item);
    setIsViewOpen(true);
  };

  const totalPages = Math.ceil(data.totalCount / pageSize);

  return (
    <div className="p-3 md:p-8 max-w-[1600px] mx-auto animate-fadeIn italic font-black text-left bg-[#f8fafc] min-h-screen">
      <Toaster position="top-right" />
      
      {/* HEADER - Mobildə alt-alta */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-inner">
            <FiShoppingBag size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1e293b] uppercase italic tracking-tighter leading-none">Tədarük Tarixçəsi</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 not-italic">Siyahı ({data.totalCount} sənəd)</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)} 
          className="w-full sm:w-auto bg-[#0ea5e9] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all not-italic"
        >
          + Yeni Mədaxil
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden not-italic font-black">
        
        {/* DESKTOP TABLE - md breakpointindən yuxarı görünür */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 italic">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarix</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Qaimə №</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Məbləğ</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 italic font-black text-black">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse"><td colSpan="4" className="h-20 px-8 py-5 bg-gray-50/10"></td></tr>
                ))
              ) : (
                data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-sky-50/30 transition-all group">
                    <td className="px-8 py-5 text-gray-500 text-xs italic">{moment(item.purchaseDate).format('DD.MM.YYYY')}</td>
                    <td className="px-8 py-5 text-gray-800 uppercase italic tracking-tighter text-sm font-black">{item.invoiceNumber}</td>
                    <td className="px-8 py-5 text-right font-black text-[#0ea5e9] text-sm">{item.totalAmount?.toFixed(2)} ₼</td>
                    <td className="px-8 py-5 text-center">
                      <button onClick={() => handleViewDetails(item)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-white hover:text-[#0ea5e9] hover:shadow-sm border border-transparent hover:border-gray-100 transition-all shadow-sm">
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE LIST - md breakpointindən aşağı görünür */}
        <div className="md:hidden divide-y divide-gray-50">
          {loading ? (
             <div className="p-10 text-center animate-pulse text-[#0ea5e9] font-black uppercase text-xs">Yüklənir...</div>
          ) : data.items.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs italic">Mədaxil yoxdur</div>
          ) : (
            data.items.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-all active:bg-sky-50">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiCalendar size={12} />
                    <span className="text-[10px] font-black italic">{moment(item.purchaseDate).format('DD.MM.YYYY')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiHash size={14} className="text-[#0ea5e9]" />
                    <span className="text-sm font-black italic tracking-tighter text-slate-800 uppercase">{item.invoiceNumber}</span>
                  </div>
                  <span className="text-lg font-black text-[#0ea5e9] italic mt-1">{item.totalAmount?.toFixed(2)} ₼</span>
                </div>
                <button 
                  onClick={() => handleViewDetails(item)}
                  className="w-12 h-12 bg-white border border-gray-100 shadow-sm text-[#0ea5e9] rounded-2xl flex items-center justify-center"
                >
                  <FiEye size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION - Mobildə daha sadə */}
        {totalPages > 1 && (
          <div className="border-t border-gray-50 bg-white p-6 font-black">
            <BossPaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <AddPurchaseModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onAdd={handleAdd} 
        products={products} 
        suppliers={suppliers} 
        warehouses={warehouses} 
        loading={actionLoading} 
      />
      
      <PurchaseViewModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        purchase={selectedPurchase} 
        allProducts={products} 
      />
    </div>
  );
};

export default PurchasesPage;