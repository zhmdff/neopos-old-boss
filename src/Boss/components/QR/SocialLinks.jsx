import React from "react";
import { FiInstagram, FiTwitter, FiFacebook } from "react-icons/fi"; // İkonlar əlavə etsən daha qəşəng olar

const SocialLinks = ({ settings, setSettings }) => {
  const toggleWA = (field) => setSettings({ ...settings, [field]: !settings[field] });

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-800 shadow-xl shadow-gray-200/40">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-[#0ea5e9] rounded-full"></div>
        <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-tighter">
          📱 Sosial Media & Əlaqə
        </h3>
      </div>

      <div className="space-y-5">
        {/* Instagram URL */}
        <div>
          <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Instagram URL</label>
          <input 
            placeholder="https://instagram.com/restoraniniz" 
            value={settings.instagramUrl || ''} 
            onChange={e => setSettings({...settings, instagramUrl: e.target.value})} 
            className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold text-[#0f172a] focus:ring-2 focus:ring-[#0ea5e9]/10 outline-none transition-all" 
          />
        </div>

        {/* TikTok URL */}
        <div>
          <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">TikTok URL</label>
          <input 
            placeholder="https://tiktok.com/@restoraniniz" 
            value={settings.tiktokUrl || ''} 
            onChange={e => setSettings({...settings, tiktokUrl: e.target.value})} 
            className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold text-[#0f172a] focus:ring-2 focus:ring-[#0ea5e9]/10 outline-none transition-all" 
          />
        </div>
        
        {/* WhatsApp Switcher Area */}
        <div className="pt-4 border-t border-gray-50">
          <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 mb-3 block">
            WhatsApp Statusu (Hansı nömrədə var?)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => {
              const fieldName = `phone${i}HasWhatsApp`;
              const isActive = settings[fieldName];
              return (
                <button 
                  key={i}
                  type="button"
                  onClick={() => toggleWA(fieldName)}
                  className={`
                    flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all duration-300
                    ${isActive 
                      ? 'bg-green-50 border-green-200 text-green-600 shadow-inner' 
                      : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}
                  `}
                >
                  <span className="text-[10px] font-black uppercase tracking-tighter">Tel {i}</span>
                  <span className="text-[8px] font-bold uppercase opacity-60">{isActive ? 'Aktiv' : 'Yoxdur'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;