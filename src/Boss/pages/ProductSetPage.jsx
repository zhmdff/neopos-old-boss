import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../../api/axios';
import ProductSetItemRow from '../components/ProductSet/ProductSetItemRow';
import ProductSetAddModal from '../components/ProductSet/ProductSetAddModal';

const ProductSetPage = ({ mode = 'tech' }) => {
  const [sets, setSets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState('');

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const take = 10;
  const observer = useRef();

  const user = JSON.parse(localStorage.getItem('user'));
  const companyId = user?.companyId;

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
      console.error("Filtrlər yüklənərkən xəta:", err); 
    } finally {
      setFiltersLoading(false);
    }
  }, [companyId]);

  const fetchSets = useCallback(async (isInitial = false) => {
    if (!companyId || loading) return;

    if (mode === 'lunch') {
      if (!isInitial) return;
      setLoading(true);
      try {
        const url = `/ProductSets?companyId=${companyId}&skip=0&take=500&search=${searchTerm}&categoryId=${selectedCategory}&workshopId=${selectedWorkshop}`;
        const res = await api.get(url);
        const raw = Array.isArray(res.data) ? res.data : [];
        const filtered = raw.filter(
          (s) => (s.choiceGroups || s.ChoiceGroups || []).length > 0
        );
        setSets(filtered);
        setSkip(500);
        setHasMore(false);
      } catch (err) {
        console.error('Business lunch siyahısı:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!hasMore && !isInitial) return;

    setLoading(true);
    try {
      const currentSkip = isInitial ? 0 : skip;
      const url = `/ProductSets?companyId=${companyId}&skip=${currentSkip}&take=${take}&search=${searchTerm}&categoryId=${selectedCategory}&workshopId=${selectedWorkshop}`;
      const res = await api.get(url);
      
      if (isInitial) {
        setSets(res.data);
        setSkip(take);
      } else {
        setSets(prev => [...prev, ...res.data]);
        setSkip(prev => prev + take);
      }
      setHasMore(res.data.length === take);
    } catch (err) { 
      console.error("Setlər yüklənərkən xəta:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [skip, loading, hasMore, searchTerm, selectedCategory, selectedWorkshop, companyId, mode]);

  useEffect(() => { 
    fetchFilters(); 
  }, [fetchFilters]);

  useEffect(() => {
    setHasMore(true);
    fetchSets(true);
  }, [searchTerm, selectedCategory, selectedWorkshop, mode]);

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchSets();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchSets]);

  const isLunch = mode === 'lunch';

  return (
    <div className="animate-fadeIn px-3 py-5 text-black md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
      {/* HEADER */}
      <div
        className={`mb-8 flex flex-col gap-6 rounded-3xl border p-6 text-left shadow-sm ring-1 ring-slate-900/[0.04] sm:p-8 xl:flex-row xl:items-center xl:justify-between ${
          isLunch
            ? 'border-amber-100 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30'
            : 'border-slate-200/80 bg-gradient-to-br from-white to-slate-50/60'
        }`}
      >
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
             {isLunch ? 'Business lunch' : 'Tex / Kartlar'}
           </h1>
           <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
             {isLunch
               ? 'Əsas məhsul və seçim qrupları.'
               : 'Set tərkibi və maya dəyəri — texnoloji kartlar.'}
           </p>
        </div>
        
        <div className="flex w-full flex-col gap-3 md:max-w-2xl md:flex-row md:items-stretch xl:w-auto xl:max-w-none xl:shrink-0">
          <div className="relative min-w-0 flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder={isLunch ? 'Lunch məhsulu axtar…' : 'Set axtar…'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/15"
            />
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1 md:w-40">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={filtersLoading}
              className="min-w-0 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-bold uppercase text-slate-600 shadow-sm outline-none focus:border-[#0ea5e9] disabled:cursor-wait disabled:opacity-70"
            >
              <option value="">{filtersLoading ? 'Kateqoriyalar yüklənir…' : 'Kateqoriya'}</option>
              {!filtersLoading && categories.map(c => <option key={c.id} value={c.id}>{c.nameAz}</option>)}
            </select>
            {filtersLoading ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#0ea5e9]">Kateqoriyalar yüklənir…</span>
            ) : null}
            </div>

            <select
              value={selectedWorkshop}
              onChange={(e) => setSelectedWorkshop(e.target.value)}
              disabled={filtersLoading}
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-bold uppercase text-slate-600 shadow-sm outline-none focus:border-[#0ea5e9] disabled:cursor-wait disabled:opacity-70 md:w-40"
            >
              <option value="">{filtersLoading ? 'Emalatxanalar yüklənir…' : 'Emalatxana'}</option>
              {!filtersLoading && workshops.map(w => <option key={w.id} value={w.id}>{w.nameAz}</option>)}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-wide text-white shadow-lg transition hover:opacity-95 active:scale-[0.98] ${
              isLunch ? 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-orange-500/25' : 'bg-[#0ea5e9] shadow-[#0ea5e9]/25'
            }`}
          >
            <FiPlus strokeWidth={3} className="shrink-0" /> {isLunch ? 'Yeni lunch' : 'Yeni set'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:rounded-3xl md:rounded-[2rem]">
        <div className="hidden border-b border-slate-100 bg-slate-50/80 px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 xl:grid xl:grid-cols-12 xl:gap-4">
            <div className="col-span-3">Məhsul</div>
            <div className="col-span-2">Kateqoriya</div>
            <div className="col-span-2">Emalatxana</div>
            <div className="col-span-1 text-center">{isLunch ? 'Seçim qrupu' : 'Tərkib'}</div>
            <div className="col-span-2 text-center">Qiymət</div>
            <div className="col-span-2 text-right">Əməliyyat</div>
        </div>

        <div className="xl:divide-y xl:divide-slate-100">
          {sets.length > 0 ? sets.map((set, index) => (
            <div key={set.id} ref={sets.length === index + 1 ? lastElementRef : null}>
              <ProductSetItemRow setItem={set} onRefresh={() => fetchSets(true)} lunchMode={isLunch} />
            </div>
          )) : !loading && (
            <div className="p-16 text-center sm:p-20">
                <FiFilter className="mx-auto mb-4 text-slate-200" size={48} />
                <p className="text-sm font-semibold text-slate-500">
                  {isLunch ? 'Hələ business lunch yoxdur — «Yeni lunch» ilə başlayın.' : 'Heç bir tex/kart tapılmadı.'}
                </p>
            </div>
          )}
        </div>
        
        {loading && (
            <div className="p-12 text-center flex flex-col items-center gap-3 animate-pulse">
                <div className="w-8 h-8 border-4 border-sky-50 border-t-[#0ea5e9] rounded-full animate-spin"></div>
                <span className="text-[#0ea5e9] font-black text-[10px] uppercase tracking-widest">Məlumatlar Yüklənir...</span>
            </div>
        )}
      </div>

      <ProductSetAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onRefresh={() => fetchSets(true)}
        lunchMode={isLunch}
      />
      </div>
    </div>
  );
};

export default ProductSetPage;