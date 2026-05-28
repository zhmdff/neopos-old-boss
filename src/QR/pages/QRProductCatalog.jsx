import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MenuCatalog from '../components/MenuCatalog';
import ProductDetailModal from '../components/ProductDetailModal';
import QrBottomNav from '../components/QrBottomNav';
import { useQrLang, useQrTheme } from '../hooks/useQrTheme';
import { qrT } from '../i18n/qrLocales';
import { qrLocalizedName, qrProductSearchHaystack, qrLocalizedProductName } from '../utils/qrLocalizedFields';
import { FiSearch, FiX } from 'react-icons/fi';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import { mediaUrl } from '../../utils/mediaUrl';

const QRProductCatalog = () => {
  const { slug } = useParams();
  useQrTheme();
  const { lang } = useQrLang(slug);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDetailProduct, setSearchDetailProduct] = useState(null);
  const apiBase = getApiBaseUrl();

  useEffect(() => {
    axios
      .get(`${apiBase}/QRMenu/full-menu/${slug}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [slug, apiBase]);

  const allProducts = data?.categories?.flatMap((cat) => cat.products) || [];
  const term = searchTerm.trim().toLowerCase();
  const filteredProducts = term
    ? allProducts.filter((p) => qrProductSearchHaystack(p).includes(term))
    : [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f2f2f7] dark:bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#38bdf8]/30 border-t-[#38bdf8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] pb-24 transition-colors dark:bg-black">
      <MenuCatalog
        categories={data?.categories}
        company={data}
        companyName={data?.nameAz || data?.name}
        settings={data?.settings}
        lang={lang}
        browseOnly
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {isSearchOpen && (
        <div className="animate-fadeIn fixed inset-0 z-[120] flex flex-col bg-[#f2f2f7] dark:bg-black">
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4 dark:border-white/10">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                autoFocus
                type="text"
                placeholder={qrT(lang, 'searchPlaceholder')}
                className="w-full rounded-2xl border-none bg-white py-3.5 pl-12 pr-4 text-sm font-semibold shadow-sm ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-[#38bdf8]/40 dark:bg-[#1C1C1E] dark:text-white dark:ring-white/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchTerm('');
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1C1C1E] text-[#38bdf8] dark:bg-[#2C2C2E]"
              aria-label="Bağla"
            >
              <FiX size={22} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {term.length > 0 ? (
              filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => setSearchDetailProduct(product)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm transition active:scale-[0.98] dark:border-white/10 dark:bg-[#1C1C1E]"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-[#2C2C2E]">
                      {product.imageUrl ? (
                        <img
                          src={mediaUrl(product.imageUrl)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-gray-300">
                          {qrLocalizedName(data, lang)?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {qrLocalizedProductName(product, lang)}
                      </h4>
                      <span className="text-sm font-bold text-[#38bdf8]">
                        {Number(product.salePrice).toFixed(2)} ₼
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-sm font-semibold text-gray-400">{qrT(lang, 'productNotFound')}</p>
                </div>
              )
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-gray-400">{qrT(lang, 'searchHint')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ProductDetailModal
        isOpen={Boolean(searchDetailProduct)}
        product={searchDetailProduct}
        onClose={() => setSearchDetailProduct(null)}
        companyName={qrLocalizedName(data, lang)}
        browseOnly
        lang={lang}
      />

      <QrBottomNav active="menu" lang={lang} />
    </div>
  );
};

export default QRProductCatalog;
