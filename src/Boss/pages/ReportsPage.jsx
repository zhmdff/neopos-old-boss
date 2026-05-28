import React, { useState, useEffect } from 'react';
import { format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { FiTrendingUp, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import ReportStatsCards from '../components/Reports/ReportStatsCards';
import DailySalesChart from '../components/Reports/DailySalesChart'; // Yeni qrafik
import api from '../../api/axios';

const ReportsPage = () => {
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalCash: 0,
    totalCard: 0,
    serviceFeeRevenue: 0,
    depositRevenue: 0,
    orderCount: 0,
    dailyReports: [],
  });

  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const [activeRange, setActiveRange] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [dateRange, activeRange]);

  const fetchReport = async () => {
    setLoading(true);
    const companyId = JSON.parse(localStorage.getItem('user'))?.companyId;

    try {
      let response;
      if (activeRange === 'shift') {
        const shiftRes = await api.get(`/CashShifts/active/${companyId}`);
        const shift = shiftRes.data || null;
        const shiftId = shift?.id ?? shift?.Id;
        if (!shiftId) {
          setReportData({
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            totalCash: 0,
            totalCard: 0,
            serviceFeeRevenue: 0,
            depositRevenue: 0,
            orderCount: 0,
            dailyReports: [],
          });
          return;
        }
        response = await api.get(`/Reports/shift/${shiftId}`, {
          params: { companyId, includeOpenTables: false },
        });
      } else {
        response = await api.get('/Reports/summary', {
          params: { start: dateRange.start, end: dateRange.end, companyId },
        });
      }
      

      const rawData = response.data.dailyReports || response.data.daily_reports || [];

      const formattedDaily = rawData.map(item => ({
        date: item.date ? format(new Date(item.date), 'dd MMM') : '---',

        revenue: parseFloat(item.totalRevenue || item.total_revenue || 0)
      }));


      setReportData({ 
        ...response.data, 
        dailyReports: formattedDaily 
      });
    } catch (err) {
      console.error("Hesabat xətası:", err);
    } finally {
      setLoading(false);
    }
  };

  const setQuickRange = (type) => {
    const today = new Date();
    let start;
    setActiveRange(type);
    if (type === 'shift') {
      setDateRange({
        start: format(today, 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
      });
      return;
    }
    if (type === 'today') start = today;
    else if (type === 'week') start = startOfWeek(today, { weekStartsOn: 1 });
    else if (type === 'month') start = startOfMonth(today);
    else if (type === 'year') start = startOfYear(today);

    setDateRange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd')
    });
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Maliyyə Analitikası</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Biznes Performans Hesabatı</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white p-1.5 rounded-[22px] shadow-sm border border-gray-100 flex gap-1">
            <RangeBtn label="Cari növbə" active={activeRange === 'shift'} onClick={() => setQuickRange('shift')} />
            <RangeBtn label="Bugün" active={activeRange === 'today'} onClick={() => setQuickRange('today')} />
            <RangeBtn label="Bu Həftə" active={activeRange === 'week'} onClick={() => setQuickRange('week')} />
            <RangeBtn label="Bu Ay" active={activeRange === 'month'} onClick={() => setQuickRange('month')} />
          </div>
          {/* ... Tarix seçimi və Refresh düyməsi eyni qalır ... */}
        </div>
      </div>

      {loading ? (
        <div className="py-40 text-center animate-pulse font-black text-gray-300 uppercase tracking-widest">Yüklənir...</div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700">
          <ReportStatsCards stats={reportData} />
          
          {/* QRAFİK BÖLMƏSİ */}
          <DailySalesChart data={reportData.dailyReports} />
        </div>
      )}
    </div>
  );
};

const RangeBtn = ({ label, onClick, active }) => (
  <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${active ? 'bg-[#0ea5e9] text-white' : 'hover:bg-gray-50 text-slate-500'}`}>
    {label}
  </button>
);

export default ReportsPage;