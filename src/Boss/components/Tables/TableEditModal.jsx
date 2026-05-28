import React, { useState, useEffect } from 'react';
import { FiX, FiUsers, FiDollarSign, FiClock, FiGrid } from 'react-icons/fi';
import api from '../../../api/axios';
import BossModalRoot from '../BossModalRoot';
import TableHourLimitField from './TableHourLimitField';
import { formatTableHourLimitMinutes, parseTableHourLimitInput } from '../../../utils/tableHourLimitInput';

const TableEditModal = ({ isOpen, onClose, onRefresh, tableData, isTableHourActive = false }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    nameAz: '',
    capacity: 2,
    depositAmount: 0,
    depositStartTime: '',
    depositEndTime: '',
    hallId: '',
    tableHourLimit: '3:00',
  });

  useEffect(() => {
    if (tableData && isOpen) {
      // Backend bəzən HallId, bəzən hallId qaytarır. Hər iki ehtimalı yoxlayırıq.
      const currentHallId = tableData.hallId || tableData.HallId;
      
      setFormData({
        id: tableData.id || '',
        nameAz: tableData.nameAz || '',
        capacity: tableData.capacity || 2,
        depositAmount: tableData.depositAmount || 0,
        // Backend-dən gələn 00:00:00 formatını 00:00 formatına salırıq
        depositStartTime: tableData.depositStartTime?.substring(0, 5) || '',
        depositEndTime: tableData.depositEndTime?.substring(0, 5) || '',
        hallId: currentHallId || '',
        tableHourLimit:
          formatTableHourLimitMinutes(
            tableData.tableHourLimitMinutes ?? tableData.TableHourLimitMinutes,
          ) || '3:00',
      });
    }
  }, [tableData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      // Backend TimeSpan (hh:mm:ss) formatı gözləyir. :00 əlavə edirik.
      let tableHourLimitMinutes = null;
      if (isTableHourActive) {
        tableHourLimitMinutes = parseTableHourLimitInput(formData.tableHourLimit);
        if (!tableHourLimitMinutes) {
          alert('Masa limitini daxil edin (məs. 3:00 və ya 1:30)');
          setLoading(false);
          return;
        }
      }

      const payload = {
        id: formData.id,
        nameAz: formData.nameAz,
        capacity: parseInt(formData.capacity),
        depositAmount: parseFloat(formData.depositAmount),
        depositStartTime: formData.depositStartTime ? `${formData.depositStartTime}:00` : null,
        depositEndTime: formData.depositEndTime ? `${formData.depositEndTime}:00` : null,
        hallId: formData.hallId,
        companyId: user?.companyId,
        tableHourLimitMinutes: isTableHourActive ? tableHourLimitMinutes : null,
      };

      // FK (Foreign Key) xətasının qarşısını almaq üçün son sığorta
      if (!payload.hallId || payload.hallId === "00000000-0000-0000-0000-000000000000") {
        alert("Zal məlumatı tapılmadı! Zəhmət olmasa siyahını yeniləyin.");
        setLoading(false);
        return;
      }

      await api.put('/Tables', payload);
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Yeniləmə xətası:", err);
      alert(err.response?.data?.message || "Məlumatlar yenilənmədi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BossModalRoot isOpen={isOpen} onBackdropClose={onClose} maxWidth="max-w-md">
      <div className="flex max-h-[min(90dvh,680px)] flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl sm:rounded-[2.5rem]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-50 bg-gray-50/50 px-6 py-5">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Masanı Yenilə</h2>
            <p className="text-[10px] font-bold text-[#0ea5e9] uppercase mt-2 tracking-widest italic leading-none">
              Zal məlumatları qorunur
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-red-500">
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase ml-1 mb-2">
              <FiGrid className="text-[#0ea5e9]" /> Masa Adı
            </label>
            <input 
              type="text" 
              required 
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold text-gray-700" 
              value={formData.nameAz}
              onChange={e => setFormData({...formData, nameAz: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase ml-1 mb-2">
                <FiUsers className="text-[#0ea5e9]" /> Tutum
              </label>
              <input 
                type="number" 
                required 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold" 
                value={formData.capacity}
                onChange={e => setFormData({...formData, capacity: e.target.value})} 
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase ml-1 mb-2">
                <FiDollarSign className="text-[#0ea5e9]" /> Depozit
              </label>
              <input 
                type="number" 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold" 
                value={formData.depositAmount}
                onChange={e => setFormData({...formData, depositAmount: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase ml-1 mb-2">
                <FiClock /> Başlama
              </label>
              <input 
                type="time" 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-black text-gray-700" 
                value={formData.depositStartTime}
                onChange={e => setFormData({...formData, depositStartTime: e.target.value})} 
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase ml-1 mb-2">
                <FiClock /> Bitmə
              </label>
              <input 
                type="time" 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-black text-gray-700" 
                value={formData.depositEndTime}
                onChange={e => setFormData({...formData, depositEndTime: e.target.value})} 
              />
            </div>
          </div>

          {isTableHourActive ? (
            <TableHourLimitField
              value={formData.tableHourLimit}
              onChange={(v) => setFormData((s) => ({ ...s, tableHourLimit: v }))}
            />
          ) : null}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#0ea5e9] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-[#0ea5e9]/20 active:scale-95 transition-all mt-4 uppercase tracking-widest"
          >
            {loading ? "Gözləyin..." : "DƏYİŞİKLİKLƏRİ SAXLA"}
          </button>
        </form>
      </div>
    </BossModalRoot>
  );
};

export default TableEditModal;