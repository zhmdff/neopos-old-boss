import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { FiX, FiClock, FiLoader, FiArrowUp, FiArrowDown, FiMapPin } from 'react-icons/fi';
import moment from 'moment';

const StockHistoryModal = ({ isOpen, onClose, product, companyId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (isOpen && product) {
      fetchHistory();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, product]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/StockHistories/company/${companyId}?pageNumber=1&pageSize=100`);
      const productHistory = res.data.items.filter(h => 
        h.productName === product.nameAz || h.productId === product.id
      );
      setHistory(productHistory);
    } catch (err) {
      console.error("Tarixçə gəlmədi");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] relative z-10 animate-modalShow border border-gray-100 overflow-hidden font-black italic text-left">
        
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0ea5e9] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
              <FiClock size={24} />
            </div>
            <div className="leading-none text-left">
              <h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tighter leading-none">{product?.nameAz}</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2 not-italic font-bold italic leading-none">Hərəkət Tarixçəsi</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90">
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc] custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <FiLoader className="animate-spin text-[#0ea5e9]" size={40} />
              <span className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Yüklənir...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-32 text-gray-300 font-black uppercase text-xs tracking-widest border-2 border-dashed border-gray-100 rounded-[2.5rem]">Məlumat tapılmadı</div>
          ) : (
            <div className="space-y-3">
              {history.map((h, index) => (
                <div key={index} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-[#0ea5e9]/20 transition-all">
                  
                  {/* 🔥 DÜZƏLİŞ BURADADIR: .utc().local() əlavə olundu */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-left leading-none">
                      <p className="text-xs text-gray-500 font-black italic">
                        {moment.utc(h.createdAt).local().format('DD.MM.YYYY')}
                      </p>
                      <p className="text-[10px] text-gray-300 font-bold mt-1.5 not-italic">
                        {moment.utc(h.createdAt).local().format('HH:mm')}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-gray-50 mx-1"></div>
                    <div className="text-left leading-none">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${h.changeAmount > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                        {h.movementTypeName}
                      </span>
                      <div className="flex items-center gap-1 text-[#0ea5e9] mt-1.5">
                        <FiMapPin size={10} />
                        <span className="text-[9px] font-black uppercase leading-none">{h.warehouseName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 px-8 py-3 bg-gray-50/50 rounded-2xl border border-gray-50">
                    <div className="text-center">
                      <p className="text-[8px] text-gray-400 uppercase mb-1">Əvvəl</p>
                      <p className="text-xs font-black text-gray-400 italic leading-none">{h.quantityBefore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-gray-400 uppercase mb-1">Hərəkət</p>
                      <div className={`flex items-center gap-0.5 text-sm font-black italic leading-none ${h.changeAmount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {h.changeAmount > 0 ? <FiArrowUp size={12}/> : <FiArrowDown size={12}/>}
                        {h.changeAmount > 0 ? `+${h.changeAmount}` : h.changeAmount}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-gray-400 uppercase mb-1">Sonra</p>
                      <p className="text-sm font-black text-[#1e293b] italic leading-none">{h.quantityAfter}</p>
                    </div>
                  </div>

                  <div className="flex-1 text-right min-w-0 hidden lg:block">
                    <p className="text-[10px] text-gray-400 font-bold italic truncate uppercase tracking-tighter" title={h.note}>
                      {h.note || "Qeyd yoxdur"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-10 py-5 border-t border-gray-50 bg-white flex justify-center shrink-0">
          <p className="text-[9px] text-gray-300 uppercase tracking-[0.3em] font-black not-italic">NeoPos Pro - Stok Audit Sistemi</p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default StockHistoryModal;