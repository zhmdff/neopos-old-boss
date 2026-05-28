import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiLink, FiSettings, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const IntegrationCard = ({ title, subtitle, statusLabel, statusTone = 'neutral', actions }) => {
  const tone = useMemo(() => {
    if (statusTone === 'good') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (statusTone === 'bad') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  }, [statusTone]);

  return (
    <div className="bg-white rounded-[1.75rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center">
            <FiLink size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-tighter">{title}</h3>
              {statusLabel ? (
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-xl border ${tone}`}>
                  {statusLabel}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 flex gap-3">
        {actions}
      </div>
    </div>
  );
};

const EkassamParamsModal = ({ isOpen, onClose, company, onSave }) => {
  const [form, setForm] = useState({
    ekassamEnabled: false,
    ekassamBaseUrl: '',
    ekassamApiKey: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      ekassamEnabled: !!company?.ekassamEnabled,
      ekassamBaseUrl: company?.ekassamBaseUrl || '',
      ekassamApiKey: '',
    });
  }, [isOpen, company]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#1e293b] uppercase italic tracking-tighter">eKassam parametrləri</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              OneClick/eKassam — hər restoran üçün ayrı
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl font-black text-xs uppercase text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
          >
            Bağla
          </button>
        </div>

        <div className="p-6 space-y-5 bg-[#fafbfc]">
          <label className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-2xl border border-gray-100">
            <input
              type="checkbox"
              checked={form.ekassamEnabled}
              onChange={(e) => setForm({ ...form, ekassamEnabled: e.target.checked })}
              className="w-5 h-5 rounded accent-[#0ea5e9]"
            />
            <div>
              <div className="text-sm font-black text-[#0f172a] uppercase tracking-tighter">Aktiv et</div>
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Növbə + satış inteqrasiyası</div>
            </div>
          </label>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">Base URL</label>
              <input
                value={form.ekassamBaseUrl}
                onChange={(e) => setForm({ ...form, ekassamBaseUrl: e.target.value })}
                placeholder="http://192.168.1.50:8080"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">API açarı (key)</label>
              <input
                type="password"
                value={form.ekassamApiKey}
                onChange={(e) => setForm({ ...form, ekassamApiKey: e.target.value })}
                placeholder="Dəyişməmək üçün boş saxlayın"
                autoComplete="new-password"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-2xl font-black text-xs uppercase text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
          >
            Ləğv et
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(form);
              } finally {
                setSaving(false);
              }
            }}
            className="bg-[#0ea5e9] text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-105 transition-all disabled:opacity-50"
          >
            {saving ? '...' : 'Saxla'}
          </button>
        </div>
      </div>
    </div>
  );
};

const IntegrationsPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);

  const token = localStorage.getItem('token');

  const fetchCompany = async () => {
    if (!user?.companyId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/Companies/${user.companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompany(res.data);
    } catch {
      toast.error('Şirkət məlumatı alınmadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ekEnabled = !!company?.ekassamEnabled;
  const ekReady = ekEnabled && !!company?.ekassamBaseUrl && !!company?.ekassamApiKey;

  return (
    <div className="p-4 md:p-6 animate-fadeIn">
      <Toaster position="bottom-right" />
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter leading-none">İnteqrasiyalar</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest italic mt-2">
            Fiskal, ödəniş və cihaz bağlantıları
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-sky-50 border-t-[#0ea5e9] rounded-full animate-spin mx-auto" />
          <div className="text-[#0ea5e9] font-black text-[10px] uppercase tracking-widest mt-3">Yüklənir...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <IntegrationCard
            title="eKassam (OneClick)"
            subtitle="Növbə aç/bağla və satış zamanı fiskal məlumatı çekin altında göstər."
            statusLabel={ekReady ? 'Qoşuldu' : ekEnabled ? 'Parametrlər lazımdır' : 'Söndürülüb'}
            statusTone={ekReady ? 'good' : ekEnabled ? 'bad' : 'neutral'}
            actions={
              <>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <FiSettings size={16} /> Parametrlər
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!company) return;
                    const tId = toast.loading('Söndürülür...');
                    try {
                      const fd = new FormData();
                      fd.append('Id', company.id);
                      fd.append('NameAz', company.nameAz || '');
                      fd.append('AddressAz', company.addressAz || '');
                      fd.append('PhoneNumber1', company.phoneNumber1 || '');
                      fd.append('PhoneNumber2', company.phoneNumber2 || '');
                      fd.append('PhoneNumber3', company.phoneNumber3 || '');
                      fd.append('IsActive', company.isActive ? 'true' : 'false');
                      fd.append('EkassamEnabled', 'false');
                      fd.append('EkassamBaseUrl', '');
                      await axios.put(`${API_URL}/Companies`, fd, {
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                      });
                      toast.success('Söndürüldü', { id: tId });
                      await fetchCompany();
                    } catch {
                      toast.error('Xəta', { id: tId });
                    }
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <FiTrash2 size={16} /> Ləğv et
                </button>
              </>
            }
          />
        </div>
      )}

      <EkassamParamsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        company={company}
        onSave={async (form) => {
          const tId = toast.loading('Yadda saxlanır...');
          try {
            const fd = new FormData();
            fd.append('Id', company.id);
            fd.append('NameAz', company.nameAz || '');
            fd.append('AddressAz', company.addressAz || '');
            fd.append('PhoneNumber1', company.phoneNumber1 || '');
            fd.append('PhoneNumber2', company.phoneNumber2 || '');
            fd.append('PhoneNumber3', company.phoneNumber3 || '');
            fd.append('IsActive', company.isActive ? 'true' : 'false');
            fd.append('EkassamEnabled', form.ekassamEnabled ? 'true' : 'false');
            fd.append('EkassamBaseUrl', form.ekassamBaseUrl || '');
            if (form.ekassamApiKey) fd.append('EkassamApiKey', form.ekassamApiKey);
            await axios.put(`${API_URL}/Companies`, fd, {
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Saxlanıldı', { id: tId });
            setModalOpen(false);
            await fetchCompany();
          } catch (e) {
            toast.error('Xəta baş verdi', { id: tId });
            throw e;
          }
        }}
      />
    </div>
  );
};

export default IntegrationsPage;

