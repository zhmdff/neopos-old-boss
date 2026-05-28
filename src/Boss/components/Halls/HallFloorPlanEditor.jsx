import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiAlertCircle,
  FiMaximize2,
  FiMinimize2,
  FiSave,
  FiRotateCcw,
  FiSquare,
  FiCircle,
  FiX,
} from 'react-icons/fi';
import api from '../../../api/axios';

const MIN_W = 6;
const MAX_W = 42;
const MIN_H = 6;
const MAX_H = 48;

/** Hazır masa ölçüləri (% en / hündürlük). */
const PRESET_MAP_SIZES = [12, 14, 16, 18];

function pickNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Mərkəz koordinatları ilə neçə sütun sığır (sağ kənar + son masa ölçüsü nəzərə alınır). */
function computeGridColumnCount(boxW) {
  const pad = 0.8;
  const gapX = Math.max(0.8, boxW * 0.06);
  const cellW = boxW + gapX;
  const startX = boxW / 2 + pad;
  const maxCenterX = 100 - boxW / 2 - pad;

  let cols = 0;
  let cx = startX;
  while (cx <= maxCenterX + 1e-4) {
    cols += 1;
    cx += cellW;
  }
  return Math.max(1, cols);
}

function computeDefaultMapCenter(index, opts) {
  const i = index ?? 0;
  const w = pickNum(opts?.w, 11);
  const h = pickNum(opts?.h, 13);
  const circle = opts?.shape === 1;
  const boxW = circle ? Math.min(w, h) : w;
  const boxH = circle ? Math.min(w, h) : h;

  // Koordinatlar mərkəzdir (translate(-50%, -50%)).
  const pad = 0.8;
  const gapX = Math.max(0.8, boxW * 0.06);
  const gapY = Math.max(1, boxH * 0.08);
  const cellW = boxW + gapX;
  const cellH = boxH + gapY;

  const startX = boxW / 2 + pad;
  const startY = boxH / 2 + pad;
  const maxCenterX = 100 - boxW / 2 - pad;
  const maxCenterY = 100 - boxH / 2 - pad;

  const cols = computeGridColumnCount(boxW);
  const col = i % cols;
  const row = Math.floor(i / cols);

  const x = Math.min(maxCenterX, startX + col * cellW);
  const y = Math.min(maxCenterY, startY + row * cellH);
  return { x, y, boxW, boxH };
}

function tableHasStoredMapOnServer(t) {
  const x = t.mapPositionX ?? t.MapPositionX;
  const y = t.mapPositionY ?? t.MapPositionY;
  return x != null && y != null;
}

/** Ekranda göstərmək üçün (koordinat yoxdursa şəbəkə hesablanır). */
function normalizeTableRow(t, index) {
  const i = index ?? 0;
  const shape = Number(t.mapShape ?? t.MapShape ?? 0) === 1 ? 1 : 0;
  const w = pickNum(t.mapWidthPercent ?? t.MapWidthPercent, 11);
  const h = pickNum(t.mapHeightPercent ?? t.MapHeightPercent, 13);
  const d = computeDefaultMapCenter(i, { w, h, shape });
  return {
    ...t,
    mapWidthPercent: w,
    mapHeightPercent: h,
    mapShape: shape,
    mapPositionX: pickNum(t.mapPositionX ?? t.MapPositionX, d.x),
    mapPositionY: pickNum(t.mapPositionY ?? t.MapPositionY, d.y),
    nameAz: t.nameAz ?? t.NameAz ?? '',
    capacity: Number(t.capacity ?? t.Capacity ?? 0),
    depositAmount: t.depositAmount ?? t.DepositAmount ?? 0,
    depositStartTime: t.depositStartTime ?? t.DepositStartTime ?? '',
    depositEndTime: t.depositEndTime ?? t.DepositEndTime ?? '',
    id: t.id ?? t.Id,
    orderIndex: t.orderIndex ?? t.OrderIndex ?? 0,
  };
}

