import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiRefreshCw, FiImage, FiEdit3 } from 'react-icons/fi';
import api from '../../../api/axios';
import { getApiBaseUrl } from '../../../utils/apiBaseUrl';

const CategoryEditModal = ({ isOpen, onClose, onRefresh, categoryData }) => {
  const [nameAz, setNameAz] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Şəkil üçün state-lər
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // .env-dən URL-i götürüb təmizləyirik
  const apiUrl = getApiBaseUrl();
  const IMAGE_BASE_URL = apiUrl.replace(/\/api$/, ""); // Sondakı /api-ni silir

  useEffect(() => {
    if (categoryData && isOpen) {
      setNameAz(categoryData.nameAz);
      setParentCategoryId(categoryData.parentCategoryId || '');
      
      // Mövcud şəkli dinamik URL ilə göstər
      if (categoryData.imageUrl) {
        // Əgər imageUrl artıq tam URL deyilsə, base URL-i başına qoyur
        const fullImageUrl = categoryData.imageUrl.startsWith('http') 
          ? categoryData.imageUrl 
          : `${IMAGE_BASE_URL}${categoryData.imageUrl}`;
        setPreviewUrl(fullImageUrl);
      } else {
        setPreviewUrl(null);
      }

      api.get('/Categories').then(res => {
        setAllCategories(res.data.filter(c => !c.parentCategoryId && c.id !== categoryData.id));
      });
    }
  }, [categoryData, isOpen, IMAGE_BASE_URL]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = JSON.parse(localStorage.getItem('user'));
    const currentCompanyId = categoryData.companyId || userData?.companyId;

    const formData = new FormData();
    formData.append('Id', categoryData.id);
    formData.append('NameAz', nameAz.trim());
    formData.append('OrderIndex', categoryData.orderIndex || 0);
    
    if (currentCompanyId) {
        formData.append('CompanyId', currentCompanyId);
    }

    if (parentCategoryId && parentCategoryId !== "") {
        formData.append('ParentCategoryId', parentCategoryId);
    }

    if (imageFile) {
        formData.append('ImageFile', imageFile);
    }

    try {
        await api.put('/Categories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        onRefresh();
        onClose();
    } catch (err) {
        const backendErrors = err.response?.data?.errors;
        console.error("Xəta:", backendErrors);
        alert("Yenilənmə zamanı xəta baş verdi!");
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          <h2 className="text-xl font-black text-[#0f172a] uppercase tracking-tighter">Kateqoriyanı Yenilə</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="flex flex-col items-center justify-center">
            <div 
              onClick={() => fileInputRef.current.click()}
              className="relative w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex items-center justify-center cursor-pointer hover:border-[#0ea5e9] transition-all overflow-hidden group"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Category" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiEdit3 className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FiImage size={32} />
                  <span className="text-[10px] font-bold mt-2 uppercase">Şəkil Seç</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Dəyişmək üçün kliklə</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Kateqoriya Adı (Az)</label>
              <input 
                required
                value={nameAz}
                onChange={(e) => setNameAz(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#0ea5e9] focus:outline-none font-bold text-[#0f172a]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Bağlı Olduğu Kateqoriya</label>
              <select 
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#0ea5e9] focus:outline-none font-bold text-[#0f172a] appearance-none cursor-pointer"
              >
                <option value="">--- Əsas Kateqoriya ---</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nameAz}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0ea5e9] text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 uppercase text-sm hover:shadow-xl hover:shadow-[#0ea5e9]/20 transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><FiRefreshCw size={18} /> Məlumatları Yenilə</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryEditModal;