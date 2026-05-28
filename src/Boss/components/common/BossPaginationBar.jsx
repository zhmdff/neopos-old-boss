import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getPaginationItems } from '../../utils/paginationPages';

/**
 * @param {number} page — 1-based cari səhifə
 * @param {number} totalPages
 * @param {(n: number) => void} onPageChange
 */
export default function BossPaginationBar({ page, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(page, totalPages);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-2xl bg-gray-50 p-3 shadow-sm transition-all hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-25 sm:p-4"
          aria-label="Əvvəlki səhifə"
        >
          <FiChevronLeft size={20} />
        </button>

        <div className="flex max-w-[min(100vw-7rem,32rem)] flex-wrap justify-center gap-1.5 px-1 sm:max-w-[40rem]">
          {items.map((item, idx) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-10 w-7 shrink-0 select-none items-center justify-center text-base font-bold leading-none text-slate-400 sm:h-12"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                type="button"
                key={item}
                onClick={() => onPageChange(item)}
                className={`h-10 min-w-[2.5rem] shrink-0 rounded-xl px-2 text-[10px] font-black transition-all sm:h-12 sm:min-w-[3rem] sm:rounded-2xl sm:text-xs ${
                  page === item
                    ? 'bg-[#0ea5e9] text-white shadow-lg'
                    : 'bg-gray-50 text-gray-500 hover:bg-sky-50'
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-2xl bg-gray-50 p-3 shadow-sm transition-all hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-25 sm:p-4"
          aria-label="Növbəti səhifə"
        >
          <FiChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