function initWorkingRow(t, index) {
  const row = normalizeTableRow(t, index);
  return {
    ...row,
    _hasStoredMap: tableHasStoredMapOnServer(t),
    _layoutTouched: false,
  };
}

/** Yalnız serverə yazılacaq / müqayisə olunacaq sxem (saxlanmamış default koordinatlar daxil deyil). */
function serializeStoredLayout(rows) {
  return JSON.stringify(
    rows.map((r) => ({
      id: r.id,
      mapPositionX: r._hasStoredMap || r._layoutTouched ? r.mapPositionX : null,
      mapPositionY: r._hasStoredMap || r._layoutTouched ? r.mapPositionY : null,
      mapWidthPercent: r._hasStoredMap || r._layoutTouched ? r.mapWidthPercent : null,
      mapHeightPercent: r._hasStoredMap || r._layoutTouched ? r.mapHeightPercent : null,
      mapShape: r._hasStoredMap || r._layoutTouched ? r.mapShape : null,
    })),
  );
}

/** Sıfırlama: saxlanmış koordinatları nəzərə almadan, yuxarı-soldan sıra ilə şəbəkə (computeDefaultMapCenter). */
function forceDefaultPositions(t, index) {
  return normalizeTableRow(
    { ...t, mapPositionX: undefined, mapPositionY: undefined, MapPositionX: undefined, MapPositionY: undefined },
    index,
  );
}

