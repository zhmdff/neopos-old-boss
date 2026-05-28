import React from 'react';
import { FiX, FiClock, FiUser, FiMapPin, FiCreditCard, FiShoppingBag, FiZap, FiDollarSign, FiUsers } from 'react-icons/fi';
import moment from 'moment';

const CheckDetailModal = ({ check, onClose, showGuestDetail = false }) => {
  if (!check) return null;

  const guestN = (() => {
    const v = check.guestCount ?? check.GuestCount;
    if (v == null || v === '') return null;
    const n = Math.trunc(Number(v));
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  const getPaymentLabel = (method, customName) => {
    const custom = String(customName ?? '').trim();
    const m = Number(method);
    if (m === 4 || custom) return custom || 'Xüsusi ödəniş (şirkət üsulu)';
    if (m === 0) return 'NAĞD ÖDƏNİŞ';
    if (m === 1) return 'KART ÖDƏNİŞİ';
    if (m === 3) return 'NAĞD / KART (MIX)';
    return `DİGƏR (${m})`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl border border-white/20 text-left">
        
        {/* HEADER */}
        <div className="p-8 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${check.closeTime ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${check.closeTime ? 'text-emerald-500' : 'text-rose-500'}`}>
                {check.closeTime ? 'Qapalı Çek' : 'Aktiv Masa'}
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">Çek #{check.checkNumber}</h3>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-all border border-gray-100"><FiX size={24} /></button>
        </div>

        {/* BODY */}
        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 font-sans">
            <InfoBox icon={<FiMapPin />} label="Masa / Zal" value={`${check.tableName} / ${check.hallName || '---'}`} />
            <InfoBox icon={<FiUser />} label="Kassir" value={check.cashierName || 'Sistem'} />
            {showGuestDetail && guestN != null && (
              <InfoBox icon={<FiUsers />} label="Qonaq sayı" value={`${guestN} nəfər`} />
            )}
            
            <InfoBox 
                icon={<FiClock />} 
                label="Açılış Saatı" 
                value={moment.utc(check.openTime).format('DD.MM.YYYY | HH:mm')} 
            />
            <InfoBox 
                icon={<FiClock />} 
                label="Bağlanış Saatı" 
                value={check.closeTime ? moment.utc(check.closeTime).format('DD.MM.YYYY | HH:mm') : 'Hələ Açıqdır'} 
            />
            
            <InfoBox
              icon={<FiCreditCard />}
              label="Ödəniş Üsulu"
              value={
                check.closeTime
                  ? getPaymentLabel(check.paymentMethod, check.customPaymentMethodName ?? check.CustomPaymentMethodName)
                  : '---'
              }
            />
            {check.depositAmount > 0 && <InfoBox icon={<FiZap />} label="Depozit Məbləği" value={`${check.depositAmount.toFixed(2)} ₼`} />}
          </div>

          {/* PRODUCTS LIST */}
          <div className="mb-8">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Məhsullar</p>
            <div className="bg-slate-50/50 rounded-[30px] p-6 border border-gray-50 space-y-4">
              {check.orderDetails?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 uppercase text-sm italic">{item.productName}</p>
                    <p className="text-[10px] text-gray-400 font-bold italic">{item.quantity} x {item.price.toFixed(2)} ₼</p>
                  </div>
                  <p className="font-black text-slate-900 italic">{(item.quantity * item.price).toFixed(2)} ₼</p>
                </div>
              ))}
            </div>
          </div>

          {/* TOTAL FOOTER CARD */}
          <div className={`${check.closeTime ? 'bg-[#0ea5e9]' : 'bg-slate-800'} text-white rounded-[35px] p-8 shadow-xl shadow-blue-200 transition-colors duration-500`}>
            <div className="space-y-3">
              <div className="flex justify-between text-xs opacity-70 font-bold uppercase tracking-widest">
                <span>Məhsullar Cəmi</span>
                <span>{(check.totalAmount - (check.serviceAmount || 0) + (check.discountAmount || 0)).toFixed(2)} ₼</span>
              </div>
              <div className="flex justify-between text-xs opacity-70 font-bold uppercase tracking-widest">
                <span>Xidmət Haqqı ({check.servicePercentage}%)</span>
                <span>{(check.serviceAmount || 0).toFixed(2)} ₼</span>
              </div>
              {check.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-rose-300 font-bold uppercase tracking-widest">
                  <span>Endirim</span>
                  <span>-{check.discountAmount.toFixed(2)} ₼</span>
                </div>
              )}
              
              <div className="pt-6 mt-4 border-t border-white/20">
                {/* 🔥 QARIŞIQ ÖDƏNİŞ DETALLARI (Yalnız MIX ödənişdə və bağlı çekdə görünür) */}
                {Number(check.paymentMethod) === 3 && check.closeTime && (
                  <div className="mb-4 space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-2"><FiDollarSign className="text-emerald-400"/> Nağd Ödəniş:</div>
                      <span className="text-emerald-400">{check.paidCash?.toFixed(2)} ₼</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-2"><FiCreditCard className="text-amber-400"/> Kart Ödənişi:</div>
                      <span className="text-amber-400">{check.paidCard?.toFixed(2)} ₼</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-end">
                    <div>
                    <span className="text-xs font-bold opacity-60 uppercase block mb-1">
                        {check.closeTime ? 'Yekun Ödəniş' : 'Cari Məbləğ'}
                    </span>
                    <span className="text-sm font-black bg-white/10 px-3 py-1 rounded-lg border border-white/10 italic">
                        {check.closeTime
                          ? getPaymentLabel(
                              check.paymentMethod,
                              check.customPaymentMethodName ?? check.CustomPaymentMethodName
                            )
                          : 'GÖZLƏNİLİR'}
                    </span>
                    </div>
                    <div className="text-right font-black italic">
                    <span className="text-4xl tracking-tighter leading-none">{check.totalAmount?.toFixed(2)} ₼</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ icon, label, value }) => (
  <div className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-gray-50 shadow-sm hover:border-blue-100 transition-colors">
    <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center text-[#0ea5e9] shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-800 truncate italic">{value}</p>
    </div>
  </div>
);

export default CheckDetailModal;