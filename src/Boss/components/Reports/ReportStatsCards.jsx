import {
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiPieChart,
  FiCreditCard,
  FiActivity,
  FiPercent,
  FiLayers,
} from 'react-icons/fi';
import React, { useMemo } from 'react';
import { extractCustomPaymentTotals } from '../../../utils/reportCustomPaymentTotals';
import { reconcileShiftPaymentDisplay } from '../../../utils/reportPaymentDisplay';

function pickMoney(stats, camel, pascal) {
  const v = stats?.[camel] ?? stats?.[pascal];
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const customPayStyles = [
  { color: 'text-indigo-800', bg: 'bg-indigo-50' },
  { color: 'text-rose-800', bg: 'bg-rose-50' },
  { color: 'text-violet-800', bg: 'bg-violet-50' },
  { color: 'text-sky-800', bg: 'bg-sky-50' },
];

const ReportStatsCards = ({ stats }) => {
  const svc = pickMoney(stats, 'serviceFeeRevenue', 'ServiceFeeRevenue');
  const dep = pickMoney(stats, 'depositRevenue', 'DepositRevenue');

  const items = useMemo(() => {
    const customRows = extractCustomPaymentTotals(stats);
    const pay = reconcileShiftPaymentDisplay(stats || {});
    const head = [
      { title: 'Ümumi Satış', value: stats.totalRevenue, icon: <FiShoppingBag />, color: 'text-blue-600', bg: 'bg-sky-50' },
      { title: 'Nağd Satış', value: pay.cash, icon: <FiDollarSign />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { title: 'Kart Satış', value: pay.card, icon: <FiCreditCard />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];
    const customCards = customRows.map((r, i) => {
      const st = customPayStyles[i % customPayStyles.length];
      return {
        title: r.name,
        value: r.amount,
        icon: <FiLayers />,
        color: st.color,
        bg: st.bg,
      };
    });
    const tail = [
      { title: 'Xidmət haqqından gəlir', value: svc, icon: <FiPercent />, color: 'text-amber-700', bg: 'bg-amber-50' },
      { title: 'Depozitdən gəlir', value: dep, icon: <FiLayers />, color: 'text-violet-700', bg: 'bg-violet-50' },
      { title: 'Maya Dəyəri', value: stats.totalCost, icon: <FiPieChart />, color: 'text-orange-600', bg: 'bg-orange-50' },
      { title: 'Xalis Mənfəət', value: stats.totalProfit, icon: <FiTrendingUp />, color: 'text-rose-600', bg: 'bg-rose-50' },
      {
        title: 'Sifariş Sayı',
        value: stats.orderCount,
        icon: <FiActivity />,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        isPrice: false,
      },
    ];
    return [...head, ...customCards, ...tail];
  }, [stats, svc, dep]);

  return (
    // md:grid-cols-3 ilə hər sətirdə dəqiq 3 kart olmasını təmin edirik
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {items.map((item, idx) => (
        <div 
          key={`${item.title}-${idx}`} 
          className="bg-white p-7 rounded-[35px] shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
        >
          {/* Dekorativ arxa fon dairəsi */}
          <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${item.bg} opacity-40 rounded-full group-hover:scale-150 transition-transform duration-500`} />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className={`p-4 ${item.bg} ${item.color} rounded-2xl text-2xl shadow-sm group-hover:rotate-6 transition-transform`}>
              {item.icon}
            </div>
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.title}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
                {item.isPrice === false ? item.value : `${(item.value || 0).toFixed(2)} ₼`}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportStatsCards;