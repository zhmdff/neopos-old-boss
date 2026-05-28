import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DailySalesChart = ({ data }) => {
  // Data yoxdursa placeholder göstər
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm w-full h-[450px] flex items-center justify-center">
        <p className="text-gray-300 font-black uppercase tracking-widest text-[10px]">Məlumat gözlənilir...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm w-full">
      <div className="p-8 pb-0 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tighter italic">Satış Analitikası</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Günlük Gəlir Axını</p>
        </div>
      </div>

      {/* 1. 'aspect' istifadə edirik (eni hündürlüyündən 2 dəfə çox olsun).
          2. 'min-w-0' əlavə edirik ki, flex-box daxilində sıxılma xətası verməsin.
      */}
      <div className="w-full min-w-0 h-[400px]"> 
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}}
              width={50}
            />
            <Tooltip 
              cursor={{ stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '5 5' }}
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0ea5e9" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailySalesChart;