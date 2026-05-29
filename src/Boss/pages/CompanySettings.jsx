import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FiSave,
  FiUpload,
  FiCalendar,
  FiClock,
  FiLoader,
  FiImage,
  FiTrash2,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiSend,
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { getApiBaseUrl, getApiOrigin } from '../../utils/apiBaseUrl';

const RENEWAL_PHONE_DISPLAY = '+994 50 573 81 47';
const RENEWAL_PHONE_E164 = '994505738147';

const CompanySettings = () => {
  const API_URL = getApiBaseUrl();
  const IMAGE_BASE = getApiOrigin();
  const fileInputRef = useRef(null);
  const posLockInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [posLockPreview, setPosLockPreview] = useState(null);
  const [posLockFile, setPosLockFile] = useState(null);
  const [posLockPendingClear, setPosLockPendingClear] = useState(false);
  const [logoPendingClear, setLogoPendingClear] = useState(false);
  const [tgChats, setTgChats] = useState([]);
  const [tgChatInput, setTgChatInput] = useState('');
  const [tgBusy, setTgBusy] = useState(false);

  const [company, setCompany] = useState({
    id: '',
    nameAz: '',
    addressAz: '',
    phoneNumber1: '',
    phoneNumber2: '',
    phoneNumber3: '',
    logo: '',
    isActive: true,
    packageEndDate: '',
    posLockScreenImage: '',
    cashierPrinterTarget: '',
  });

  const absMedia = (path) => {
    if (!path || typeof path !== 'string') return null;
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${IMAGE_BASE}${p}`;
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchTelegramChats = async () => {
    const token = localStorage.getItem('token');
    if (!API_URL || !token) return;
    try {
      const res = await axios.get(`${API_URL}/BossTelegramChats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTgChats(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTgChats([]);
    }
  };

  useEffect(() => {
    if (!loading && company.id) void fetchTelegramChats();
  }, [loading, company.id]);

  const fetchCompanyData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/Companies/${user.companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = res.data || {};
      setCompany({
        id: d.id ?? d.Id ?? '',
        nameAz: d.nameAz ?? d.NameAz ?? '',
        addressAz: d.addressAz ?? d.AddressAz ?? '',
        phoneNumber1: d.phoneNumber1 ?? d.PhoneNumber1 ?? '',
        phoneNumber2: d.phoneNumber2 ?? d.PhoneNumber2 ?? '',
        phoneNumber3: d.phoneNumber3 ?? d.PhoneNumber3 ?? '',
        logo: d.logo ?? d.Logo ?? '',
        isActive: d.isActive ?? d.IsActive ?? true,
        packageEndDate: d.packageEndDate ?? d.PackageEndDate ?? '',
        posLockScreenImage: d.posLockScreenImage ?? d.PosLockScreenImage ?? '',
        cashierPrinterTarget: d.cashierPrinterTarget ?? d.CashierPrinterTarget ?? '',
      });
      if (d.logo ?? d.Logo) {
        setLogoPreview(absMedia(d.logo ?? d.Logo));
        setLogoPendingClear(false);
      } else {
        setLogoPreview(null);
        setLogoPendingClear(false);
      }
      const pl = d.posLockScreenImage ?? d.PosLockScreenImage;
      setPosLockPreview(pl ? absMedia(pl) : null);
      setPosLockFile(null);
    } catch {
      toast.error('Məlumat gəlmədi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getRemainingDays = (dateString) => {
    if (!dateString) return 0;
    const end = new Date(dateString);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSave = async () => {
    setSaving(true);
    const tId = toast.loading('Məlumatlar yenilənir...');
    const token = localStorage.getItem('token');

    if (!company.id) {
      toast.error('Şirkət ID-si tapılmadı!', { id: tId });
      setSaving(false);
      return;
    }

    const formData = new FormData();
    formData.append('Id', company.id);
    formData.append('NameAz', company.nameAz || '');
    formData.append('AddressAz', company.addressAz || '');
    formData.append('PhoneNumber1', company.phoneNumber1 || '');
    formData.append('PhoneNumber2', company.phoneNumber2 || '');
    formData.append('PhoneNumber3', company.phoneNumber3 || '');
    formData.append('CashierPrinterTarget', company.cashierPrinterTarget || '');
    formData.append('IsActive', company.isActive ? 'true' : 'false');
    if (logoFile) formData.append('logoFile', logoFile);
    else if (logoPendingClear) formData.append('ClearCompanyLogo', 'true');

    if (posLockFile) {
      formData.append('posLockScreenFile', posLockFile);
    } else if (posLockPendingClear) {
      formData.append('ClearPosLockScreenImage', 'true');
    }

    try {
      await axios.put(`${API_URL}/Companies`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Məlumatlar yeniləndi!', { id: tId });
      setLogoFile(null);
      setLogoPendingClear(false);
      setPosLockFile(null);
      setPosLockPendingClear(false);
      fetchCompanyData();
    } catch {
      toast.error('Xəta baş verdi!', { id: tId });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTelegramChat = async () => {
    const raw = String(tgChatInput || '').trim();
    if (!raw || !API_URL) return;
    const n = Number(raw);
    if (!Number.isFinite(n) || n === 0) {
      toast.error('Düzgün Chat ID daxil edin (məsələn qrup üçün mənfi ədəd).');
      return;
    }
    const token = localStorage.getItem('token');
    setTgBusy(true);
    try {
      await axios.post(
        `${API_URL}/BossTelegramChats`,
        { chatId: Math.trunc(n) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success('Telegram chat əlavə olundu.');
      setTgChatInput('');
      await fetchTelegramChats();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Əlavə olunmadı (icazə / xəta).');
    } finally {
      setTgBusy(false);
    }
  };

  const handleRemoveTelegramChat = async (chatId) => {
    const token = localStorage.getItem('token');
    setTgBusy(true);
    try {
      await axios.delete(`${API_URL}/BossTelegramChats/${encodeURIComponent(String(chatId))}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Silindi.');
      await fetchTelegramChats();
    } catch {
      toast.error('Silinmədi.');
    } finally {
      setTgBusy(false);
    }
  };

  const pickImage = (setterPreview, setterFile) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setterFile(file);
      setterPreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        <p className="text-sm font-medium text-slate-500">Yüklənir…</p>
      </div>
    );
  }

  const remainingDays = getRemainingDays(company.packageEndDate);
  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/15';

  return (
    <div className="animate-fadeIn bg-slate-50/90 px-3 py-6 text-slate-900 md:px-6 md:py-8">
      <Toaster position="bottom-right" />
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Başlıq + logo + saxla */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-violet-50/40 px-5 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-5">
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-white shadow-sm transition hover:border-violet-300 hover:bg-violet-50/30"
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/200x200?text=Logo';
                        }}
                        alt=""
                      />
                    ) : (
                      <FiUpload className="text-slate-300 transition group-hover:text-violet-400" size={28} />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                        setLogoPendingClear(false);
                      }
                    }}
                    className="hidden"
                    accept="image/*"
                  />
                  {(logoPreview || company.logo) && !logoFile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                        setCompany((c) => ({ ...c, logo: '' }));
                        setLogoPendingClear(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                    >
                      <FiTrash2 size={12} />
                      Sil
                    </button>
                  ) : null}
                </div>
                <div className="min-w-0 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">Şirkət ayarları</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Profil</h1>
                  <p className="mt-2 truncate text-sm text-slate-600">{company.nameAz || 'Restoran adı'}</p>
                  <p className="mt-1 text-xs text-slate-500">Logo üzərinə kliklə dəyişdirin.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50 sm:self-start"
              >
                {saving ? <FiLoader className="animate-spin" size={18} /> : <FiSave size={18} />}
                Saxla
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-12 lg:divide-x lg:divide-slate-100">
            <div className="space-y-8 p-5 sm:p-8 lg:col-span-9">
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FiMapPin size={16} />
                  </span>
                  Əsas məlumat
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Restoranın adı</label>
                    <input
                      value={company.nameAz || ''}
                      onChange={(e) => setCompany({ ...company, nameAz: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Ünvan</label>
                    <input
                      value={company.addressAz || ''}
                      onChange={(e) => setCompany({ ...company, addressAz: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[1, 2].map((num) => (
                      <div key={num}>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Telefon {num}</label>
                        <input
                          value={company[`phoneNumber${num}`] || ''}
                          onChange={(e) =>
                            setCompany({ ...company, [`phoneNumber${num}`]: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Telefon 3</label>
                      <input
                        value={company.phoneNumber3 || ''}
                        onChange={(e) => setCompany({ ...company, phoneNumber3: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-t border-slate-100 pt-8">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <FiPrinter size={16} />
                  </span>
                  Printer Ayarları (LAN)
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Kassa Printeri (LAN IP)</label>
                    <input
                      placeholder="Məsələn: 192.168.1.60"
                      value={company.cashierPrinterTarget || ''}
                      onChange={(e) => setCompany({ ...company, cashierPrinterTarget: e.target.value })}
                      className={inputClass}
                    />
                    <p className="mt-2 text-[10px] text-slate-500 italic">
                      Backend birbaşa bu IP-yə qoşularaq çek çıxaracaq.
                    </p>
                  </div>
                </div>
              </section>

              <section className="border-t border-slate-100 pt-8">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <FiSend size={16} />
                  </span>
                  Telegram — silinmə təsdiqləri (ofisiant brauzer)
                </h2>
                <p className="mb-4 text-xs leading-relaxed text-slate-600">
                  Kassa (Electron) öz botu ilə mesaj göndərir. Ofisiant <strong>brauzer</strong>ində təsdiq yalnız server
                  üzərindən Telegrama düşür: API-də <code className="rounded bg-slate-100 px-1">BossTelegram:BotToken</code>{' '}
                  olmalıdır; alıcı chat ID-ləri isə burada və ya appsettings-də{' '}
                  <code className="rounded bg-slate-100 px-1">BossTelegram:ExtraChats</code> ilə verilir.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Telegram Chat ID</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={tgChatInput}
                      onChange={(e) => setTgChatInput(e.target.value)}
                      placeholder="Məs: -1001234567890"
                      className={inputClass}
                      disabled={tgBusy}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={tgBusy || !tgChatInput.trim()}
                    onClick={() => void handleAddTelegramChat()}
                    className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50"
                  >
                    {tgBusy ? <FiLoader className="animate-spin" size={18} /> : 'Əlavə et'}
                  </button>
                </div>
                {tgChats.length > 0 ? (
                  <ul className="mt-4 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    {tgChats.map((row) => (
                      <li
                        key={String(row.chatId ?? row.ChatId)}
                        className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-slate-100"
                      >
                        <span className="font-mono text-slate-800">{row.chatId ?? row.ChatId}</span>
                        <button
                          type="button"
                          disabled={tgBusy}
                          onClick={() => void handleRemoveTelegramChat(row.chatId ?? row.ChatId)}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Sil
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs text-amber-700">
                    Hələ chat əlavə olunmayıb — ofisiantdan silinmə təsdiqi Telegrama getməyə bilər.
                  </p>
                )}
              </section>

              <section className="border-t border-slate-100 pt-8">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <FiImage size={16} />
                  </span>
                  POS kilid ekranı
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Sol panel kilid fonu
                    </label>
                    <button
                      type="button"
                      onClick={() => posLockInputRef.current?.click()}
                      className="flex aspect-[16/10] w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 transition hover:border-violet-300 hover:bg-violet-50/20"
                    >
                      {posLockPreview ? (
                        <img src={posLockPreview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-medium text-slate-400">Şəkil seçmək üçün klikləyin</span>
                      )}
                    </button>
                    <input
                      ref={posLockInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const hadFile = !!e.target.files?.[0];
                        pickImage(setPosLockPreview, setPosLockFile)(e);
                        if (hadFile) setPosLockPendingClear(false);
                      }}
                    />
                    {(posLockPreview || company.posLockScreenImage) && !posLockFile ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPosLockPreview(null);
                          setPosLockFile(null);
                          setCompany((c) => ({ ...c, posLockScreenImage: '' }));
                          setPosLockPendingClear(true);
                        }}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <FiTrash2 size={14} />
                        Kilid şəklini sil
                      </button>
                    ) : null}
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      PIN sağda qalır; sol tərəf bu şəkil olur. Siləndən sonra «Saxla» basın.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="bg-slate-50/50 p-5 sm:p-8 lg:col-span-3 lg:bg-white">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <FiCreditCard size={16} />
                </span>
                Paket
              </h2>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Bitmə tarixi</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                    {formatDate(company.packageEndDate)}
                  </p>
                </div>
                <div
                  className={`rounded-2xl border-2 p-4 ${
                    remainingDays < 10
                      ? 'border-red-200 bg-red-50/80'
                      : 'border-emerald-200 bg-emerald-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiClock
                      className={remainingDays < 10 ? 'text-red-600' : 'text-emerald-600'}
                      size={18}
                    />
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        remainingDays < 10 ? 'text-red-700' : 'text-emerald-800'
                      }`}
                    >
                      Qalan müddət
                    </p>
                  </div>
                  <p
                    className={`mt-2 text-2xl font-bold tabular-nums ${
                      remainingDays < 10 ? 'text-red-800' : 'text-emerald-900'
                    }`}
                  >
                    {remainingDays}
                    <span className="ml-1 text-sm font-semibold normal-case tracking-normal text-slate-600">
                      gün
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm">
                  <p className="text-sm font-medium leading-relaxed text-slate-700">
                    Paketi yeniləmək üçün{' '}
                    <a
                      href={`https://wa.me/${RENEWAL_PHONE_E164}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-violet-900"
                    >
                      {RENEWAL_PHONE_DISPLAY}
                    </a>{' '}
                    nömrəsi ilə əlaqə saxlayın.
                  </p>
                  <a
                    href={`tel:+${RENEWAL_PHONE_E164}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
                  >
                    <FiPhone size={16} />
                    Zəng et
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