function clampNum(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/** Ölçü dəyişəndə masaları şəbəkədə yenidən düzür — üst-üstə düşməsin. */
function relayoutTablesGrid(rows, w, h) {
  const nw = clampNum(w, MIN_W, MAX_W);
  const nh = clampNum(h, MIN_H, MAX_H);
  return rows.map((r, idx) => {
    const shape = r.mapShape === 1 ? 1 : 0;
    const boxW = shape === 1 ? Math.min(nw, nh) : nw;
    const boxH = shape === 1 ? Math.min(nw, nh) : nh;
    const d = computeDefaultMapCenter(idx, { w: nw, h: nh, shape });
    return {
      ...r,
      mapWidthPercent: boxW,
      mapHeightPercent: boxH,
      mapPositionX: d.x,
      mapPositionY: d.y,
      _layoutTouched: true,
    };
  });
}

function depositPayloadPart(t) {
  const ds = t.depositStartTime ? String(t.depositStartTime).substring(0, 5) : '';
  const de = t.depositEndTime ? String(t.depositEndTime).substring(0, 5) : '';
  return {
    depositAmount: parseFloat(t.depositAmount) || 0,
    depositStartTime: ds ? `${ds}:00` : null,
    depositEndTime: de ? `${de}:00` : null,
  };
}

const HallFloorPlanEditor = ({ isOpen, hall, onClose, onSaved }) => {
  const canvasRef = useRef(null);
  const [working, setWorking] = useState([]);
  const [baseline, setBaseline] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncAllSizes, setSyncAllSizes] = useState(false);
  const [presetSize, setPresetSize] = useState('');
  const dragRef = useRef(null);
  const syncAllSizesRef = useRef(false);

  const sortedTables = useMemo(() => {
    if (!hall) return [];
    const raw = hall.tables || hall.Tables || [];
    return [...raw].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [hall]);

  useEffect(() => {
    if (!isOpen || !hall) return;
    const rows = sortedTables.map((t, idx) => initWorkingRow(t, idx));
    setWorking(rows);
    setBaseline(serializeStoredLayout(rows));
    setSelectedId(null);
    setSyncAllSizes(false);
    setPresetSize('');
    setFullScreen(true);
  }, [isOpen, hall, sortedTables]);

  useEffect(() => {
    syncAllSizesRef.current = syncAllSizes;
  }, [syncAllSizes]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const dirty = useMemo(() => serializeStoredLayout(working) !== baseline, [working, baseline]);

  const canvasInnerStyle = useMemo(() => {
    if (!working.length) {
      return { minHeight: 'min(78dvh, 720px)', paddingBottom: 'min(28%, 220px)', paddingTop: 'min(6%, 48px)' };
    }
    const lastIdx = working.length - 1;
    const sample = working[lastIdx];
    const w = Number(sample?.mapWidthPercent) || 11;
    const h = Number(sample?.mapHeightPercent) || 13;
    const d = computeDefaultMapCenter(lastIdx, { w, h, shape: sample?.mapShape === 1 ? 1 : 0 });
    const needY = d.y + h / 2 + 6;
    return {
      minHeight: `max(min(78dvh, 720px), ${Math.ceil(needY * 9)}px)`,
      paddingBottom: `${Math.max(28, Math.ceil(h * 2.2))}%`,
      paddingTop: 'min(6%, 48px)',
    };
  }, [working]);

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const applyMapSize = useCallback((w, h, targetId = null) => {
    const nw = clamp(w, MIN_W, MAX_W);
    const nh = clamp(h, MIN_H, MAX_H);
    setWorking((prev) => {
      const affectAll = syncAllSizesRef.current && targetId == null;
      if (affectAll) {
        return relayoutTablesGrid(prev, nw, nh);
      }
      return prev.map((r) => {
        if (targetId != null && r.id !== targetId) return r;
        if (r.mapShape === 1) {
          const s = Math.min(nw, nh);
          return { ...r, mapWidthPercent: s, mapHeightPercent: s, _layoutTouched: true };
        }
        return { ...r, mapWidthPercent: nw, mapHeightPercent: nh, _layoutTouched: true };
      });
    });
  }, []);

  const updateTable = useCallback((id, patch) => {
    if (
      syncAllSizesRef.current &&
      (patch.mapWidthPercent != null || patch.mapHeightPercent != null)
    ) {
      setWorking((prev) => {
        const row = prev.find((w) => w.id === id);
        const w = patch.mapWidthPercent ?? row?.mapWidthPercent ?? 11;
        const h = patch.mapHeightPercent ?? row?.mapHeightPercent ?? 13;
        return relayoutTablesGrid(prev, w, h);
      });
      return;
    }
    setWorking((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch, _layoutTouched: true } : r)),
    );
  }, []);

  const onPointerDownTable = useCallback(
    (e, id) => {
      if (e.target.closest('[data-resize-handle]')) return;
      e.preventDefault();
      e.stopPropagation();
      setSelectedId(id);
      const el = canvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const row = working.find((w) => w.id === id);
      if (!row) return;
      dragRef.current = {
        kind: 'move',
        id,
        startX: e.clientX,
        startY: e.clientY,
        origX: row.mapPositionX,
        origY: row.mapPositionY,
        rectW: rect.width,
        rectH: rect.height,
      };
    },
    [working],
  );

  const onPointerDownResize = useCallback(
    (e, id) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedId(id);
      const el = canvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const row = working.find((w) => w.id === id);
      if (!row) return;
      dragRef.current = {
        kind: 'resize',
        id,
        startX: e.clientX,
        startY: e.clientY,
        origW: row.mapWidthPercent,
        origH: row.mapHeightPercent,
        rectW: rect.width,
        rectH: rect.height,
      };
    },
    [working],
  );

  useEffect(() => {
    if (!isOpen) return;

    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = ((e.clientX - d.startX) / d.rectW) * 100;
      const dy = ((e.clientY - d.startY) / d.rectH) * 100;
      if (d.kind === 'move') {
        const nx = clamp(d.origX + dx, 0, 100);
        const ny = clamp(d.origY + dy, 0, 100);
        updateTable(d.id, { mapPositionX: nx, mapPositionY: ny });
      } else {
        const nw = clamp(d.origW + dx, MIN_W, MAX_W);
        const nh = clamp(d.origH + dy, MIN_H, MAX_H);
        if (syncAllSizesRef.current) {
          applyMapSize(nw, nh);
        } else {
          updateTable(d.id, { mapWidthPercent: nw, mapHeightPercent: nh });
        }
      }
    };

    const onUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [isOpen, updateTable, applyMapSize]);

  const handlePresetSizeChange = (raw) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      setPresetSize('');
      return;
    }
    setPresetSize(String(n));
    if (syncAllSizes) {
      applyMapSize(n, n);
      return;
    }
    if (selectedId) {
      applyMapSize(n, n, selectedId);
    }
  };

  const handleReset = () => {
    if (
      !window.confirm(
        'Masa sxemindəki yerləşmə və ölçülər (cari sessiya) sıfırlansın? Bütün masalar yuxarı-soldan sıra ilə yenidən düzüləcək.',
      )
    ) {
      return;
    }
    setWorking((prev) =>
      prev.map((t, idx) => ({
        ...forceDefaultPositions(t, idx),
        _hasStoredMap: false,
        _layoutTouched: true,
      })),
    );
  };

  const requestClose = () => {
    if (!dirty || window.confirm('Yadda saxlanmamış dəyişikliklər itəcək. Bağlansın?')) onClose();
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const companyId = user?.companyId;
    if (!companyId || !hall) return;
    setSaving(true);
    try {
      for (const t of working) {
        const dep = depositPayloadPart(t);
        const body = {
          id: t.id,
          nameAz: t.nameAz,
          capacity: parseInt(t.capacity, 10) || 0,
          ...dep,
          hallId: hall.id,
          companyId,
          mapPositionX: t.mapPositionX,
          mapPositionY: t.mapPositionY,
          mapWidthPercent: t.mapWidthPercent,
          mapHeightPercent: t.mapHeightPercent,
          mapShape: t.mapShape,
        };
        await api.put('/Tables', body);
      }
      setBaseline(serializeStoredLayout(working));
      if (onSaved) await onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Yadda saxlanılmadı');
    } finally {
      setSaving(false);
    }
  };

  const toggleShape = () => {
    if (!selectedId) return;
    const t = working.find((w) => w.id === selectedId);
    if (!t) return;
    updateTable(selectedId, { mapShape: t.mapShape === 1 ? 0 : 1 });
  };

  if (!isOpen || !hall) return null;

  const shellClass = fullScreen
    ? 'fixed inset-0 left-0 top-0 z-[99999] flex h-[100dvh] w-screen max-h-[100dvh] min-h-0 flex-col bg-slate-100'
    : 'fixed z-[99999] flex max-h-[min(94dvh,920px)] min-h-[min(70dvh,640px)] w-[min(calc(100vw-1rem),1100px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:max-w-[calc(100vw-6rem)]';

  return createPortal(
    <>
      {!fullScreen ? (
        <button
          type="button"
          className="fixed inset-0 z-[99998] cursor-default bg-slate-900/50 backdrop-blur-[2px]"
          aria-label="Bağla"
          onClick={requestClose}
        />
      ) : null}
      <div className={shellClass}>
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:items-center sm:px-5 sm:py-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-black uppercase tracking-tight text-slate-900 sm:text-lg">
            {hall.nameAz} — Masa sxemi
          </h1>
          <p className="mt-0.5 text-[10px] font-bold leading-snug text-slate-400 sm:text-[11px]">
            Masanı sürüşdürün; küncdən ölçü; «Hamıya eyni ölçü» və ya hazır ölçü (12–18); seçəndə dairə / kvadrat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
            onClick={() => setFullScreen((v) => !v)}
            title={fullScreen ? 'Kiçilt' : 'Tam ekran'}
          >
            {fullScreen ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
            onClick={requestClose}
          >
            <FiX size={22} />
          </button>
        </div>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-3 md:p-4"
        onPointerDown={() => setSelectedId(null)}
      >
        <div
          ref={canvasRef}
          className="relative min-h-0 w-full flex-1 overflow-auto overscroll-contain rounded-2xl border-2 border-[#0ea5e9]/20 bg-white shadow-inner"
          style={{
            backgroundImage:
              'linear-gradient(rgba(2,0,254,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(2,0,254,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {working.length === 0 ? (
            <div className="flex min-h-[12rem] items-center justify-center px-4 text-sm font-bold text-slate-400">
              Bu zalda masa yoxdur — əvvəlcə masa əlavə edin.
            </div>
          ) : (
            <div className="relative mx-auto w-full" style={canvasInnerStyle}>
            {working.map((t) => {
              const isSel = selectedId === t.id;
              const circle = t.mapShape === 1;
              const w = Number(t.mapWidthPercent) || 11;
              const h = Number(t.mapHeightPercent) || 13;
              const boxW = circle ? Math.min(w, h) : w;
              const boxH = circle ? Math.min(w, h) : h;
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => onPointerDownTable(e, t.id)}
                  className={`absolute flex cursor-grab select-none flex-col items-center justify-center border-2 bg-white px-1 py-1 text-center shadow-sm active:cursor-grabbing ${
                    isSel ? 'border-[#0ea5e9] ring-2 ring-[#0ea5e9]/30 z-20' : 'border-[#0ea5e9]/50 z-10'
                  } ${circle ? 'overflow-hidden rounded-full' : ''}`}
                  style={{
                    left: `${t.mapPositionX}%`,
                    top: `${t.mapPositionY}%`,
                    width: `${boxW}%`,
                    height: `${boxH}%`,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: circle ? undefined : '14px',
                  }}
                >
                  <span className="max-w-full truncate text-[11px] font-black uppercase leading-tight text-slate-900 sm:text-xs">
                    {t.nameAz}
                  </span>
                  <button
                    type="button"
                    data-resize-handle
                    onPointerDown={(e) => onPointerDownResize(e, t.id)}
                    className="absolute bottom-0.5 right-0.5 h-4 w-4 cursor-nwse-resize rounded-sm border border-[#0ea5e9]/40 bg-white"
                    title="Ölçü"
                  />
                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-700 hover:bg-slate-50"
          >
            <FiRotateCcw /> Sıfırla
          </button>
          <button
            type="button"
            onClick={toggleShape}
            disabled={!selectedId}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <FiSquare /> / <FiCircle /> Forma
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-700 hover:bg-slate-50">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#0ea5e9]"
              checked={syncAllSizes}
              onChange={(e) => {
                const on = e.target.checked;
                setSyncAllSizes(on);
                if (on) {
                  setWorking((prev) => {
                    if (!prev.length) return prev;
                    const ref = prev[0];
                    return relayoutTablesGrid(
                      prev,
                      ref.mapWidthPercent ?? 11,
                      ref.mapHeightPercent ?? 13,
                    );
                  });
                }
              }}
            />
            Hamıya eyni ölçü
          </label>
          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-700">
            <span className="text-slate-500">Hazır ölçü</span>
            <select
              value={presetSize}
              disabled={!syncAllSizes && !selectedId}
              onChange={(e) => handlePresetSizeChange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-900 outline-none focus:border-[#0ea5e9] disabled:opacity-40"
            >
              <option value="">—</option>
              {PRESET_MAP_SIZES.map((s) => (
                <option key={s} value={String(s)}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {dirty && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-amber-700">
              <FiAlertCircle /> Yadda saxlanmamış dəyişikliklər
            </span>
          )}
          <button
            type="button"
            onClick={requestClose}
            className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50"
          >
            Bağla
          </button>
          <button
            type="button"
            disabled={saving || working.length === 0}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 disabled:opacity-50"
          >
            <FiSave /> {saving ? '…' : 'Yadda saxla'}
          </button>
        </div>
      </footer>
      </div>
    </>,
    document.body,
  );
};

export default HallFloorPlanEditor;
