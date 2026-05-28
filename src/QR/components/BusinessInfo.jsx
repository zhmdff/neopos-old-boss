import React, { useState } from 'react';
import { 
  FiWifi, FiClock, FiMapPin, FiInstagram, 
  FiPhone, FiCopy, FiChevronRight 
} from 'react-icons/fi';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BusinessInfo = ({ settings, company }) => {
  const [showNumbers, setShowNumbers] = useState(false);

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";
    const cleaned = phoneNumber.replace(/\D/g, "");
    const match = cleaned.match(/^(994|0)?(50|51|55|70|77|99|10)(\d{3})(\d{2})(\d{2})$/);
    if (match) return `+994 ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
    return phoneNumber;
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Parol kopyalandı!", {
      style: { borderRadius: '15px', background: '#333', color: '#fff' }
    });
  };

  const contactNumbers = [
    { number: company?.phone1 || company?.phoneNumber1, hasWhatsapp: settings?.phone1HasWhatsApp },
    { number: company?.phone2 || company?.phoneNumber2, hasWhatsapp: settings?.phone2HasWhatsApp },
    { number: company?.phone3 || company?.phoneNumber3, hasWhatsapp: settings?.phone3HasWhatsApp }
  ].filter(item => item.number);

  const getCleanMapUrl = () => {
    let url = settings?.mapLocationUrl || settings?.MapLocationUrl || "";
    if (!url) return null;
    if (url.startsWith('/')) url = url.substring(1);
    if (!url.startsWith('http')) url = `https://${url}`;
    return url;
  };

  const mapUrl = getCleanMapUrl();

  return (
    <div className="px-4 py-8 space-y-6 max-w-5xl mx-auto animate-fadeIn transition-colors duration-300">
      
      {/* --- WIFI BÖLMƏSİ --- */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 text-[#0200fe] dark:text-blue-400 rounded-2xl flex items-center justify-center">
            <FiWifi size={22} />
          </div>
          <h3 className="font-black uppercase italic text-sm tracking-tight text-gray-800 dark:text-gray-100">Wi-Fi Məlumatları</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100/50 dark:border-gray-700/50">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Şəbəkə</span>
            <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{settings?.wifiName || "Guest_Access"}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100/50 dark:border-gray-700/50">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Parol</span>
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{settings?.wifiPassword || "---"}</span>
              {settings?.wifiPassword && (
                <button onClick={() => copyToClipboard(settings.wifiPassword)} className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm active:scale-90 transition-all border border-gray-100 dark:border-gray-600 dark:text-white">
                  <FiCopy size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- ƏLAQƏ (ACCORDION) --- */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-md">
        <button onClick={() => setShowNumbers(!showNumbers)} className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all">
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-100">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl flex items-center justify-center">
              <FiPhone size={22} />
            </div>
            <h3 className="font-black uppercase italic text-sm tracking-tight">Əlaqə</h3>
          </div>
          <div className="flex items-center gap-3">
             {!showNumbers && contactNumbers.length > 0 && (
               <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50 animate-pulse">
                 {formatPhoneNumber(contactNumbers[0].number)}
               </span>
             )}
             <FiChevronRight className={`text-gray-400 dark:text-gray-500 transition-transform duration-500 ${showNumbers ? 'rotate-90' : ''}`} size={20} />
          </div>
        </button>
        <div className={`transition-all duration-500 ease-in-out ${showNumbers ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="p-4 pt-0 space-y-3">
            {contactNumbers.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/80 p-4 rounded-[1.8rem] border border-gray-100/50 dark:border-gray-700/50 group hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all">
                <a href={`tel:${item.number}`} className="flex items-center gap-4 flex-1 text-left">
                  <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-gray-50 dark:border-gray-800"><FiPhone size={18} /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Zəng et</span>
                    <span className="font-black text-sm text-gray-700 dark:text-gray-200 tracking-tighter">{formatPhoneNumber(item.number)}</span>
                  </div>
                </a>
                {item.hasWhatsapp && (
                  <a href={`https://wa.me/${item.number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#25D366] text-white rounded-[1.2rem] flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all">
                    <FaWhatsapp size={24} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- İŞ SAATLARI --- */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center"><FiClock size={20} /></div>
          <div>
            <h3 className="font-black uppercase italic text-sm tracking-tight text-gray-800 dark:text-gray-100 leading-none">İş saatları</h3>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase italic">{settings?.workingHours || "09:00 - 23:00"}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 px-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-full border border-green-100 dark:border-green-900/50">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase italic">Açıqdır</span>
        </span>
      </div>

      {/* --- SOSİAL MEDİA --- */}
      <div className="grid grid-cols-2 gap-4">
        <a href={settings?.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-6 rounded-[2.2rem] text-white flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-all">
          <FiInstagram size={28} />
          <span className="text-[9px] font-black uppercase italic tracking-widest">Instagram</span>
        </a>
        <a href={settings?.tiktokUrl || "#"} target="_blank" rel="noopener noreferrer" className="bg-black dark:bg-gray-800 p-6 rounded-[2.2rem] text-white flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-all border border-transparent dark:border-gray-700">
          <FaTiktok size={28} />
          <span className="text-[9px] font-black uppercase italic tracking-widest">TikTok</span>
        </a>
      </div>

      {/* --- ÜNVAN VƏ BÖYÜK XƏRİTƏ --- */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-5 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/30 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-[1.2rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
              <FiMapPin size={24} />
            </div>
            <div>
              <h3 className="font-black uppercase italic text-sm tracking-tight text-gray-800 dark:text-gray-100">Ünvanımız</h3>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Bakı, Azərbaycan</p>
            </div>
          </div>
        </div>

        <p className="text-xs font-black text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 italic">
          {company?.address || company?.addressAz || "Ünvan məlumatı yüklənir..."}
        </p>
        
        {mapUrl ? (
          <div className="relative w-full h-100 rounded-[2.2rem] overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl group-hover:scale-[1.01] transition-transform duration-700">
            <iframe 
              src={mapUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="restaurant-map"
              className="grayscale-[0.1] hover:grayscale-0 transition-all duration-700 dark:invert-[0.9] dark:hue-rotate-180"
            />
          </div>
        ) : (
          <div className="w-full h-40 bg-gray-50 dark:bg-gray-800 rounded-4xl border-2 border-dashed border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
             <FiMapPin className="text-gray-200 dark:text-gray-700 mb-2" size={32} />
             <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase italic">Xəritə linki tapılmadı</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessInfo;