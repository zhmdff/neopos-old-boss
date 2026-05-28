import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiUploadCloud, FiSave, FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../../../api/axios';
import WorkshopCombobox from './WorkshopCombobox';

const ProductAddModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAz: '', barcode: '', unit: 1, workshopId: '', categoryId: '',
    costPrice: '', markupType: 1, markupValue: 0, descriptionAz: '',
    deliveryPrice: '', // 🔥 Yeni sahə
    showInQr: true,
    showInTerminal: true,
    additionalWorkshopIds: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [workshops, setWorkshops] = useState([]);
  const [companySettings, setCompanySettings] = useState({ isDeliveryPriceEnabled: false }); // 🔥 Şirkət tənzimləməsi
  const [variants, setVariants] = useState([]);
  const [variantName, setVariantName] = useState('');
  const [variantPrice, setVariantPrice] = useState('');
  const [variantDeliveryPrice, setVariantDeliveryPrice] = useState('');
  const [variantSaving, setVariantSaving] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem('user'));
  const companyId = userData?.companyId || userData?.CompanyId;

  const calculatedPrice = formData.markupType === 1 
    ? (Number(formData.costPrice || 0) + (Number(formData.costPrice || 0) * Number(formData.markupValue || 0) / 100))
    : (Number(formData.costPrice || 0) + Number(formData.markupValue || 0));

  useEffect(() => {
    if (isOpen && companyId) {
      // 1. Şirkət tənzimləmələrini alırıq
      api.get(`/Companies/${companyId}`)
        .then(res => setCompanySettings(res.data))
        .catch(err => console.error("Şirkət məlumatı alınmadı:", err));

      setCategoriesLoading(true);
      setCategories([]);
      api.get(`/Categories?companyId=${companyId}&take=1000`)
        .then(res => setCategories(res.data))
        .catch(err => console.error("Kateqoriya yüklənmə xətası:", err))
        .finally(() => setCategoriesLoading(false));

      api.get(`/Workshops?companyId=${companyId}`)
        .then(res => setWorkshops(res.data))
        .catch(err => console.error("Workshop yüklənmə xətası:", err));
      
      document.body.style.overflow = 'hidden';
    } else {
      setCategoriesLoading(false);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, companyId]);

  useEffect(() => {
    if (!isOpen) return;
    setVariants([]);
    setVariantName('');
    setVariantPrice('');
    setVariantDeliveryPrice('');
    setVariantsOpen(false);
  }, [isOpen]);

  const handleAddVariantLocal = () => {
    const nameAz = (variantName || '').trim();
    const price = Number(variantPrice);
    if (!nameAz) return alert('Variant adı boş ola bilməz');
    if (Number.isNaN(price) || price <= 0) return alert('Variant qiyməti düzgün deyil');
    const id = (crypto.randomUUID?.() || String(Date.now())) + Math.random().toString(16).slice(2);
    let deliveryPrice = null;
    if (companySettings.isDeliveryPriceEnabled) {
      const d = Number(variantDeliveryPrice);
      if (!Number.isNaN(d) && d > 0) deliveryPrice = d;
    }
    setVariants((prev) => [...prev, { _localId: id, nameAz, price, deliveryPrice }]);
    setVariantName('');
    setVariantPrice('');
    setVariantDeliveryPrice('');
  };

  const handleDeleteVariantLocal = (v) => {
    const key = v?._localId || v?.id;
    setVariants((prev) => prev.filter((x) => (x._localId || x.id) !== key));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) return alert("Şirkət ID tapılmadı!");
    if (categoriesLoading) return;
    if (!formData.workshopId) {
      return alert('Emalatxana mütləqdir — siyahıdan seçin.');
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('NameAz', formData.nameAz.trim());
      data.append('Barcode', formData.barcode || "");
      data.append('CookingProcess', formData.descriptionAz || "");
      data.append('CostPrice', Number(formData.costPrice || 0));
      data.append('MarkupValue', Number(formData.markupValue || 0));
      data.append('MarkupType', parseInt(formData.markupType));
      data.append('Unit', parseInt(formData.unit));
      if (formData.categoryId) {
        data.append('CategoryId', formData.categoryId);
      }
      data.append('WorkshopId', formData.workshopId);
      data.append('CompanyId', companyId); 
      data.append('ShowInQr', String(formData.showInQr !== false));
      data.append('ShowInTerminal', String(formData.showInTerminal !== false));
      // backend expects AdditionalWorkshopIds list; send as repeated keys
      (formData.additionalWorkshopIds || []).forEach((id) => data.append('AdditionalWorkshopIds', id));
      
      // 🔥 DeliveryPrice-ı yalnız rəqəm varsa göndəririk
      if (formData.deliveryPrice) {
        data.append('DeliveryPrice', Number(formData.deliveryPrice));
      }
      
      if (imageFile) data.append('ImageFile', imageFile);

      const createRes = await api.post(`/Products?companyId=${companyId}`, data, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });

      const productId = createRes?.data?.id;
      if (productId && variants.length > 0) {
        setVariantSaving(true);
        try {
          for (const v of variants) {
            const body = {
              productId,
              nameAz: v.nameAz,
              price: Number(v.price),
            };
            if (companySettings.isDeliveryPriceEnabled && v.deliveryPrice != null && v.deliveryPrice > 0) {
              body.deliveryPrice = Number(v.deliveryPrice);
            }
            await api.post(`/ProductVariants?companyId=${companyId}`, body);
          }
        } finally {
          setVariantSaving(false);
        }
      }
      
      setFormData({
        nameAz: '', barcode: '', unit: 1, workshopId: '', categoryId: '',
        costPrice: '', markupType: 1, markupValue: 0, descriptionAz: '', deliveryPrice: '',
        showInQr: true,
        showInTerminal: true,
        additionalWorkshopIds: [],
      });
      setImageFile(null);
      setPreviewUrl(null);
      setVariants([]);
      
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Məhsul yaradılarkən xəta baş verdi!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalBody = (
    <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white w-[95%] max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] border border-gray-100 relative z-10 animate-modalShow overflow-hidden">
        
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-[#1e293b] uppercase italic tracking-tighter">Məhsul Yarat</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Sistemə yeni məhsul əlavə et</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar bg-[#fafbfc]">
          {/* Məhsulun adı + barcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-[#1e293b] uppercase ml-1 tracking-wider">Məhsulun Adı</label>
              <input required value={formData.nameAz} onChange={e => setFormData({...formData, nameAz: e.target.value})} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm text-black" placeholder="Məhsul adını daxil edin" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-[#1e293b] uppercase ml-1 tracking-wider">Barkod</label>
              <input value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#0ea5e9] font-bold text-sm text-black" placeholder="00000000" />
            </div>
          </div>

          {/* Vahid + emalatxana + kateqoriya */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-[#1e293b] uppercase ml-1">Vahid</label>
              <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#0ea5e9] font-bold text-sm text-black">
                <option value={1}>Ədəd</option>
                <option value={2}>Kq</option>
                <option value={3}>Qram</option>
                <option value={4}>Litr</option>
                <option value={5}>Millilitr</option>
              </select>
            </div>
            <WorkshopCombobox
              workshops={workshops}
              value={formData.workshopId}
              onChange={(id) => setFormData({ ...formData, workshopId: id })}
              disabled={loading}
            />
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-[#1e293b] uppercase ml-1">Kateqoriya (istəyə bağlı)</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                disabled={categoriesLoading}
                className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-black outline-none focus:border-[#0ea5e9] disabled:cursor-wait disabled:opacity-70"
              >
                <option value="">
                  {categoriesLoading ? 'Kateqoriyalar yüklənir…' : 'Kateqoriya yox — kök menyuda (kateqoriyaların yanında)'}
                </option>
                {!categoriesLoading &&
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.parentCategoryId ? `↳ ${c.nameAz}` : c.nameAz.toUpperCase()}
                    </option>
                  ))}
              </select>
              {categoriesLoading ? (
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0ea5e9]">Kateqoriyalar yüklənir…</p>
              ) : null}
            </div>
          </div>

          {/* Emalatxana (1 və 1-dən çox seçilə bilər) */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6">
            <div className="text-left">
              <div className="text-[11px] font-black text-[#1e293b] uppercase tracking-wider">Emalatxana (əlavə seçimlər)</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Əsas emalatxanadan əlavə 1 və ya daha çox seçə bilərsiniz</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {workshops
                .filter((w) => String(w.id) !== String(formData.workshopId))
                .map((w) => {
                  const checked = (formData.additionalWorkshopIds || []).includes(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        const cur = formData.additionalWorkshopIds || [];
                        const next = checked ? cur.filter((x) => x !== w.id) : [...cur, w.id];
                        setFormData({ ...formData, additionalWorkshopIds: next });
                      }}
                      className={`px-4 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                        checked
                          ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]'
                          : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      {w.nameAz}
                    </button>
                  );
                })}
              {workshops.length === 0 ? (
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Şöbə yoxdur</div>
              ) : null}
            </div>
          </div>

          {/* Maya dəyəri + faiz/manat + artım + satış qiyməti + çatdırılma qiyməti */}
          <div className={`grid grid-cols-1 ${companySettings.isDeliveryPriceEnabled ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 items-end bg-gray-50 p-6 rounded-[2rem] border border-gray-100`}>
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-[#1e293b] uppercase ml-1">Maya Dəyəri</label>
              <input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="w-full px-5 py-3 border border-gray-200 rounded-2xl font-bold text-sm outline-none text-black" />
            </div>
            <div className="flex bg-white p-1.5 rounded-2xl gap-1 border border-gray-200">
              <button type="button" onClick={() => setFormData({...formData, markupType: 1})} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${formData.markupType === 1 ? 'bg-[#0ea5e9] text-white' : 'text-gray-400 hover:bg-gray-50'}`}>% FAİZ</button>
              <button type="button" onClick={() => setFormData({...formData, markupType: 2})} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${formData.markupType === 2 ? 'bg-[#0ea5e9] text-white' : 'text-gray-400 hover:bg-gray-50'}`}>₼ MANAT</button>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-[#1e293b] uppercase ml-1">{formData.markupType === 1 ? 'Artım %' : 'Artım ₼'}</label>
              <input type="number" step="0.01" value={formData.markupValue} onChange={e => setFormData({...formData, markupValue: e.target.value})} className="w-full px-5 py-3 border border-gray-200 rounded-2xl font-bold text-sm outline-none text-black" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-[#0ea5e9] uppercase ml-1">Satış Qiyməti</label>
              <div className="w-full px-5 py-3 bg-white border-2 border-[#0ea5e9]/20 rounded-2xl font-black text-[#0ea5e9] text-lg flex items-center">{calculatedPrice.toFixed(2)} ₼</div>
            </div>

            {companySettings.isDeliveryPriceEnabled && (
              <div className="space-y-2 text-left animate-fadeIn">
                <label className="text-[11px] font-black text-amber-600 uppercase ml-1 tracking-tighter">Çatdırılma Qiyməti</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Çatdırılma" 
                  value={formData.deliveryPrice} 
                  onChange={e => setFormData({...formData, deliveryPrice: e.target.value})} 
                  className="w-full px-5 py-3 border border-gray-200 rounded-2xl font-bold text-sm outline-none text-black no-spinner" 
                />
              </div>
            )}
          </div>

          {/* Şəkil və Təsvir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 text-left">
               <label className="text-[11px] font-black text-[#1e293b] uppercase ml-1 tracking-widest block">Məhsul Şəkli</label>
               <div onClick={() => document.getElementById('imgInp').click()} className="w-full h-48 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#0ea5e9] transition-all bg-white overflow-hidden shadow-sm">
                 {previewUrl ? <img src={previewUrl} className="w-full h-full object-contain p-2" alt="Önizləmə" /> : <FiUploadCloud size={32} className="text-gray-300" />}
                 <input id="imgInp" type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files[0]; if(f) { setImageFile(f); setPreviewUrl(URL.createObjectURL(f)); }}} />
               </div>
            </div>
            <div className="space-y-3 text-left">
              <label className="text-[11px] font-black text-[#1e293b] uppercase ml-1 tracking-widest">Təsvir</label>
              <textarea value={formData.descriptionAz} onChange={e => setFormData({...formData, descriptionAz: e.target.value})} className="w-full h-48 px-5 py-4 border border-gray-200 rounded-[2rem] outline-none focus:border-[#0ea5e9] font-medium text-sm resize-none text-black" placeholder="Tərkibi, hazırlanma qaydası və s." />
            </div>
          </div>

          {/* Variantlar — ən aşağıda (görünürlükdən əvvəl) */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6">
            <button
              type="button"
              onClick={() => setVariantsOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3"
            >
              <div className="text-left min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                  Variantlar
                  <span className="ml-2 text-slate-400">({variants.length})</span>
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Əgər varsa, üzərinə basıb açın
                </p>
              </div>
              <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                {variantsOpen ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </button>

            {variantsOpen ? (
              <div className="mt-5 space-y-4">
                <div className="flex flex-col lg:flex-row gap-2 lg:items-end">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Növ adı</label>
                    <input
                      value={variantName}
                      onChange={(e) => setVariantName(e.target.value)}
                      placeholder="Məs: 0.5L"
                      className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:border-[#0ea5e9] font-bold text-sm text-black"
                    />
                  </div>
                  <div className="w-full lg:w-40">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Satış</label>
                    <input
                      value={variantPrice}
                      onChange={(e) => setVariantPrice(e.target.value)}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:border-[#0ea5e9] font-bold text-sm text-black no-spinner"
                    />
                  </div>
                  {companySettings.isDeliveryPriceEnabled ? (
                    <div className="w-full lg:w-40">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-1">Çatdırılma</label>
                      <input
                        value={variantDeliveryPrice}
                        onChange={(e) => setVariantDeliveryPrice(e.target.value)}
                        type="number"
                        step="0.01"
                        placeholder="= satış"
                        className="w-full mt-2 px-4 py-3 border-2 border-amber-100 rounded-2xl outline-none focus:border-amber-400 font-bold text-sm text-amber-800 bg-amber-50/30 no-spinner"
                      />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleAddVariantLocal}
                    disabled={loading || variantSaving}
                    className="w-full lg:w-auto px-5 py-3 rounded-2xl bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FiPlus size={18} /> Əlavə et
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {variants.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 font-bold uppercase text-xs italic border border-dashed border-gray-200 rounded-2xl">
                      Variant yoxdur
                    </div>
                  ) : (
                    variants.map((v) => (
                      <div key={v._localId || v.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-gray-100 bg-[#fafbfc]">
                        <div className="min-w-0 text-left">
                          <div className="font-black text-[#0f172a] truncate">{v.nameAz}</div>
                          <div className="text-[11px] font-black text-[#0ea5e9] mt-0.5">
                            {Number(v.price || 0).toFixed(2)} ₼
                            {companySettings.isDeliveryPriceEnabled && v.deliveryPrice != null && v.deliveryPrice > 0 ? (
                              <span className="text-amber-600 ml-2">çat: {Number(v.deliveryPrice).toFixed(2)} ₼</span>
                            ) : companySettings.isDeliveryPriceEnabled ? (
                              <span className="text-slate-400 ml-2 font-bold text-[10px]">çat: satış</span>
                            ) : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariantLocal(v)}
                          disabled={loading || variantSaving}
                          className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all shrink-0 disabled:opacity-50"
                          title="Sil"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Görünürlük — ən aşağıda */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="text-left">
              <div className="text-[11px] font-black text-[#1e293b] uppercase tracking-wider">Görünürlük</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Terminal / QR menyu</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.showInTerminal !== false}
                  onChange={(e) => setFormData({ ...formData, showInTerminal: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-[11px] font-black text-[#1e293b] uppercase tracking-wider">Terminalda göstər</span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.showInQr !== false}
                  onChange={(e) => setFormData({ ...formData, showInQr: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-[11px] font-black text-[#1e293b] uppercase tracking-wider">QR-da göstər</span>
              </label>
            </div>
          </div>
        </form>

        <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-[2.5rem] flex-shrink-0">
          <button type="button" onClick={onClose} className="px-8 py-3 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-all">Ləğv Et</button>
          <button type="submit" onClick={handleSubmit} disabled={loading || variantSaving} className="bg-[#0ea5e9] text-white px-12 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-60">
            {(loading || variantSaving) ? "Gözləyin..." : <><FiSave size={18} /> Saxla</>}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalBody, document.body);
};

export default ProductAddModal;