import React, { useEffect, useState, useCallback } from 'react';
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiDollarSign,
  FiCreditCard,
  FiLayers,
  FiLock,
  FiX,
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../api/axios';
import GlobalDeleteModal from '../components/GlobalDeleteModal';

const BUILTIN = [
  { key: 'cash', label: 'Nağd', Icon: FiDollarSign },
  { key: 'card', label: 'Kart', Icon: FiCreditCard },
  { key: 'mix', label: 'Nağd + Kart (qarışıq)', Icon: FiLayers },
];

function PaymentMethodModal({ isOpen, onClose, onSaved, companyId, editRow, nextSortOrder = 0 }) {
  const isEdit = !!editRow;
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(
      isEdit
        ? String(editRow.nameAz ?? editRow.NameAz ?? '')
        : ''
    );
  }, [isOpen, isEdit, editRow]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) {
      toast.error('Ad daxil edin');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        const id = editRow.id ?? editRow.Id;
        await api.put(`/companies/${companyId}/payment-methods/${id}`, {
          nameAz: n,
          sortOrder: editRow.sortOrder ?? editRow.SortOrder ?? 0,
        });
        toast.success('Yeniləndi');
      } else {
        await api.post(`/companies/${companyId}/payment-methods`, {
          nameAz: n,
          sortOrder: nextSortOrder,
        });
        toast.success('Əlavə olundu');
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Xəta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg overflow-hidden rounded-[3rem] border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 p-8">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              {isEdit ? 'Ödəniş üsulunu redaktə et' : 'Yeni ödəniş üsulu'}
            </h2>
            <p className="mt-2 text-[10px] font-bold uppercase italic tracking-widest text-[#0ea5e9]">
              {isEdit ? 'Adı yeniləyin' : 'Terminalda görünəcək etiket'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-3 text-gray-400 shadow-sm transition-all hover:bg-white hover:text-red-500"
          >
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <div>
            <label className="mb-2 ml-1 flex items-center gap-2 text-xs font-black uppercase text-gray-400">
              <FiLayers className="text-[#0ea5e9]" /> Ad
            </label>
            <input
              type="text"
              required
              placeholder="Məs: Wolt, Card to card…"
              maxLength={120}
              className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 font-bold text-gray-700 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#0ea5e9] py-5 text-lg font-black uppercase tracking-widest text-white shadow-xl shadow-[#0ea5e9]/20 transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? 'Gözləyin…' : 'Təsdiqlə'}
          </button>
        </form>
      </div>
    </div>
  );
}

