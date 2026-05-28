import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiPlus, FiSearch, FiX, FiFilter } from 'react-icons/fi';
import api from '../../api/axios';
import CategoryItem from '../components/Category/CategoryItem';
import CategoryAddModal from '../components/Category/CategoryAddModal';

// 🔥 Yastı siyahını iyerarxik (tree) strukturuna salan funksiya
const buildCategoryTree = (flatList) => {
  const map = {};
  const tree = [];
  flatList.forEach(cat => {
    map[cat.id] = { ...cat, subCategories: [] };
  });
  flatList.forEach(cat => {
    if (cat.parentCategoryId && map[cat.parentCategoryId]) {
      map[cat.parentCategoryId].subCategories.push(map[cat.id]);
    } else if (!cat.parentCategoryId) {
      tree.push(map[cat.id]);
    }
  });
  return tree;
};

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const take = 1000; 
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const companyId = user?.companyId || user?.CompanyId;

  const fetchCategories = useCallback(async (currentSearch = searchTerm) => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await api.get('/Categories', {
        params: { companyId, skip: 0, take, search: currentSearch }
      });
      const treeData = buildCategoryTree(res.data || []);
      setCategories(treeData);
    } catch (err) {
      console.error("Kateqoriya yükləmə xətası:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, searchTerm]);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCategories(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchCategories, companyId]);

  const handleRefresh = () => {
    setSearchTerm('');
    fetchCategories('');
  };

  // 🔥 YENİLƏNMİŞ handleMove: Həm Ana, həm Alt kateqoriya sıralamasını Backend-ə yazır
  const handleMove = async (currentIndex, direction, parentId = null) => {
    if (!companyId) return;

    // State-in dərin kopyasını yaradırıq ki, rahat manipulyasiya edək
    let updatedTree = JSON.parse(JSON.stringify(categories));
    let itemsToUpdate = [];

    if (!parentId) {
      // --- ANA KATEQORİYA SIRALAMASI ---
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= updatedTree.length) return;

      [updatedTree[currentIndex], updatedTree[targetIndex]] = [updatedTree[targetIndex], updatedTree[currentIndex]];
      
      // Bütün ana kateqoriyaların yeni indexlərini yığırıq
      itemsToUpdate = updatedTree.map((cat, idx) => ({ id: cat.id, orderIndex: idx + 1 }));
    } else {
      // --- ALT KATEQORİYA SIRALAMASI ---
      const findAndMove = (list) => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id === parentId) {
            const subList = list[i].subCategories;
            const targetIdx = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            
            if (targetIdx >= 0 && targetIdx < subList.length) {
              [subList[currentIndex], subList[targetIdx]] = [subList[targetIdx], subList[currentIndex]];
              // Yalnız bu valideynin altındakı uşaqların sırasını yeniləyirik
              itemsToUpdate = subList.map((sc, idx) => ({ id: sc.id, orderIndex: idx + 1 }));
              return true;
            }
          }
          if (list[i].subCategories?.length > 0) {
            if (findAndMove(list[i].subCategories)) return true;
          }
        }
        return false;
      };
      findAndMove(updatedTree);
    }

    // UI-ı dərhal yeniləyirik (Optimistic Update)
    setCategories(updatedTree);

    // 🔥 BACKEND-İ YENİLƏYİRİK
    if (itemsToUpdate.length > 0) {
      try {
        await api.post(`/Categories/update-orders?companyId=${companyId}`, itemsToUpdate);
      } catch (err) {
        console.error("Sıralama xətası:", err);
        handleRefresh(); // Xəta olarsa bazadakı real sıraya qayıt
        alert("Sıralama yadda saxlanılmadı!");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 animate-fadeIn bg-[#f8fafc] min-h-screen text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter italic leading-none">Kateqoriyalar</h1>
          <p className="mt-2 text-[10px] font-bold uppercase italic tracking-[0.2em] text-gray-400">
            {loading ? (
              <span className="text-[#0ea5e9]">Kateqoriyalar yüklənir…</span>
            ) : (
              'Struktur və Sıralama İdarəetməsi'
            )}
          </p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-72 min-w-0">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-11 py-3.5 bg-white border border-gray-100 rounded-2xl focus:border-[#0ea5e9] outline-none font-bold text-sm shadow-sm"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center"
                aria-label="Axtarışı təmizlə"
              >
                <FiX size={16} />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto bg-[#0ea5e9] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-xl active:scale-95 uppercase text-xs tracking-widest transition-all whitespace-nowrap"
          >
            <FiPlus strokeWidth={3} /> Yeni Kateqoriya
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
        {loading && categories.length > 0 ? (
          <div className="flex items-center justify-center gap-3 border-b border-blue-100/80 bg-sky-50/50 px-6 py-3">
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-200 border-t-[#0ea5e9]" />
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0ea5e9]">Kateqoriyalar yenilənir…</p>
          </div>
        ) : null}

        {!(loading && categories.length === 0) ? (
          <div className="hidden grid-cols-12 gap-4 border-b bg-gray-50/50 px-10 py-6 text-[11px] font-black uppercase tracking-widest text-gray-400 lg:grid">
            <div className="col-span-1">Mövqe</div>
            <div className="col-span-7">Kateqoriya Adı</div>
            <div className="col-span-2 text-center">Sıralama</div>
            <div className="col-span-2 text-right">Əməliyyatlar</div>
          </div>
        ) : null}

        <div className="divide-y divide-gray-50">
          {loading && categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 sm:py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#0ea5e9]" />
              <p className="text-sm font-bold uppercase tracking-wide text-[#0ea5e9]">Kateqoriyalar yüklənir…</p>
              <p className="text-center text-[11px] font-semibold text-slate-500">Zəhmət olmasa, gözləyin.</p>
            </div>
          ) : categories.length > 0 ? (
            categories.map((cat, index) => (
              <div key={cat.id}>
                <CategoryItem
                  category={cat}
                  index={index + 1}
                  onRefresh={handleRefresh}
                  onMove={handleMove}
                  isFirst={index === 0}
                  isLast={categories.length === index + 1}
                />
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <FiFilter className="mx-auto mb-4 text-gray-200" size={48} />
              <p className="text-[10px] font-black uppercase text-gray-400">Kateqoriya tapılmadı</p>
            </div>
          )}
        </div>
      </div>

      <CategoryAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onRefresh={handleRefresh} />
    </div>
  );
};

export default CategoryPage;