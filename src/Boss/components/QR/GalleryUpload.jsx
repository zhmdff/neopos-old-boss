import React, { useRef, useState } from 'react';
import axios from 'axios';
import { FiPlus, FiTrash2, FiLoader, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getApiBaseUrl, getApiOrigin } from '../../../utils/apiBaseUrl';

const GalleryUpload = ({ settings, setSettings }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  
  const API_URL = getApiBaseUrl();
  const IMAGE_BASE = getApiOrigin(); 
  const images = settings?.galleryImages || [];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    const tId = toast.loading("Şəkil yüklənir...");

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/QRMenu/upload-gallery-image`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Backend-dən gələn imageUrl-i listə əlavə edirik
      setSettings({ ...settings, galleryImages: [...images, res.data.imageUrl] });
      toast.success("Yükləndi!", { id: tId });
    } catch (err) {
      toast.error("Xəta baş verdi!", { id: tId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-[#0f172a] uppercase flex items-center gap-2">
          <FiImage className="text-blue-600" /> Restoran Qalereyası
        </h3>
        <span className="text-[10px] font-bold text-gray-400 uppercase">{images.length} / 5</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {images.map((img, index) => {
          // BURADA DÜZƏLİŞ: Aradakı slash-i zəmanətə alırıq
          const fullPath = img.startsWith('/') ? img : `/${img}`;
          
          return (
            <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
              <img 
                src={`${IMAGE_BASE}${fullPath}`} 
                className="w-full h-full object-cover" 
                alt="Gallery"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = 'https://placehold.co/400x400?text=Error'; 
                }} 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                <button 
                  type="button"
                  onClick={() => setSettings({ ...settings, galleryImages: images.filter((_, i) => i !== index) })}
                  className="bg-white text-red-600 p-2 rounded-xl hover:scale-110 transition-transform"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {images.length < 5 && (
          <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              {uploading ? <FiLoader className="animate-spin" size={20} /> : <FiPlus size={20} />}
              <span className="text-[9px] font-black mt-1">Seç</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GalleryUpload;