import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiLayers, FiPrinter, FiTag, FiCoffee } from 'react-icons/fi';
import api from '../../../api/axios';
import GlobalDeleteModal from '../GlobalDeleteModal';
import ProductSetEditModal from './ProductSetEditModal';

const ProductSetItemRow = ({ setItem, onRefresh, lunchMode = false }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const companyId = user?.companyId;

  const lunchGroupsCount = (setItem.choiceGroups || setItem.ChoiceGroups || []).length;
  const setItemsCount = setItem.setItems?.length || 0;

  const handleDelete = async () => {
    if (!companyId) return alert('Şirkət ID tapılmadı!');
    setLoading(true);
    try {
      await api.delete(`/ProductSets/${setItem.id}?companyId=${companyId}`);
      onRefresh();
      setIsDeleteOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Silinmə zamanı xəta!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="hidden grid-cols-12 items-center gap-4 border-b border-slate-100/90 px-8 py-5 text-black transition-colors hover:bg-slate-50/90 xl:grid">
        <div className="col-span-3 min-w-0 text-left">
          <h3 className="text-base font-bold uppercase leading-tight tracking-tight text-slate-900">
            {setItem.productNameAz}
          </h3>
          <p className="mt-1 max-w-xs truncate text-[11px] font-semibold uppercase italic tracking-tight text-slate-400">
            {setItem.description || 'Təsvir yoxdur'}
          </p>
        </div>

        <div className="col-span-2 min-w-0 text-left">
          <span className="inline-block max-w-full truncate rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
            {setItem.categoryName || '—'}
          </span>
        </div>

        <div className="col-span-2 min-w-0 text-left">
          <div className="flex min-w-0 items-center gap-2 text-slate-600">
            <FiPrinter size={12} className="shrink-0" />
            <span className="truncate text-[11px] font-bold uppercase tracking-wide">{setItem.workshopName || '—'}</span>
          </div>
        </div>

        <div className="col-span-1 flex flex-col items-center justify-center gap-1 text-center">
          {lunchMode ? (
            <span className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase text-amber-900">
              <FiCoffee size={11} /> {lunchGroupsCount || 0} qrup
            </span>
          ) : (
            <span className="rounded-xl border border-blue-100 bg-sky-50 px-3 py-1.5 text-[10px] font-black uppercase text-[#0ea5e9] shadow-sm">
              {setItemsCount} tərkib
            </span>
          )}
        </div>

        <div className="col-span-2 text-center">
          <span className="text-xl font-black italic leading-none tracking-tighter text-[#0ea5e9]">
            {Number(setItem.setSalePrice || 0).toFixed(2)} ₼
          </span>
        </div>

        <div className="col-span-2 flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm transition hover:border-[#0ea5e9]/35 hover:bg-sky-50/60 hover:text-[#0ea5e9]"
          >
            <FiEdit2 size={16} className="shrink-0" />
            <span>Redaktə</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/90 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-red-700 shadow-sm transition hover:bg-red-600 hover:text-white"
          >
            <FiTrash2 size={16} className="shrink-0" />
            <span>Sil</span>
          </button>
        </div>
      </div>

      <div className="mx-2 my-3 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:mx-4 sm:p-5 xl:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-[#0ea5e9] sm:h-14 sm:w-14">
              <FiLayers size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold uppercase leading-tight tracking-tight text-slate-900">{setItem.productNameAz}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase text-slate-600">
                  <FiTag size={10} className="shrink-0" /> <span className="truncate">{setItem.categoryName}</span>
                </span>
                <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase text-slate-600">
                  <FiPrinter size={10} className="shrink-0" /> <span className="truncate">{setItem.workshopName}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xl font-black italic leading-none tracking-tighter text-[#0ea5e9]">
              {Number(setItem.setSalePrice || 0).toFixed(2)} ₼
            </p>
            {lunchMode ? (
              <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[9px] font-black uppercase text-amber-800">
                <FiCoffee size={10} /> {lunchGroupsCount || 0} qrup
              </span>
            ) : (
              <span className="mt-2 inline-block text-[9px] font-black uppercase tracking-widest text-blue-600">
                {setItemsCount} tərkib
              </span>
            )}
          </div>
        </div>

        {setItem.description ? (
          <p className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-left text-[11px] font-semibold uppercase leading-snug text-slate-500">
            {setItem.description}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-[11px] font-bold uppercase tracking-wide text-slate-800 shadow-sm transition hover:border-[#0ea5e9]/40 hover:bg-sky-50/50 hover:text-[#0ea5e9] sm:flex-1"
          >
            <FiEdit2 size={18} /> Redaktə
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-[11px] font-bold uppercase tracking-wide text-red-700 shadow-sm transition hover:bg-red-600 hover:text-white sm:flex-1"
          >
            <FiTrash2 size={18} /> Sil
          </button>
        </div>
      </div>

      <ProductSetEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onRefresh={onRefresh}
        setData={setItem}
        lunchMode={lunchMode}
      />
      <GlobalDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={setItem.productNameAz}
        description={`"${setItem.productNameAz}" silinsin?`}
        isLoading={loading}
      />
    </>
  );
};

export default ProductSetItemRow;
