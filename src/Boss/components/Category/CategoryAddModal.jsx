import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiImage, FiSave, FiUploadCloud } from 'react-icons/fi';
import api from '../../../api/axios';

const CategoryAddModal = ({ isOpen, onClose, onRefresh }) => {
  const [nameAz, setNameAz] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const userData = JSON.parse(localStorage.getItem('user'));
      const companyId = userData?.companyId || userData?.CompanyId;

      if (companyId) {
        api.get(`/Categories?companyId=${companyId}&skip=0&take=1000`)
          .then(res => {
            const data = Array.isArray(res.data) ? res.data : (res.data.items || []);
            setAllCategories(data.filter(c => !c.parentCategoryId));
          })
          .catch(err => console.error(err));
      }
    } else {
      setNameAz('');
      setParentCategoryId('');
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = JSON.parse(localStorage.getItem('user'));
    const companyId = userData?.companyId || userData?.CompanyId;

    if (!companyId) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('NameAz', nameAz.trim());
    formData.append('OrderIndex', "0");
    formData.append('CompanyId', companyId);

    if (parentCategoryId) {
      formData.append('ParentCategoryId', parentCategoryId);
    }

    if (selectedImage) {
      formData.append('ImageFile', selectedImage);
    }

    try {
      await api.post('/Categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          <h2 className="text-xl font-black text-[#0f172a] uppercase tracking-tighter">Yeni Kateqoriya</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-left">
          <div className="flex flex-col items-center justify-center">
            <div 
              onClick={() => fileInputRef.current.click()}
              className="relative w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-4xl flex items-center justify-center cursor-pointer hover:border-[#0ea5e9] transition-all overflow-hidden group"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiUploadCloud className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-[#0ea5e9]">
                  <FiImage size={32} />
                  <span className="text-[10px] font-bold mt-2 uppercase">Şəkil Seç</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Kateqoriya Adı</label>
            <input 
              required
              value={nameAz}
              onChange={(e) => setNameAz(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#0ea5e9] transition-all font-bold text-[#0f172a]"
              placeholder="Məs: İçkilər"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Aid Olduğu Kateqoriya</label>
            <div className="relative">
              <select 
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#0ea5e9] transition-all font-bold appearance-none cursor-pointer text-[#0f172a]"
              >
                <option value="">--- Seçilməyib ---</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nameAz}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#0ea5e9] text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#0ea5e9]/20 transition-all active:scale-95 uppercase text-sm mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><FiSave size={18} /> Kateqoriyanı Yarat</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryAddModal;