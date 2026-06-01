import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiCoffee } from 'react-icons/fi';
import api from '../../api/axios';
import ProductItem from '../components/Product/ProductItem';
import ProductAddModal from '../components/Product/ProductAddModal';
import MenuImportModal from '../components/Product/MenuImportModal';

const ProductPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMenuImportOpen, setIsMenuImportOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [categories, setCategories] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const take = 10;
  const observer = useRef();
  const fetchSeq = useRef(0);
  const searchDebounceRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const companyId = user?.companyId ?? user?.CompanyId;

  const entityId = (row) => row?.id ?? row?.Id ?? '';
  const entityNameAz = (row) => row?.nameAz ?? row?.NameAz ?? '—';

  const fetchFilters = useCallback(async () => {
    if (!companyId) return;
    setFiltersLoading(true);
    try {
      const [catRes, workRes] = await Promise.all([
        api.get(`/Categories?companyId=${companyId}&take=1000`),
        api.get(`/Workshops?companyId=${companyId}`)
      ]);
      setCategories(catRes.data);
      setWorkshops(workRes.data);
    } catch (err) {
      console.error("Filtrləri yükləyərkən xəta:", err);
    } finally {
      setFiltersLoading(false);
    }
  }, [companyId]);

  const fetchProducts = useCallback(async (isInitial = false) => {
    if (!companyId) return;
    if (!isInitial && (loading || !hasMore)) return;

    const seq = ++fetchSeq.current;
    setLoading(true);
    try {
      const currentSkip = isInitial ? 0 : skip;
      const params = new URLSearchParams({
        companyId: String(companyId),
        skip: String(currentSkip),
        take: String(take),
      });
      const q = (searchTerm || '').trim();
      if (q) params.set('search', q);
      if (selectedWorkshop) params.set('workshopId', String(selectedWorkshop));
      if (selectedCategory === '__uncategorized__') {
        params.set('uncategorizedOnly', 'true');
      } else if (selectedCategory) {
        params.set('categoryId', String(selectedCategory));
      }
      const res = await api.get(`/Products?${params.toString()}`);

      if (seq !== fetchSeq.current) return;

      const rows = Array.isArray(res.data) ? res.data : [];
      if (isInitial) {
        setProducts(rows);
        setSkip(take);
      } else {
        setProducts((prev) => [...prev, ...rows]);
        setSkip((prev) => prev + take);
      }
      setHasMore(rows.length === take);
    } catch (err) {
      if (seq === fetchSeq.current) {
        console.error('Məhsulları yükləyərkən xəta:', err);
        if (isInitial) setProducts([]);
      }
    } finally {
      if (seq === fetchSeq.current) setLoading(false);
    }
  }, [skip, loading, hasMore, searchTerm, selectedCategory, selectedWorkshop, companyId]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // Category / workshop: reload immediately
  useEffect(() => {
    setHasMore(true);
    setSkip(0);
    setProducts([]);
    fetchProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional filter reset
  }, [selectedCategory, selectedWorkshop]);

  // Search: debounce to avoid stale races
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setHasMore(true);
      setSkip(0);
      setProducts([]);
      fetchProducts(true);
    }, 350);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) fetchProducts();
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchProducts]);

  return (
    <div className="p-4 md:p-6 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div>
           <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter leading-none">Məhsullar</h1>
           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest italic mt-2">Menyu və qiymət idarəetməsi</p>
           <button
             type="button"
             onClick={() => navigate('/boss/business-lunch')}
             className="mt-3 flex items-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50/80 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-900 hover:bg-amber-100 transition-all"
           >
             <FiCoffee size={14} /> Business lunch
           </button>
        </div>
        
        <div className="w-full xl:w-auto flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* SEARCH */}
            <div className="relative w-full lg:w-[320px] min-w-0">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Məhsul və ya barkod..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl focus:border-[#0ea5e9] focus:outline-none font-bold text-sm shadow-sm text-black"
            />
          </div>

            {/* FILTERS */}
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto">
            <div className="flex min-w-0 flex-col gap-1">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={filtersLoading}
              className="w-full cursor-pointer rounded-2xl border border-gray-100 bg-white px-4 py-3.5 text-xs font-bold uppercase text-gray-600 shadow-sm focus:border-[#0ea5e9] focus:outline-none disabled:cursor-wait disabled:opacity-70 lg:w-48"
            >
              <option value="">{filtersLoading ? 'Kateqoriyalar yüklənir…' : 'Bütün Kateqoriyalar'}</option>
              {!filtersLoading && (
                <option value="__uncategorized__">Kateqoriyasız (kök menyuda)</option>
              )}
              {!filtersLoading && categories.map((c) => {
                const cid = entityId(c);
                return (
                  <option key={cid || entityNameAz(c)} value={cid}>
                    {entityNameAz(c)}
                  </option>
                );
              })}
            </select>
            {filtersLoading ? (
              <span className="pl-1 text-[10px] font-semibold uppercase tracking-wide text-[#0ea5e9]">Kateqoriyalar yüklənir…</span>
            ) : null}
            </div>

            <select 
              value={selectedWorkshop} 
              onChange={(e) => setSelectedWorkshop(e.target.value)}
              disabled={filtersLoading}
              className="w-full cursor-pointer rounded-2xl border border-gray-100 bg-white px-4 py-3.5 text-xs font-bold uppercase text-gray-600 shadow-sm focus:border-[#0ea5e9] focus:outline-none disabled:cursor-wait disabled:opacity-70 lg:w-48"
            >
              <option value="">{filtersLoading ? 'Emalatxanalar yüklənir…' : 'Bütün Emalatxanalar'}</option>
              {!filtersLoading && workshops.map((w) => {
                const wid = entityId(w);
                return (
                  <option key={wid || entityNameAz(w)} value={wid}>
                    {entityNameAz(w)}
                  </option>
                );
              })}
            </select>
          </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setIsMenuImportOpen(true)}
              className="w-full bg-white text-[#0ea5e9] border-2 border-[#0ea5e9]/25 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-sky-50/80 hover:border-[#0ea5e9]/40 transition-all active:scale-95 uppercase text-xs tracking-widest"
            >
              <FiDownload strokeWidth={2.5} /> Excel
            </button>

            <button 
              onClick={() => setIsAddModalOpen(true)} 
              className="w-full bg-[#0ea5e9] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest"
            >
              <FiPlus strokeWidth={3} /> Yeni Məhsul
            </button>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* DESKTOP HEADER - Mobildə gizlədilir */}
        <div className="hidden xl:grid grid-cols-12 gap-4 border-b border-slate-100 bg-slate-50/80 px-8 py-5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            <div className="col-span-1 text-center">Şəkil</div>
            <div className="col-span-3">Məhsul</div>
            <div className="col-span-2">Kateqoriya</div>
            <div className="col-span-2">Emalatxana</div>
            <div className="col-span-2 text-center">Qiymət</div>
            <div className="col-span-2 text-right">Əməliyyat</div>
        </div>

        <div className="xl:divide-y xl:divide-slate-100">
          {products.length > 0 ? products.map((prod, index) => (
            <div key={prod.id} ref={products.length === index + 1 ? lastElementRef : null}>
              <ProductItem product={prod} onRefresh={() => fetchProducts(true)} />
            </div>
          )) : !loading && (
            <div className="p-20 text-center">
                <FiFilter className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-300 font-black uppercase tracking-widest text-[10px] italic">Məhsul tapılmadı</p>
            </div>
          )}
        </div>
        
        {loading && (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-sky-50 border-t-[#0ea5e9] rounded-full animate-spin"></div>
            <span className="text-[#0ea5e9] font-black text-[10px] uppercase tracking-widest">Yüklənir...</span>
          </div>
        )}
      </div>

      <ProductAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onRefresh={() => fetchProducts(true)} 
      />

      <MenuImportModal
        isOpen={isMenuImportOpen}
        onClose={() => setIsMenuImportOpen(false)}
        companyId={companyId}
        onImportSuccess={() => fetchProducts(true)}
      />
    </div>
  );
};

export default ProductPage;