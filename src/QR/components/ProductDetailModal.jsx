import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiX } from 'react-icons/fi';
import { qrLocalizedDescription, qrLocalizedProductName } from '../utils/qrLocalizedFields';
import { mediaUrl } from '../../utils/mediaUrl';

function productImageUrl(product) {
  const imagePath = product?.imageUrl || product?.ImageUrl || '';
  return mediaUrl(imagePath);
}

const ProductDetailModal = ({ product, isOpen, onClose, companyName, onAddToCart, browseOnly = false, lang = 'az' }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const imgUrl = productImageUrl(product);
  const name = qrLocalizedProductName(product, lang);
  const description = qrLocalizedDescription(product, lang);
  const price = Number(product.salePrice ?? product.SalePrice ?? 0);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex animate-fadeIn items-end justify-center p-0 transition-colors duration-300 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/70"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl animate-slideUp pb-[env(safe-area-inset-bottom)] ring-1 ring-gray-200 dark:bg-[#1C1C1E] dark:ring-0 sm:rounded-[2rem]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200/80 bg-white/90 text-gray-700 shadow-sm backdrop-blur-md transition active:scale-90 dark:border-white/10 dark:bg-black/40 dark:text-white"
          aria-label="Bağla"
        >
          <FiX size={22} />
        </button>

        <div className="overflow-y-auto no-scrollbar pb-8">
          <div className="relative h-72 w-full bg-gray-100 sm:h-80 dark:bg-black">
            {imgUrl ? (
              <img src={imgUrl} className="h-full w-full object-cover" alt={name} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-[#2C2C2E]">
                <span className="text-5xl font-black uppercase italic text-gray-300 dark:text-white/20">
                  {companyName}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-black uppercase italic leading-tight tracking-tighter text-gray-900 dark:text-white">
                {name}
              </h2>
              <div className="shrink-0 rounded-2xl border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-4 py-2 dark:bg-[#38bdf8]/15">
                <span className="whitespace-nowrap text-lg font-black text-[#38bdf8]">
                  {price.toFixed(2)} ₼
                </span>
              </div>
            </div>

            {description ? (
              <p className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-base font-medium italic leading-relaxed text-gray-600 dark:border-white/10 dark:bg-black/30 dark:text-[#AEAEB2]">
                {description}
              </p>
            ) : null}

            {!browseOnly ? (
              <button
                type="button"
                onClick={() => onAddToCart?.(product, 1)}
                className="flex w-full items-center justify-center gap-3 rounded-3xl bg-[#38bdf8] py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#38bdf8]/30 transition active:scale-[0.99]"
              >
                <FiPlus size={18} />
                Səbətə əlavə et
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ProductDetailModal;
