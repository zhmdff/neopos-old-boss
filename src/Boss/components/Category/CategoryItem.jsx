import React, { useState } from 'react';
import { FiChevronDown, FiEdit2, FiTrash2, FiChevronUp } from 'react-icons/fi';
import api from '../../../api/axios';
import GlobalDeleteModal from '../GlobalDeleteModal';
import CategoryEditModal from './CategoryEditModal';

const CategoryItem = ({ category, index, onRefresh, onMove, isFirst, isLast, isSub = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. ŞİRKƏT ID-ni götürürük
  const user = JSON.parse(localStorage.getItem('user'));
  const companyId = user?.companyId || user?.CompanyId
  
  
  const hasSub = category.subCategories && category.subCategories.length > 0;
  
  // 2. SİLMƏ FUNKSİYASI (companyId əlavə edildi)
  const handleDelete = async () => {
    if (!companyId) return alert("Şirkət məlumatı tapılmadı!");
    
    setLoading(true);
    try {
      // Backend-də DeleteAsync(id, companyId) gözləyir
      // Query string kimi göndəririk: ?companyId=...
      await api.delete(`/Categories/${category.id}?companyId=${companyId}`);
      
      onRefresh();
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Xəta baş verdi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* DESKTOP TABLE ROW (lg+) */}
      <div
        className={`hidden lg:grid grid-cols-12 gap-4 px-8 py-5 items-center transition-all duration-200 ${
          isSub ? 'bg-gray-50/40 border-l-4 border-[#0ea5e9]/20' : 'hover:bg-gray-50/60'
        }`}
      >
        <div className="col-span-1">
          <span className="text-[13px] font-black text-gray-400">{isSub ? `${index}.` : index}</span>
        </div>

        <div className="col-span-7 flex items-center gap-3 min-w-0">
          {!isSub && hasSub && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 rounded-lg hover:bg-white shadow-sm transition-all duration-300 ${
                isExpanded ? 'rotate-180 text-[#0ea5e9]' : 'text-gray-400'
              }`}
              title="Alt kateqoriyalar"
            >
              <FiChevronDown size={20} />
            </button>
          )}
          <span className={`font-bold tracking-tight truncate ${isSub ? 'text-gray-500 text-sm pl-4' : 'text-[#1e293b] text-base'}`}>
            {category.nameAz}
          </span>
          {hasSub && !isSub ? (
            <span className="text-[10px] bg-sky-50 text-[#0ea5e9] px-2 py-0.5 rounded-md font-black uppercase shrink-0">
              {category.subCategories.length} Alt
            </span>
          ) : null}
        </div>

        <div className="col-span-2 flex justify-center gap-1.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMove(index - 1, 'up')}
            title="Yuxarı daşı"
            className={`p-2 rounded-xl transition-colors ${
              isFirst ? 'text-gray-200 cursor-not-allowed bg-gray-50' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-[#0ea5e9]'
            }`}
          >
            <FiChevronUp size={18} />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMove(index - 1, 'down')}
            title="Aşağı daşı"
            className={`p-2 rounded-xl transition-colors ${
              isLast ? 'text-gray-200 cursor-not-allowed bg-gray-50' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-[#0ea5e9]'
            }`}
          >
            <FiChevronDown size={18} />
          </button>
        </div>

        <div className="col-span-2 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="p-2.5 bg-[#0ea5e9] text-white rounded-xl hover:bg-sky-600 transition-all shadow-sm active:scale-90"
            title="Redaktə et"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2.5 bg-[#ef4444] text-white rounded-xl hover:bg-red-600 transition-all shadow-sm active:scale-90"
            title="Sil"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {/* MOBILE CARD ROW (<lg) */}
      <div className={`lg:hidden px-5 py-4 border-b border-gray-100 ${isSub ? 'bg-gray-50/40' : 'bg-white'} `}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {!isSub && hasSub ? (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0"
                  title="Alt kateqoriyalar"
                >
                  {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <span className="text-[10px] font-black">{index}</span>
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-black tracking-tight uppercase truncate ${isSub ? 'text-slate-600 text-[13px]' : 'text-slate-900 text-[14px]'}`}>
                    {category.nameAz}
                  </span>
                  {hasSub && !isSub ? (
                    <span className="text-[9px] bg-sky-50 text-[#0ea5e9] px-2 py-0.5 rounded-md font-black uppercase">
                      {category.subCategories.length} alt
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  #{isSub ? `${index}` : index}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isFirst}
              onClick={() => onMove(index - 1, 'up')}
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
                isFirst ? 'bg-gray-50 border-gray-100 text-gray-200' : 'bg-white border-gray-200 text-slate-600 active:scale-95'
              }`}
              title="Yuxarı"
            >
              <FiChevronUp size={20} />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={() => onMove(index - 1, 'down')}
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
                isLast ? 'bg-gray-50 border-gray-100 text-gray-200' : 'bg-white border-gray-200 text-slate-600 active:scale-95'
              }`}
              title="Aşağı"
            >
              <FiChevronDown size={20} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 py-3.5 bg-[#0ea5e9] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <FiEdit2 size={14} /> Düzəliş
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 py-3.5 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <FiTrash2 size={14} /> Sil
          </button>
        </div>
      </div>

      {isExpanded && hasSub && (
        <div className="animate-slideDown overflow-hidden border-b border-gray-50">
          {category.subCategories.map((sub, subIdx) => (
            <CategoryItem 
              key={sub.id} 
              category={sub} 
              index={subIdx + 1} 
              onRefresh={onRefresh} 
              isSub={true} 
              onMove={(idx, dir) => onMove(idx, dir, category.id)}
              isFirst={subIdx === 0}
              isLast={subIdx === category.subCategories.length - 1}
            />
          ))}
        </div>
      )}

      {/* 3. MODALLARA DA MƏLUMAT ÖTÜRÜLƏCƏK */}
      <CategoryEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onRefresh={onRefresh} 
        categoryData={category} 
      />
      
      <GlobalDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title={category.nameAz} 
        description={`"${category.nameAz}" kateqoriyasını silmək istədiyinizə əminsiniz?`} 
        onConfirm={handleDelete} 
        isLoading={loading} 
      />
    </>
  );
};

export default CategoryItem;