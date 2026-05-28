import React, { useState, useMemo, useEffect } from 'react';
import { FiEye, FiChevronLeft, FiChevronRight, FiSearch, FiMapPin, FiCreditCard, FiActivity, FiCheckCircle, FiLayout, FiUsers } from 'react-icons/fi';

function rowCloseTime(c) {
  return c?.closeTime ?? c?.CloseTime ?? null;
}

function rowIsClosed(c) {
  return !!rowCloseTime(c);
}

/** Sıralama: əvvəl açıq çeklər, sonra bağlı; hər qrupda tarixə görə (ən yeni üstə). */
function rowGuestCount(c) {
  const v = c?.guestCount ?? c?.GuestCount;
  if (v == null || v === '') return null;
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function rowSortTimestamp(c) {
  const raw =
    rowCloseTime(c) ??
    c?.orderTime ??
    c?.OrderTime ??
    c?.createdAt ??
    c?.CreatedAt ??
    c?.openTime ??
    c?.OpenTime ??
    c?.startTime ??
    c?.StartTime;
  if (!raw) return 0;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

const ChecksTable = ({ checks, onDetailClick, showGuestColumn = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHall, setFilterHall] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); 
  
  const itemsPerPage = 10;

  const halls = useMemo(() => ['all', ...new Set(checks.map(c => c.hallName).filter(Boolean))], [checks]);

  const filteredData = useMemo(
    () =>
      checks.filter((c) => {
        const isZeroEmptyOrder = !rowCloseTime(c) && Number(c.totalAmount) === 0;
        if (isZeroEmptyOrder) return false;

        const matchesSearch =
          c.checkNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.tableName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesHall = filterHall === 'all' || c.hallName === filterHall;
        const closed = rowIsClosed(c);
        const matchesStatus =
          filterStatus === 'all' ||
          (filterStatus === 'closed' && closed) ||
          (filterStatus === 'open' && !closed);
        const method = Number(c.paymentMethod ?? c.PaymentMethod);
        const hasCustom =
          method === 4 ||
          !!(c.customPaymentMethodId ?? c.CustomPaymentMethodId ?? null);
        const matchesPayment =
          filterPayment === 'all' ||
          (filterPayment === 'cash' && method === 0 && !hasCustom) ||
          (filterPayment === 'card' && method === 1 && !hasCustom) ||
          (filterPayment === 'split' && method === 3 && !hasCustom) ||
          (filterPayment === 'custom' && hasCustom);

        return matchesSearch && matchesHall && matchesPayment && matchesStatus;
      }),
    [checks, searchTerm, filterHall, filterPayment, filterStatus]
  );

  const sortedFilteredData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aOpen = !rowIsClosed(a);
      const bOpen = !rowIsClosed(b);
      if (aOpen !== bOpen) return aOpen ? -1 : 1;
      return rowSortTimestamp(b) - rowSortTimestamp(a);
    });
  }, [filteredData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [checks]);

  const totalPages = Math.ceil(sortedFilteredData.length / itemsPerPage);
  const currentItems = sortedFilteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (closeTime) => {
    const ct = closeTime ?? null;
    return ct ? (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase italic">
        <FiCheckCircle size={10} /> BAĞLI
      </span>
    ) : (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-100 uppercase italic animate-pulse">
        <FiActivity size={10} /> AÇIQ
      </span>
    );
  };

  const getPaymentBadge = (method, isClosed, customPaymentMethodName) => {
    if (!isClosed) return <span className="text-[10px] text-gray-300 font-black uppercase italic">---</span>;
    const custom = String(customPaymentMethodName ?? '').trim();
    const m = Number(method);
    if (m === 4 || custom) {
      const label = custom || 'Xüsusi ödəniş';
      return (
        <span
          className="inline-block max-w-[180px] truncate px-3 py-1 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-800 border border-indigo-100 uppercase italic"
          title={label}
        >
          {label}
        </span>
      );
    }
    if (m === 0) {
      return (
        <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase italic">
          NAĞD
        </span>
      );
    }
    if (m === 1) {
      return (
        <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-sky-50 text-blue-600 border border-blue-100 uppercase italic">
          KART
        </span>
      );
    }
    if (m === 3) {
      return (
        <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-purple-50 text-purple-600 border border-purple-100 uppercase italic">
          NAĞD/KART
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-gray-50 text-gray-400 border border-gray-100 uppercase italic">
        DİGƏR
      </span>
    );
  };

  return (
    <div className="bg-white overflow-hidden text-left">
      {/* FİLTRLƏR */}
      <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30">
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 font-sans">
          <div className="relative w-full xl:max-w-xs">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Axtar..." 
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-100 font-bold text-sm focus:border-[#0ea5e9] outline-none shadow-sm" 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
            />
          </div>
          
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 w-full xl:w-auto">
            <select className="bg-white border border-gray-100 rounded-xl px-3 py-3 text-[10px] font-black uppercase outline-none shadow-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Status</option>
              <option value="open">Açıq</option>
              <option value="closed">Bağlı</option>
            </select>
            <select className="bg-white border border-gray-100 rounded-xl px-3 py-3 text-[10px] font-black uppercase outline-none shadow-sm" value={filterHall} onChange={(e) => setFilterHall(e.target.value)}>
              <option value="all">Zal</option>
              {halls.filter(h => h !== 'all').map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <select className="col-span-2 md:col-auto bg-white border border-gray-100 rounded-xl px-3 py-3 text-[10px] font-black uppercase outline-none shadow-sm" value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
              <option value="all">Ödəniş Üsulu</option>
              <option value="cash">Nağd</option>
              <option value="card">Kart</option>
              <option value="split">Nağd/Kart</option>
              <option value="custom">Xüsusi üsul</option>
            </select>
          </div>
        </div>
      </div>

      {/* MOBİL GÖRÜNÜŞ */}
      <div className="block md:hidden divide-y divide-gray-50 px-4">
        {currentItems.map((check, index) => (
          <div key={check.id} className="py-5 flex flex-col gap-3 relative">
            {/* Mobildə Sıra Sayı */}
            <span className="absolute right-0 top-5 text-[10px] font-bold text-gray-300">#{(currentPage - 1) * itemsPerPage + index + 1}</span>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-slate-900 tracking-tighter text-lg italic">{check.checkNumber}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                   <span className="text-[11px] font-bold text-slate-600 uppercase italic bg-gray-100 px-2 py-0.5 rounded-md">{check.tableName}</span>
                   <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{check.hallName}</span>
                   {showGuestColumn && rowGuestCount(check) != null && (
                     <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                       <FiUsers size={11} /> {rowGuestCount(check)} qonaq
                     </span>
                   )}
                </div>
              </div>
              <p className="font-black text-[#0ea5e9] text-xl italic tracking-tighter leading-none pt-4">
                {check.totalAmount?.toFixed(2)} ₼
              </p>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {getStatusBadge(rowCloseTime(check))}
                {getPaymentBadge(
                  check.paymentMethod ?? check.PaymentMethod,
                  rowIsClosed(check),
                  check.customPaymentMethodName ?? check.CustomPaymentMethodName
                )}
              </div>
              <button 
                onClick={() => onDetailClick(check)} 
                className="px-5 py-2.5 bg-[#0ea5e9] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-90 transition-all"
              >
                DETALLAR
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP GÖRÜNÜŞ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-4 py-5 text-[10px] font-black uppercase text-gray-300 italic w-12 text-center">#</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Çek No</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Masa</th>
              {showGuestColumn && (
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Qonaq</th>
              )}
              <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Zal</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Status</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Ödəniş</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right italic font-black">Məbləğ</th>
              <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Bax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-sans text-black">
            {currentItems.map((check, index) => (
              <tr key={check.id} className="hover:bg-gray-50/50 transition-all">
                <td className="px-4 py-5 text-[11px] font-bold text-gray-300 text-center italic">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="px-6 py-5 font-black text-slate-700 tracking-tighter italic uppercase">{check.checkNumber}</td>
                <td className="px-6 py-5 font-bold text-slate-700 uppercase italic text-sm">{check.tableName}</td>
                {showGuestColumn && (
                  <td className="px-6 py-5 text-[11px] font-black text-slate-600">
                    {rowGuestCount(check) != null ? (
                      <span className="inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        <FiUsers size={12} /> {rowGuestCount(check)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-5 text-[10px] text-gray-400 font-black uppercase tracking-tighter">{check.hallName || "---"}</td>
                <td className="px-6 py-5">{getStatusBadge(rowCloseTime(check))}</td>
                <td className="px-6 py-5">
                  {getPaymentBadge(
                    check.paymentMethod ?? check.PaymentMethod,
                    rowIsClosed(check),
                    check.customPaymentMethodName ?? check.CustomPaymentMethodName
                  )}
                </td>
                <td className="px-6 py-5 font-black text-[#0ea5e9] text-right text-lg italic tracking-tighter">
                  {check.totalAmount?.toFixed(2)} ₼
                </td>
                <td className="px-6 py-5 text-center">
                  <button onClick={() => onDetailClick(check)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl inline-flex items-center justify-center hover:bg-[#0ea5e9] hover:text-white transition-all shadow-sm active:scale-90">
                    <FiEye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-50 flex justify-center items-center gap-3 bg-gray-50/10">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm disabled:opacity-20 hover:text-[#0ea5e9] transition-all"><FiChevronLeft size={20} /></button>
          <div className="px-5 py-2 bg-white rounded-xl border border-gray-100 shadow-sm min-w-[120px] text-center">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">{currentPage} / {totalPages}</span>
          </div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm disabled:opacity-20 hover:text-[#0ea5e9] transition-all"><FiChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
};

export default ChecksTable;