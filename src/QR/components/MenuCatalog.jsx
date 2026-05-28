import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductDetailModal from './ProductDetailModal';
import QrMenuHeader from './QrMenuHeader';
import { qrLocalizedName, qrLocalizedDescription, qrLocalizedProductName } from '../utils/qrLocalizedFields';
import { mediaUrl } from '../../utils/mediaUrl';

const MenuCatalog = ({
  categories,
  company,
  companyName,
  settings,
  lang = 'az',
  onAddToCart,
  qtyByProductId,
  browseOnly = false,
  onSearchClick,
}) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const observer = useRef(null);
  const navRef = useRef(null);

  const displayCompanyName = company ? qrLocalizedName(company, lang) : companyName || '';

  useEffect(() => {
    if (categories?.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (!categories || categories.length === 0) return;

    const handleObserver = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.id.replace('cat-', '');
          setActiveCategory(categoryId);
          const navButton = document.getElementById(`nav-btn-${categoryId}`);
          if (navButton && navRef.current) {
            navButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: '-20% 0px -75% 0px',
      threshold: 0,
    });

    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.current.observe(el);
    });

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [categories]);

  const openProductDetail = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const scrollToCategory = (id) => {
    const element = document.getElementById(`cat-${id}`);
    if (element) {
      const headerOffset = 56;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setActiveCategory(id);
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="relative min-h-screen bg-[#f2f2f7] transition-colors dark:bg-black">
      <QrMenuHeader
        company={company}
        settings={settings}
        lang={lang}
        onSearchClick={onSearchClick}
      />

      <div className="sticky top-0 z-40 border-b border-gray-200 bg-[#f2f2f7]/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
        <div className="mx-auto max-w-lg">
          <div
            ref={navRef}
            className="no-scrollbar flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain px-4 py-3"
          >
            {categories.map((cat) => {
              const catName = qrLocalizedName(cat, lang);
              const isActive = String(activeCategory) === String(cat.id);
              return (
                <button
                  key={cat.id}
                  id={`nav-btn-${cat.id}`}
                  type="button"
                  onClick={() => scrollToCategory(cat.id)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#38bdf8] text-white shadow-md shadow-[#38bdf8]/30'
                      : 'bg-[#E5E5EA] text-gray-700 dark:bg-[#2C2C2E] dark:text-[#AEAEB2]'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`mx-auto max-w-lg space-y-10 px-4 py-6 ${browseOnly ? 'pb-10' : 'pb-40'}`}>
        {categories.map((cat) => {
          const catName = qrLocalizedName(cat, lang);
          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-14">
              <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white">{catName}</h2>

              <div className="grid grid-cols-1 gap-4">
                {cat.products?.map((product) => {
                  const productName = qrLocalizedProductName(product, lang);
                  const productDesc = qrLocalizedDescription(product, lang);
                  const imagePath = product.imageUrl || product.ImageUrl || '';
                  const fullImgUrl = imagePath
                    ? mediaUrl(imagePath)
                    : null;
                  const pid = String(product.id ?? product.Id ?? '');
                  const qty =
                    !browseOnly && qtyByProductId && pid ? Number(qtyByProductId[pid] || 0) : 0;

                  const cardBody = (
                    <>
                      <div className="flex-1 space-y-1 pl-1">
                        <h3 className="text-base font-bold leading-snug text-gray-900 dark:text-white">
                          {productName}
                        </h3>
                        {productDesc ? (
                          <p className="line-clamp-2 text-xs text-gray-500 dark:text-[#8E8E93]">
                            {productDesc}
                          </p>
                        ) : null}
                        <div className="pt-1">
                          <span className="text-base font-bold text-[#38bdf8]">
                            {Number(product.salePrice ?? product.SalePrice).toFixed(2)} ₼
                          </span>
                        </div>
                      </div>

                      <div className="pointer-events-none flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-[#2C2C2E]">
                        {fullImgUrl ? (
                          <img
                            src={fullImgUrl}
                            className="h-full w-full object-cover"
                            alt={productName}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center p-2 text-center text-[10px] font-bold uppercase text-gray-300 dark:text-gray-600">
                            {displayCompanyName || 'Menu'}
                          </div>
                        )}
                      </div>
                    </>
                  );

                  const cardClassName =
                    'flex w-full touch-manipulation items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm transition-all active:scale-[0.98] dark:border-white/10 dark:bg-[#1C1C1E]';

                  if (browseOnly) {
                    return (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => openProductDetail(product)}
                        className={`${cardClassName} cursor-pointer`}
                      >
                        {cardBody}
                      </button>
                    );
                  }

                  return (
                    <div key={product.id} className={`${cardClassName} cursor-pointer`}>
                      <button
                        type="button"
                        onClick={() => openProductDetail(product)}
                        className="flex min-w-0 flex-1 touch-manipulation items-center gap-4 text-left"
                      >
                        {cardBody}
                      </button>

                      {!browseOnly ? (
                        <button
                          type="button"
                          onClick={() => onAddToCart?.(product, 1)}
                          className="relative flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-xl bg-[#38bdf8] text-lg font-black text-white shadow-md shadow-[#38bdf8]/30 transition active:scale-90"
                          aria-label="Səbətə əlavə et"
                        >
                          +
                          {qty > 0 ? (
                            <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-black text-[#38bdf8] shadow-sm">
                              {qty}
                            </span>
                          ) : null}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <ProductDetailModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => setIsModalOpen(false)}
        companyName={displayCompanyName}
        onAddToCart={onAddToCart}
        browseOnly={browseOnly}
        lang={lang}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default MenuCatalog;
