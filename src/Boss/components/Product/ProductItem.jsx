import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiBox, FiTag, FiPrinter, FiTruck, FiCoffee } from 'react-icons/fi'; // 🔥 FiTruck əlavə edildi
import api from '../../../api/axios';
import GlobalDeleteModal from '../GlobalDeleteModal';
import ProductEditModal from './ProductEditModal';

const ProductItem = ({ product, onRefresh }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const companyId = user?.companyId;

  const fullApiUrl = import.meta.env.VITE_API_URL;
  const IMAGE_BASE = fullApiUrl ? fullApiUrl.replace('/api', '') : '';

  // Çatdırılma qiyməti fərqlidirsə yoxlayırıq
  const hasDifferentDeliveryPrice = product.deliveryPrice && 
                                    Number(product.deliveryPrice) !== Number(product.salePrice);

  const hasBusinessLunch =
    product.hasBusinessLunch === true ||
    (Array.isArray(product.setChoiceGroups || product.SetChoiceGroups) &&
      (product.setChoiceGroups || product.SetChoiceGroups).length > 0);

  const handleDelete = async () => {
    if (!companyId) return alert("Şirkət ID tapılmadı!");
    setLoading(true);
    try {
      await api.delete(`/Products/${product.id}?companyId=${companyId}`);
      onRefresh();
      setIsDeleteOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Silinmə zamanı xəta!");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${IMAGE_BASE}${cleanPath}`;
  };

  return (
    <>
      {/* DESKTOP VIEW - XL ekranlarda cədvəl kimi */}
      <div className="hidden xl:grid grid-cols-12 gap-4 px-8 py-5 items-center border-b border-slate-100/90 transition-colors hover:bg-slate-50/90">
        <div className="col-span-1">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
            {product.imageUrl ? (
              <img src={getImageUrl(product.imageUrl)} className="w-full h-full object-cover" alt={product.nameAz} />
            ) : (
              <FiBox className="text-gray-300" size={24} />
            )}
          </div>
        </div>

        <div className="col-span-3 min-w-0 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold uppercase leading-tight tracking-tight text-slate-900">{product.nameAz}</h3>
            {hasBusinessLunch ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase text-amber-900 border border-amber-200">
                <FiCoffee size={10} /> lunch
              </span>
            ) : null}
          </div>
          {product.barcode && <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-widest">{product.barcode}</p>}
        </div>

        <div className="col-span-2 min-w-0 text-left">
          <span className="inline-block max-w-full truncate rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
            {product.categoryName || 'Kateqoriyasız'}
          </span>
        </div>

        <div className="col-span-2 min-w-0 text-left">
          <div className="flex min-w-0 items-center gap-2 text-slate-600">
            <FiPrinter size={12} className="shrink-0" />
            <span className="truncate text-[11px] font-bold uppercase tracking-wide">{product.workshopName || 'Sexsiz'}</span>
          </div>
        </div>

        <div className="col-span-2 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black italic leading-none tracking-tighter text-[#0ea5e9]">
            {Number(product.salePrice).toFixed(2)} ₼
          </span>
          {hasDifferentDeliveryPrice && (
            <div className="mt-1 flex animate-fadeIn items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-amber-700">
              <FiTruck size={10} />
              <span className="text-[10px] font-black tracking-tight">{Number(product.deliveryPrice).toFixed(2)} ₼</span>
            </div>
          )}
        </div>

        <div className="col-span-2 flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm transition hover:border-[#0ea5e9]/35 hover:bg-sky-50/60 hover:text-[#0ea5e9]"
            title="Redaktə et"
          >
            <FiEdit2 size={16} className="shrink-0" />
            <span>Redaktə</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/90 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-red-700 shadow-sm transition hover:bg-red-600 hover:text-white"
            title="Sil"
          >
            <FiTrash2 size={16} className="shrink-0" />
            <span>Sil</span>
          </button>
        </div>
      </div>

      {/* MOBILE & TABLET — kart; əməliyyatlar həmişə görünür */}
      <div className="xl:hidden mx-2 my-3 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:mx-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 sm:h-16 sm:w-16">
              {product.imageUrl ? (
                <img src={getImageUrl(product.imageUrl)} className="w-full h-full object-cover" alt={product.nameAz} />
              ) : (
                <FiBox className="text-gray-300" size={28} />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold uppercase leading-tight tracking-tight text-slate-900">{product.nameAz}</h3>
                  {hasBusinessLunch ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[8px] font-black uppercase text-amber-900">
                      <FiCoffee size={9} /> lunch
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-[9px] font-bold uppercase text-[#0ea5e9]">
                        <FiTag size={10} className="shrink-0" /> <span className="truncate">{product.categoryName}</span>
                    </span>
                    <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase text-slate-600">
                        <FiPrinter size={10} className="shrink-0" /> <span className="truncate">{product.workshopName}</span>
                    </span>
                </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
              <p className="text-xl font-black italic leading-none tracking-tighter text-[#0ea5e9]">{Number(product.salePrice).toFixed(2)} ₼</p>
              {hasDifferentDeliveryPrice && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">
                  <FiTruck size={10} /> {Number(product.deliveryPrice).toFixed(2)} ₼
                </span>
              )}
              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">{product.barcode || 'Kodsuz'}</p>
          </div>
        </div>

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

      <ProductEditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onRefresh={onRefresh} productData={product} />
      <GlobalDeleteModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title={product.nameAz} description={`"${product.nameAz}" silinsin?`} isLoading={loading} />
    </>
  );
};

export default ProductItem;