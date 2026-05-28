import React, { useState } from 'react';
import { FiX, FiUsers, FiDollarSign, FiClock, FiGrid, FiLayers } from 'react-icons/fi';
import api from '../../../api/axios';
import BossModalRoot from '../BossModalRoot';
import TableHourLimitField from './TableHourLimitField';
import { parseTableHourLimitInput } from '../../../utils/tableHourLimitInput';

const TableAddModal = ({ isOpen, onClose, onRefresh, hallId, hallName, onSwitchToBulkAdd, isTableHourActive = false }) => {
  const [loading, setLoading] = useState(false);
  
  // İlkin dəyərləri boş sətir edirik ki, placeholder və ya boş görünsün
  const [formData, setFormData] = useState({
    nameAz: '',
    capacity: 2,
    depositAmount: 0,
    depositStartTime: '', // Boş buraxıldı
    depositEndTime: '',
    tableHourLimit: '3:00',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
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
        nameAz: formData.nameAz,
        capacity: formData.capacity,
        depositAmount: formData.depositAmount,
        hallId: hallId,
        companyId: user.companyId,
        depositStartTime: formData.depositStartTime || null,
        depositEndTime: formData.depositEndTime || null,
        tableHourLimitMinutes: isTableHourActive ? tableHourLimitMinutes : null,
      };

      await api.post('/Tables', payload);
      
      onRefresh();
      onClose();
      setFormData({ nameAz: '', capacity: 2, depositAmount: 0, depositStartTime: '', depositEndTime: '', tableHourLimit: '3:00' });
    } catch (err) {
      alert(err.response?.data?.message || "Masa yaradılarkən xəta!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BossModalRoot isOpen={isOpen} onBackdropClose={onClose} maxWidth="max-w-lg">
      <div className="flex max-h-[min(90dvh,720px)] flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl sm:rounded-[2.5rem]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-50 bg-sky-50/20 px-6 py-5">
          <div className="min-w-0 pr-2">
            <h2 className="text-lg font-black uppercase leading-tight text-gray-900 sm:text-2xl">Masa əlavə et</h2>
            <p className="mt-2 text-[10px] font-bold uppercase italic tracking-widest text-[#0ea5e9]">Zal: {hallName}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-2xl p-2 text-gray-400 transition-all hover:bg-white">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">
          {typeof onSwitchToBulkAdd === 'function' ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                queueMicrotask(() => onSwitchToBulkAdd());
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 py-4 text-[11px] font-black uppercase tracking-widest text-emerald-800 transition hover:bg-emerald-100 active:scale-[0.99]"
            >
              <FiLayers size={18} />
              Toplu masa əlavə et
            </button>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-2 flex items-center gap-2"><FiGrid size={12}/> Masa Adı / Nömrəsi</label>
              <input 
                type="text" 
                required 
                placeholder="Məsələn: Masa 12" 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold" 
                value={formData.nameAz} 
                onChange={e => setFormData({...formData, nameAz: e.target.value})} 
              />
            </div>
            
            <div>
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-2 flex items-center gap-2"><FiUsers size={12}/> Tutum (Nəfər)</label>
              <input 
                type="number" 
                min="1" 
                required 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold" 
                value={formData.capacity} 
                onChange={e => setFormData({...formData, capacity: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-2 flex items-center gap-2"><FiDollarSign size={12}/> Depozit (AZN)</label>
              <input 
                type="number" 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold" 
                value={formData.depositAmount} 
                onChange={e => setFormData({...formData, depositAmount: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-2 flex items-center gap-2"><FiClock size={12}/> Başlama Vaxtı</label>
              <input 
                type="time" 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold" 
                value={formData.depositStartTime} 
                onChange={e => setFormData({...formData, depositStartTime: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-2 flex items-center gap-2"><FiClock size={12}/> Bitmə Vaxtı</label>
              <input 
                type="time" 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0ea5e9] font-bold" 
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
            className="mt-2 w-full rounded-[2rem] bg-[#0ea5e9] py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#0ea5e9]/20 transition-all active:scale-[0.99] sm:rounded-[2.5rem] sm:py-5 sm:text-lg"
          >
            {loading ? 'Yadda saxlanılır…' : 'Masanı yarat'}
          </button>
        </form>
      </div>
    </BossModalRoot>
  );
};

export default TableAddModal;