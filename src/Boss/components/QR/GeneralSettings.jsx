import React from "react";

const GeneralSettings = ({ settings, setSettings }) => {
  // Input dəyişikliyini idarə edən funksiya
  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-800 shadow-xl shadow-gray-200/40">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-[#0ea5e9] rounded-full"></div>
        <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-tighter">🌐 Ümumi Məlumatlar</h3>
      </div>

      <div className="space-y-5">
        {/* Wi-Fi Adı */}
        <div>
          <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Wi-Fi Adı</label>
          <input 
            value={settings.wifiName || ''} 
            onChange={e => handleChange('wifiName', e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold text-[#0f172a] focus:ring-2 focus:ring-[#0ea5e9]/10 outline-none transition-all placeholder:text-gray-300" 
            placeholder="Məs: NeoPos_Guest"
          />
        </div>

        {/* Wi-Fi Şifrəsi */}
        <div>
          <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Wi-Fi Şifrəsi</label>
          <input 
            value={settings.wifiPassword || ''} 
            onChange={e => handleChange('wifiPassword', e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold text-[#0f172a] focus:ring-2 focus:ring-[#0ea5e9]/10 outline-none transition-all" 
            placeholder="********"
          />
        </div>

        {/* İş Saatları */}
        <div>
          <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">İş Saatları</label>
          <input 
            value={settings.workingHours || ''} 
            onChange={e => handleChange('workingHours', e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold text-[#0f172a] focus:ring-2 focus:ring-[#0ea5e9]/10 outline-none transition-all" 
            placeholder="Məs: 09:00 - 23:00"
          />
        </div>

        {/* Xidmət Haqqı */}
        <div>
          <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Xidmət Haqqı (%)</label>
          <input 
            type="number"
            value={settings.serviceChargePercent ?? 0} 
            onChange={e => handleChange('serviceChargePercent', parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold text-[#0f172a] focus:ring-2 focus:ring-[#0ea5e9]/10 outline-none transition-all" 
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;