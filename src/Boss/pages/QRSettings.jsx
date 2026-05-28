import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiLoader } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

// Alt Komponentlər
import GeneralSettings from '../components/QR/GeneralSettings';
import SocialLinks from '../components/QR/SocialLinks';
import GalleryUpload from '../components/QR/GalleryUpload';
import MapLocation from '../components/QR/MapLocation';
import QRCodeGenerator from '../components/QR/QRCodeGenerator';

const QRSettings = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState('restoran');
  const [companyName, setCompanyName] = useState('NeoPos');
  
  const [settings, setSettings] = useState({
    wifiName: '', wifiPassword: '', instagramUrl: '', tiktokUrl: '',
    facebookUrl: '', phone1HasWhatsApp: false, phone2HasWhatsApp: false,
    phone3HasWhatsApp: false, workingHours: '', mapLocationUrl: '',
    serviceChargePercent: 0, galleryImages: []
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user?.companyId) return;

    try {
      // Hər iki sorğunu eyni anda atırıq (Performans üçün)
      const [settingsRes, companyRes] = await Promise.all([
        axios.get(`${API_URL}/QRMenu/settings/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/Companies/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // QR Ayarlarını doldur
      if (settingsRes.data) {
        setSettings({ ...settingsRes.data, galleryImages: settingsRes.data.galleryImages || [] });
      }

      // Şirkət məlumatlarını (Slug və Ad) doldur
      if (companyRes.data) {
        setSlug(companyRes.data.slug || companyRes.data.Slug || 'restoran');
        setCompanyName(companyRes.data.nameAz || companyRes.data.NameAz || 'NeoPos');
      }
    } catch (err) {
      console.error("Məlumatlar alınmadı:", err);
      toast.error("Məlumatları yükləyərkən xəta baş verdi!");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const tId = toast.loading("Məlumatlar saxlanılır...");
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    try {
      await axios.post(`${API_URL}/QRMenu/settings/${user.companyId}`, {
        ...settings,
        serviceChargePercent: parseFloat(settings.serviceChargePercent) || 0
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success("Uğurla saxlanıldı!", { id: tId });
    } catch {
      toast.error("Xəta baş verdi!", { id: tId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="animate-spin text-[#0ea5e9]" size={40} />
          <p className="font-black text-gray-400 uppercase italic tracking-widest">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
      <Toaster position="bottom-right" />
      
      <div className="max-w-[1600px] mx-auto">
        
        {/* Üst Panel */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-3 h-10 bg-[#0ea5e9] rounded-full"></div>
            <div>
              <h1 className="text-3xl font-black text-[#0f172a] uppercase italic tracking-tighter">QR Ayarları</h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{companyName}</p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-[#0ea5e9] text-white px-12 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 w-full md:w-auto flex justify-center items-center gap-2"
          >
            {saving ? <FiLoader className="animate-spin" /> : <FiSave size={18} />}
            {saving ? 'Saxlanılır...' : 'Dəyişiklikləri Saxla'}
          </button>
        </div>

        {/* 3-lü Yan-yana Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GeneralSettings settings={settings} setSettings={setSettings} />
          <SocialLinks settings={settings} setSettings={setSettings} />
          <MapLocation settings={settings} setSettings={setSettings} />
        </div>

        {/* Alt Panel: Qalereya və QR Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <GalleryUpload settings={settings} setSettings={setSettings} />
          </div>

          <div className="lg:col-span-4">
            {/* Real vaxtda API-dan gələn slug və ad bura ötürülür */}
            <QRCodeGenerator slug={slug} companyName={companyName} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRSettings;