import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MENU_ESTIMATE_H = 220;
const MENU_ESTIMATE_W = 240;
const GAP = 6;
const PAD = 8;

/**
 * DnD transform / overflow-hidden konteynerlərindən asılı olmayan dropdown.
 * Anchor düyməsinin viewport koordinatlarına görə fixed yerləşir; yer çatmazsa yuxarı açılır.
 */
export default function BossDropdownMenu({ isOpen, onClose, anchorRef, children, className = '' }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef?.current;
    if (!anchor) return;

    const r = anchor.getBoundingClientRect();
    const menuEl = menuRef.current;
    const menuW = menuEl?.offsetWidth || Math.min(MENU_ESTIMATE_W, window.innerWidth - PAD * 2);
    const menuH = menuEl?.offsetHeight || MENU_ESTIMATE_H;

    let top = r.bottom + GAP;
    if (top + menuH > window.innerHeight - PAD) {
      top = Math.max(PAD, r.top - menuH - GAP);
    }

    let left = r.right - menuW;
    left = Math.max(PAD, Math.min(left, window.innerWidth - menuW - PAD));

    setPos({ top, left });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPos(null);
      return undefined;
    }
    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(raf);
  }, [isOpen, updatePosition, children]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !pos || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Menyunu bağla"
        className="fixed inset-0 z-[200] cursor-default border-0 bg-transparent p-0"
        onClick={onClose}
      />
      <div
        ref={menuRef}
        role="menu"
        className={`fixed z-[201] w-[min(15rem,calc(100vw-2rem))] rounded-2xl border border-slate-200/90 bg-white py-1.5 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/5 ${className}`}
        style={{ top: pos.top, left: pos.left }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
