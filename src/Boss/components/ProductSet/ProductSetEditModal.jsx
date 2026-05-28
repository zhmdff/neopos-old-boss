import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import api from '../../../api/axios';
import ProductSetChoiceGroupsEditor, {
  buildChoiceGroupsPayload,
} from './ProductSetChoiceGroupsEditor';

function mapChoiceGroupsFromApi(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  return list.map((g) => ({
    _k: crypto.randomUUID(),
    nameAz: g.nameAz ?? g.NameAz ?? '',
    minChoices: g.minChoices ?? g.MinChoices ?? 1,
    maxChoices: g.maxChoices ?? g.MaxChoices ?? 1,
    sortOrder: g.sortOrder ?? g.SortOrder ?? 0,
    options: (g.options || g.Options || []).map((o) => ({
      _k: crypto.randomUUID(),
      productId: String(o.productId ?? o.ProductId ?? ''),
      quantity: o.quantity ?? o.Quantity ?? 1,
      sortOrder: o.sortOrder ?? o.SortOrder ?? 0,
    })),
  }));
}

const ProductSetEditModal = ({ isOpen, onClose, onRefresh, setData, lunchMode = false }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1. Şirkət ID-sini götürürük
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const companyId = user?.companyId;

  const [formData, setFormData] = useState({
    productId: '',
    description: '',
    setItems: [],
    choiceGroups: [],
  });

  // 2. Məhsulları yalnız bu şirkətə görə çəkən funksiya
  const fetchProducts = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await api.get(`/Products?companyId=${companyId}&take=1000`);
      setAllProducts(res.data);
    } catch (err) {
      console.error("Məhsullar yüklənərkən xəta:", err);
    }
  }, [companyId]);

  useEffect(() => {
    if (isOpen && setData && companyId) {
      fetchProducts();
      // Mövcud data ilə formanı doldururuq
      setFormData({
        productId: setData.productId,
        description: setData.description || '',
        setItems: (setData.setItems || setData.SetItems || []).map((item) => ({
          productId: item.productId ?? item.ProductId,
          quantity: item.quantity ?? item.Quantity,
        })),
        choiceGroups: lunchMode
          ? mapChoiceGroupsFromApi(setData.choiceGroups || setData.ChoiceGroups)
          : [],
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, setData, companyId, fetchProducts, lunchMode]);

  const updateItem = (index, field, value) => {
    const newItems = [...formData.setItems];
    newItems[index][field] = value;
    setFormData({ ...formData, setItems: newItems });
  };

  const addItem = () => setFormData({ 
    ...formData, 
    setItems: [...formData.setItems, { productId: '', quantity: 1 }] 
  });
  
  const removeItem = (index) => setFormData({ 
    ...formData, 
    setItems: formData.setItems.filter((_, i) => i !== index) 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) return alert("Şirkət məlumatı tapılmadı!");

    const setLines = lunchMode ? [] : formData.setItems.filter((item) => item.productId);
    const choicePayload = lunchMode ? buildChoiceGroupsPayload(formData.choiceGroups) : [];

    if (lunchMode) {
      if (choicePayload.length === 0) {
        return alert('Business lunch üçün ən azı bir seçim qrupu (variantlarla) saxlanılmalıdır.');
      }
    } else if (setLines.length === 0) {
      return alert('Ən azı bir tərkib sətri saxlanılmalıdır.');
    }

    for (const g of choicePayload) {
      if (g.minChoices > g.maxChoices) {
        return alert(`«${g.nameAz}»: minimum seçim maksimumdan çox ola bilməz.`);
      }
      if (g.maxChoices > g.options.length) {
        return alert(
          `«${g.nameAz}»: maksimum seçim (${g.maxChoices}) variant sayından (${g.options.length}) çox ola bilməz.`
        );
      }
    }

    setLoading(true);
    try {
      // 3. Payload daxilində mütləq companyId göndərilməlidir
      const payload = {
        productId: formData.productId,
        description: formData.description,
        companyId: companyId,
        setItems: lunchMode
          ? []
          : setLines.map((item) => ({
              productId: item.productId,
              quantity: parseFloat(item.quantity),
            })),
        choiceGroups: lunchMode ? choicePayload : [],
      };

      // Backend-də CreateSetAsync həm də update kimi işləyir
      await api.post('/ProductSets', payload); 
      
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Xəta baş verdi!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalBody = (
    <div className="fixed inset-0 !left-0 !top-0 w-screen h-screen z-[99999] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white w-[95%] max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] border border-gray-100 relative z-10 animate-modalIn overflow-hidden text-black">
        
        <div className="flex flex-shrink-0 items-center justify-between rounded-t-[2.5rem] border-b border-gray-100 bg-gray-50/50 px-8 py-6">
          <div className="text-left">
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-[#0f172a]">
              {lunchMode ? 'Lunch-u redaktə et' : 'Seti redaktə et'}
            </h2>
            {!lunchMode ? (
              <p className="mt-1 text-[10px] font-bold uppercase italic tracking-widest text-gray-400">
                Məhsul tərkibini yeniləyirsiniz
              </p>
            ) : null}
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm">
            <FiX size={24}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          <div className="text-left">
            <label className="text-xs font-black text-gray-400 uppercase ml-2 italic tracking-wider">Əsas Məhsul (Dəyişdirilə bilməz)</label>
            <div className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-2xl font-bold text-gray-500 mt-2">
              {setData.productNameAz}
            </div>
          </div>

          <div className="text-left">
            <label className="text-xs font-black text-gray-400 uppercase ml-2 italic tracking-wider">Təsvir</label>
            <input 
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#0ea5e9] focus:bg-white outline-none font-bold transition-all text-black mt-2"
              placeholder={lunchMode ? 'Lunch haqqında qeyd…' : 'Set haqqında qeyd…'}
            />
          </div>

          {!lunchMode && (
            <div className="rounded-[2.5rem] border border-blue-100/50 bg-sky-50/30 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase italic tracking-widest text-[#0ea5e9]">Tərkibi yenilə</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 rounded-xl bg-[#0ea5e9] px-5 py-2.5 text-[10px] font-black text-white transition-all hover:shadow-lg active:scale-95"
                >
                  <FiPlus size={14} /> Əlavə et
                </button>
              </div>

              <div className="space-y-3">
                {formData.setItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                    <div className="flex-1 text-left">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm font-bold text-black outline-none focus:border-blue-200"
                      >
                        <option value="">Məhsul seçin…</option>
                        {allProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameAz}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-28 text-left">
                      <input
                        type="number"
                        step="0.001"
                        required
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-center text-sm font-bold text-black outline-none focus:border-blue-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-xl p-3 text-red-400 transition-all hover:bg-red-50"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lunchMode ? (
            <ProductSetChoiceGroupsEditor
              groups={formData.choiceGroups}
              setGroups={(updater) =>
                setFormData((prev) => ({
                  ...prev,
                  choiceGroups:
                    typeof updater === 'function' ? updater(prev.choiceGroups) : updater,
                }))
              }
              allProducts={allProducts}
            />
          ) : null}
        </form>

        <div className="p-8 border-t border-gray-100 bg-gray-50/50 rounded-b-[2.5rem] flex gap-4 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-400 uppercase text-[10px] hover:bg-gray-100 transition-all">
            Ləğv Et
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex-[2] py-4 bg-[#0ea5e9] text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Yadda saxlanılır..." : <><FiSave size={16}/> Yeniləməni Saxla</>}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modalIn { animation: modalIn 0.3s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );

  return createPortal(modalBody, document.body);
};

export default ProductSetEditModal;