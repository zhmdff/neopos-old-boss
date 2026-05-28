import React from 'react';
import { FiMapPin } from 'react-icons/fi';

const MapLocation = ({ settings, setSettings }) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full transition-all hover:shadow-md">
      {/* Başlıq */}
      <h3 className="text-sm font-black uppercase italic tracking-tighter text-[#0f172a] mb-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
          <FiMapPin size={18} />
        </div>
        Restoranın Ünvanı (Xəritə)
      </h3>

      <div className="flex flex-col flex-1 space-y-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
          Google Maps-də "Paylaş" bölməsindən "Xəritəni yerləşdirin" (Embed map) linkini bura yapışdırın.
        </p>
        
        {/* Textarea flex-1 sayəsində div-in içini tam dolduracaq */}
        <textarea 
          value={settings.mapLocationUrl || ''} 
          onChange={e => setSettings({...settings, mapLocationUrl: e.target.value})}
          placeholder="<iframe src='...'></iframe>"
          className="flex-1 w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:border-[#0ea5e9] focus:ring-4 focus:ring-blue-50 outline-none text-xs font-mono text-gray-600 resize-none transition-all placeholder:text-gray-300"
        />
        
      </div>
    </div>
  );
};

export default MapLocation;