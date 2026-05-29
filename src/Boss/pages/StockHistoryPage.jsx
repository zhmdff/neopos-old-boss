import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiBox, FiSearch, FiClock, FiMapPin } from 'react-icons/fi';
import StockHistoryModal from '../components/StockHistory/StockHistoryModal';
import BossPaginationBar from '../components/common/BossPaginationBar';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const unitMapping = {
  "Piece": "ədəd", "Pcs": "ədəd", "Kilogram": "kq", "Gram": "qr",
  "Litre": "litr", "Millilitre": "ml", "1": "ədəd", "2": "kq",
  "3": "qr", "4": "litr", "5": "ml"
};

const StockHistoryPage = () => {
  const API_URL = getApiBaseUrl();
  const [data, setData] = useState({ items: [], totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const companyId = JSON.parse(localStorage.getItem('user'))?.companyId;

  useEffect(() => { 
    if (companyId) fetchStockStatus(); 
  }, [companyId, page, searchTerm]);

  const fetchStockStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/Products/stock-status`, {
        params: { 
          companyId, 
          skip: (page - 1) * pageSize, 
          take: pageSize, 
          search: searchTerm 
        }
      });
      setData(res.data || { items: [], totalCount: 0 });
    } catch (err) {
      toast.error("Məlumatlar yüklənmədi");
      setData({ items: [], totalCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize);

  return (
    <div className="p-3 md:p-8 max-w-[1600px] mx-auto animate-fadeIn font-black italic text-left bg-[#f8fafc] min-h-screen">
      <Toaster position="top-right" />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center mb-6 gap-6 bg-white p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 text-left leading-none">
          <div className="w-14 h-14 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <FiBox size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#0f172a] uppercase tracking-tighter italic leading-none">Anbar Stokları</h1>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-2 not-italic font-bold italic">
              Ümumi: {data?.totalCount || 0} məhsul
            </p>
          </div>
        </div>

        <div className="relative w-full xl:w-96 font-bold">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Məhsul axtar..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#0ea5e9] transition-all italic shadow-inner outline-none"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* DATA CONTAINER */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden font-black italic">
        
        {/* DESKTOP TABLE - md-dən yuxarı */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                <th className="px-8 py-5 text-[10px] text-gray-400 uppercase tracking-widest">Məhsul və Anbar Detalları</th>
                <th className="px-8 py-5 text-[10px] text-gray-400 uppercase tracking-widest text-center">Ümumi Stok</th>
                <th className="px-8 py-5 text-[10px] text-gray-400 uppercase tracking-widest text-center">Maya Dəyəri</th>
                <th className="px-8 py-5 text-[10px] text-gray-400 uppercase tracking-widest text-right">Tarixçə</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 italic">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan="4" className="h-24 px-8 py-5 bg-gray-50/10"></td></tr>
                ))
              ) : (
                data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-sky-50/30 transition-all font-bold group">
                    <td className="px-8 py-5 text-left min-w-[300px]">
                      <div className="flex flex-col gap-2">
                        <span className="text-[#1e293b] uppercase tracking-tighter text-base font-black italic leading-none">{item.nameAz}</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.warehouseDetails?.map((wh, idx) => (
                            <div key={idx} className="flex items-center bg-white border border-sky-50 px-2.5 py-1.5 rounded-xl shadow-sm">
                              <FiMapPin size={10} className="text-blue-400 mr-1.5" />
                              <span className="text-[9px] font-bold text-gray-400 uppercase mr-1.5 not-italic">{wh.warehouseName}:</span>
                              <span className={`text-[10px] font-black not-italic ${wh.quantity <= 0 ? 'text-red-500' : 'text-blue-600'}`}>
                                {wh.quantity} {unitMapping[item.unitName] || item.unitName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center font-black">
                      <span className={`px-5 py-2.5 rounded-2xl text-xs font-black italic border ${item.stock <= 5 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-[#0ea5e9]/5 text-[#0ea5e9] border-[#0ea5e9]/10'}`}>
                        {item.stock} {unitMapping[item.unitName] || item.unitName}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center text-gray-500 text-sm italic font-black">{item.costPrice?.toFixed(2)} ₼</td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => { setSelectedProduct(item); setIsHistoryOpen(true); }} className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#0ea5e9] hover:text-white transition-all shadow-sm group-hover:scale-110">
                        <FiClock size={18}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE LIST - lg-dən aşağı */}
        <div className="lg:hidden divide-y divide-gray-50">
          {loading ? (
             <div className="p-10 text-center animate-pulse text-[#0ea5e9] font-black uppercase text-xs">Yüklənir...</div>
          ) : data.items.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs italic">Məhsul tapılmadı</div>
          ) : (
            data.items.map((item) => (
              <div key={item.id} className="p-5 flex flex-col gap-4 hover:bg-gray-50 transition-all active:bg-sky-50/30">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-[#1e293b] uppercase tracking-tighter italic leading-tight">{item.nameAz}</h3>
                    <p className="text-[11px] text-[#0ea5e9] font-black mt-1 italic uppercase">Maya: {item.costPrice?.toFixed(2)} ₼</p>
                  </div>
                  <button onClick={() => { setSelectedProduct(item); setIsHistoryOpen(true); }} className="w-12 h-12 bg-white border border-gray-100 shadow-sm text-gray-400 rounded-2xl flex items-center justify-center">
                    <FiClock size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.warehouseDetails?.map((wh, idx) => (
                    <div key={idx} className="bg-gray-50 px-3 py-2 rounded-xl flex items-center gap-2 border border-gray-100">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">{wh.warehouseName}:</span>
                      <span className={`text-[11px] font-black ${wh.quantity <= 0 ? 'text-red-500' : 'text-blue-600'}`}>
                        {wh.quantity} {unitMapping[item.unitName] || item.unitName}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={`flex items-center justify-between p-4 rounded-2xl border ${item.stock <= 5 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-sky-50 border-blue-100 text-[#0ea5e9]'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">Cəmi Stok</span>
                  <span className="text-lg font-black italic">{item.stock} {unitMapping[item.unitName] || item.unitName}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="border-t border-gray-50 bg-white p-6 italic font-black">
            <BossPaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <StockHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} product={selectedProduct} companyId={companyId} />
    </div>
  );
};

export default StockHistoryPage;