const PaymentMethodsPage = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const companyId = user?.companyId;

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const r = await api.get(`/companies/${companyId}/payment-methods`);
      setItems(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Siyahı yüklənmədi');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditRow(null);
    setIsFormOpen(true);
  };

  const openEdit = (row) => {
    setEditRow(row);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRow || !companyId) return;
    const id = selectedRow.id ?? selectedRow.Id;
    setDeleteLoading(true);
    try {
      await api.delete(`/companies/${companyId}/payment-methods/${id}`);
      toast.success('Silindi');
      setIsDeleteOpen(false);
      setSelectedRow(null);
      await load();
    } catch {
      toast.error('Silinmədi');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!companyId) {
    return <div className="p-10 text-center font-bold text-slate-400">Şirkət tapılmadı</div>;
  }

  const hasRows = items.length > 0 || BUILTIN.length > 0;

  return (
    <div className="animate-fadeIn min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <Toaster position="bottom-right" />

      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black uppercase italic leading-none tracking-tight text-gray-900">
            Ödəniş üsulları
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase italic tracking-widest text-gray-400">
            Nağd, kart və əsas üsullar · əlavə etiketlər
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0ea5e9] px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:shadow-xl active:scale-95 sm:w-auto"
        >
          <FiPlus strokeWidth={3} size={18} /> Yeni ödəniş üsulu
        </button>
      </div>

      <div className="min-h-100 overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm md:rounded-[2.5rem]">
        <div className="hidden border-b border-gray-100 bg-gray-50/50 px-10 py-6 text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 md:grid md:grid-cols-12 md:gap-4">
          <div className="col-span-5">Ödəniş üsulu</div>
          <div className="col-span-4 text-center">Tip</div>
          <div className="col-span-3 text-right">Əməliyyatlar</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 p-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#0ea5e9]" />
            <p className="text-[10px] font-black uppercase italic tracking-widest text-[#0ea5e9]">
              Məlumatlar gətirilir...
            </p>
          </div>
        ) : hasRows ? (
          <div className="divide-y divide-gray-50">
            {BUILTIN.map((b) => {
              const Ico = b.Icon;
              return (
                <div key={b.key} className="group">
                  <div className="hidden items-center gap-4 px-10 py-6 transition-all hover:bg-gray-50/30 md:grid md:grid-cols-12">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                        <Ico size={20} />
                      </div>
                      <span className="text-lg font-bold tracking-tight text-gray-700">{b.label}</span>
                    </div>
                    <div className="col-span-4 flex justify-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <FiLock size={12} /> Sistem
                      </span>
                    </div>
                    <div className="col-span-3 flex justify-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">—</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 p-5 md:hidden">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                        <Ico size={22} />
                      </div>
                      <div>
                        <p className="text-lg font-black leading-none text-slate-800">{b.label}</p>
                        <p className="mt-2 text-[10px] font-bold uppercase italic tracking-widest text-gray-400">
                          Sistem üzrə — redaktə yoxdur
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {items.map((row) => {
              const id = row.id ?? row.Id;
              const name = row.nameAz ?? row.NameAz ?? '';
              return (
                <div key={id} className="group">
                  <div className="hidden items-center gap-4 px-10 py-6 transition-all hover:bg-gray-50/30 md:grid md:grid-cols-12">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#0ea5e9]">
                        <FiLayers size={20} />
                      </div>
                      <span className="text-lg font-bold tracking-tight text-gray-700">{name}</span>
                    </div>
                    <div className="col-span-4 flex justify-center">
                      <span className="rounded-full border border-blue-100 bg-sky-50/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]">
                        Əlavə
                      </span>
                    </div>
                    <div className="col-span-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="rounded-xl border border-gray-100 bg-white p-3 text-[#0ea5e9] transition-all hover:bg-sky-50"
                        title="Redaktə"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRow(row);
                          setIsDeleteOpen(true);
                        }}
                        className="rounded-xl border border-gray-100 bg-white p-3 text-[#ef4444] transition-all hover:bg-red-50"
                        title="Sil"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 p-5 md:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#0ea5e9]">
                          <FiLayers size={22} />
                        </div>
                        <div>
                          <p className="text-lg font-black leading-none text-slate-800">{name}</p>
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#0ea5e9]">
                            Əlavə üsul
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gray-50 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700"
                      >
                        <FiEdit2 size={14} /> Düzəliş
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRow(row);
                          setIsDeleteOpen(true);
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-50 py-4 text-[10px] font-black uppercase tracking-widest text-red-600"
                      >
                        <FiTrash2 size={14} /> Sil
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-20 text-center">
            <FiCreditCard size={48} className="mx-auto mb-4 text-gray-100" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Məlumat yoxdur.</p>
          </div>
        )}
      </div>

      <PaymentMethodModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditRow(null);
        }}
        onSaved={load}
        companyId={companyId}
        editRow={editRow}
        nextSortOrder={(items?.length || 0) * 10}
      />

      <GlobalDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedRow(null);
        }}
        onConfirm={handleDelete}
        title={selectedRow ? String(selectedRow.nameAz ?? selectedRow.NameAz ?? '').trim() || 'Üsul' : ''}
        loading={deleteLoading}
      />
    </div>
  );
};

export default PaymentMethodsPage;
