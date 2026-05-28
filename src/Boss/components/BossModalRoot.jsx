import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modalı document.body üzərində göstərir — BossLayout (overflow-hidden / scroll main)
 * içində fixed modalların kəsilməsinin və sürüşməsinin qarşısını alır.
 */
export default function BossModalRoot({
  isOpen,
  onBackdropClose,
  maxWidth = 'max-w-lg',
  children,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && onBackdropClose) onBackdropClose();
      }}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" aria-hidden />
      <div
        className={`relative z-10 w-full ${maxWidth} animate-fadeIn`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
