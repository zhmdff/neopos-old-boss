import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX,
  FiDownload,
  FiUploadCloud,
  FiEye,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
} from 'react-icons/fi';
import api from '../../../api/axios';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const MenuImportModal = ({ isOpen, onClose, companyId, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingApply, setLoadingApply] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'ok') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFile(null);
      setPreview(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const downloadTemplate = async () => {
    if (!companyId) return;
    setLoadingTemplate(true);
    try {
      const res = await api.get('/MenuImport/template', {
        responseType: 'blob',
        headers: authHeaders(),
      });
      downloadBlob(res.data, 'neopos-menu-import-sablon.xlsx');
      showToast('Şablon yükləndi.');
    } catch (e) {
      showToast(e.response?.data?.message || 'Şablon alınmadı.', 'err');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const downloadExport = async () => {
    if (!companyId) return;
    setLoadingExport(true);
    try {
      const res = await api.get(`/MenuImport/export?companyId=${companyId}`, {
        responseType: 'blob',
        headers: authHeaders(),
      });
      const dispo = res.headers['content-disposition'];
      let name = 'neopos-menu-export.xlsx';
      if (dispo && dispo.includes('filename=')) {
        const m = /filename="?([^";]+)"?/.exec(dispo);
        if (m) name = m[1];
      }
      downloadBlob(res.data, name);
      showToast('Menyu faylı yükləndi.');
    } catch (e) {
      let msg = 'Export alınmadı.';
      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const j = JSON.parse(text);
          if (j.message) msg = j.message;
        } catch {
          /* ignore */
        }
      } else if (e.response?.data?.message) msg = e.response.data.message;
      showToast(msg, 'err');
    } finally {
      setLoadingExport(false);
    }
  };

  const runPreview = async () => {
    if (!companyId || !file) {
      showToast('Əvvəlcə .xlsx fayl seçin.', 'err');
      return;
    }
    setLoadingPreview(true);
    setPreview(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post(`/MenuImport/preview?companyId=${companyId}`, fd, {
        headers: { ...authHeaders() },
      });
      setPreview(res.data);
      if (res.data.generalErrors?.length || !res.data.isValid) {
        showToast('Önizləmədə xətalar var — aşağıda yoxlayın.', 'err');
      } else {
        showToast('Önizləmə hazırdır.');
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Önizləmə alınmadı.', 'err');
    } finally {
      setLoadingPreview(false);
    }
  };

  const runApply = async () => {
    if (!companyId || !file) return;
    if (!preview?.isValid || preview?.generalErrors?.length) {
      showToast('Əvvəlcə xətasız önizləmə aparın.', 'err');
      return;
    }
    if (!window.confirm('Seçilmiş fayl üzrə yeni kateqoriya və məhsullar yaradılsın? Bu əməliyyat geri qaytarılmır.')) return;

    setLoadingApply(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post(`/MenuImport/apply?companyId=${companyId}`, fd, {
        headers: { ...authHeaders() },
      });
      showToast(res.data?.message || 'İmport tamamlandı.');
      onImportSuccess?.();
      onClose();
    } catch (e) {
      showToast(e.response?.data?.message || 'İmport alınmadı.', 'err');
    } finally {
      setLoadingApply(false);
    }
  };

  if (!isOpen) return null;

  const newCats = preview?.categories?.filter((c) => c.willBeCreated) ?? [];
  const existingCats = preview?.categories?.filter((c) => c.alreadyExists) ?? [];
  const productErrors = preview?.products?.filter((p) => p.error) ?? [];

  const modalBody = (
    <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center overflow-hidden px-2">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} role="presentation" />

      <div className="bg-white w-[95%] max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] border border-gray-100 relative z-10 overflow-hidden animate-modalShow">
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#f8f9ff] to-white flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-[#1e293b] uppercase italic tracking-tighter">Menyu Excel</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Export, şablon və toplu import
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            aria-label="Bağla"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-[#fafbfc] space-y-6">
          {/* Export / şablon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9]">
                  <FiDownload size={22} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Cari menyu</p>
                  <p className="text-sm font-bold text-[#1e293b] mt-1">Bazadan .xlsx export</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    Kateqoriya və məhsul siyahısını redaktə edib yenidən import edə bilərsiniz.
                  </p>
                  <button
                    type="button"
                    onClick={downloadExport}
                    disabled={loadingExport || !companyId}
                    className="mt-4 w-full py-3.5 rounded-2xl bg-[#0f172a] text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loadingExport ? '…' : <><FiFileText /> Menyunu yüklə</>}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <FiFileText size={22} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Boş şablon</p>
                  <p className="text-sm font-bold text-[#1e293b] mt-1">Sütun başlıqları ilə fayl</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    «Kateqoriyalar» və «Məhsullar» vərəqləri bir faylda.
                  </p>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    disabled={loadingTemplate}
                    className="mt-4 w-full py-3.5 rounded-2xl border-2 border-gray-100 text-[11px] font-black uppercase tracking-widest text-[#1e293b] hover:border-[#0ea5e9]/30 hover:bg-sky-50/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loadingTemplate ? '…' : <><FiDownload /> Şablon yüklə</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Import */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm text-left">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">İmport</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="flex-1 cursor-pointer group">
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border-2 border-dashed border-gray-200 group-hover:border-[#0ea5e9]/40 group-hover:bg-sky-50/30 transition-all">
                  <FiUploadCloud className="text-[#0ea5e9] flex-shrink-0" size={24} />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#1e293b] uppercase tracking-wide truncate">
                      {file ? file.name : '.xlsx fayl seçin'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                      2 vərəq: Kateqoriyalar, Məhsullar
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setFile(f || null);
                    setPreview(null);
                  }}
                />
              </label>
              <button
                type="button"
                onClick={runPreview}
                disabled={loadingPreview || !file}
                className="px-6 py-4 rounded-2xl bg-[#0ea5e9] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-200/50 hover:opacity-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2 sm:min-w-[160px]"
              >
                {loadingPreview ? '…' : <><FiEye /> Önizlə</>}
              </button>
            </div>
          </div>

          {preview && (
            <div className="space-y-4 animate-fadeIn">
              {preview.generalErrors?.length > 0 && (
                <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-left">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                    <FiAlertCircle /> Ümumi xətalar
                  </p>
                  <ul className="mt-2 text-sm text-red-800 space-y-1 list-disc list-inside">
                    {preview.generalErrors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-[1.5rem] border border-gray-100 bg-white overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Kateqoriyalar ({preview.categories?.length ?? 0})
                  </div>
                  <div className="max-h-48 overflow-y-auto text-xs">
                    {newCats.length > 0 && (
                      <div className="p-3 border-b border-gray-50">
                        <p className="text-[9px] font-black text-emerald-600 uppercase mb-2">Yaradılacaq</p>
                        <ul className="space-y-1 text-[#1e293b] font-semibold">
                          {newCats.map((c) => (
                            <li key={c.nameAz}>
                              {c.nameAz}
                              {c.parentName ? (
                                <span className="text-gray-400 font-normal"> — valideyn: {c.parentName}</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {existingCats.length > 0 && (
                      <div className="p-3">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Artıq bazada</p>
                        <ul className="space-y-1 text-gray-600">
                          {existingCats.map((c) => (
                            <li key={c.nameAz}>{c.nameAz}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-gray-100 bg-white overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Məhsullar ({preview.products?.length ?? 0})</span>
                    {preview.isValid && !preview.generalErrors?.length ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <FiCheckCircle size={14} /> Hazır
                      </span>
                    ) : null}
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="sticky top-0 bg-white shadow-sm">
                        <tr className="text-gray-400 font-black uppercase tracking-tighter">
                          <th className="px-3 py-2">Sətir</th>
                          <th className="px-3 py-2">Ad</th>
                          <th className="px-3 py-2">Xəta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(preview.products ?? []).map((p) => (
                          <tr key={p.excelRowNumber + (p.nameAz || '')} className={p.error ? 'bg-red-50/80' : ''}>
                            <td className="px-3 py-2 font-mono text-gray-500">{p.excelRowNumber}</td>
                            <td className="px-3 py-2 font-semibold text-[#1e293b] max-w-[140px] truncate">{p.nameAz || '—'}</td>
                            <td className="px-3 py-2 text-red-600 font-medium">{p.error || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {productErrors.length > 0 && (
                <p className="text-center text-[10px] font-black text-amber-600 uppercase tracking-widest">
                  {productErrors.length} məhsul sətirində xəta — import bloklanıb
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-all order-2 sm:order-1"
          >
            Bağla
          </button>
          <button
            type="button"
            onClick={runApply}
            disabled={
              loadingApply ||
              !file ||
              !preview?.isValid ||
              (preview?.generalErrors?.length ?? 0) > 0
            }
            className="order-1 sm:order-2 bg-[#0ea5e9] text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loadingApply ? 'İdxal olunur…' : <><FiCheckCircle /> İmportu təsdiqlə</>}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100000] px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold uppercase tracking-wide ${
            toast.type === 'err' ? 'bg-red-600 text-white' : 'bg-[#0f172a] text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );

  return createPortal(modalBody, document.body);
};

export default MenuImportModal;
