import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiTrash2, FiCalendar, FiBox, FiLoader, FiCheckCircle, FiSearch, FiList } from 'react-icons/fi';
import moment from 'moment';

const unitLabels = { 1: 'ədəd', 2: 'kq', 3: 'qr', 4: 'litr', 5: 'ml' };

const AddPurchaseModal = ({ isOpen, onClose, onAdd, products, suppliers, warehouses, loading }) => {
  const [purchaseDate, setPurchaseDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(''); // Bu Ana (Global) Anbardır
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInvoiceNumber(`INV-${moment().format('YYYYMMDD-HHmmss')}`);
      setSelectedItems([]);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // 🔥 Ana anbar dəyişəndə bütün seçilmiş məhsulların anbarını yeniləyirik
  const handleGlobalWarehouseChange = (warehouseId) => {
    setSelectedWarehouse(warehouseId);
    setSelectedItems(prevItems => 
      prevItems.map(item => ({ ...item, lineWarehouseId: warehouseId }))
    );
  };

  const toggleProductSelection = (product) => {
    const exists = selectedItems.find(item => item.id === product.id);
    if (exists) {
      setSelectedItems(selectedItems.filter(item => item.id !== product.id));
    } else {
      // Yeni məhsul əlavə olunanda ana anbar nədirsə, onu sətir anbarı kimi mənimsədirik
      setSelectedItems([...selectedItems, { 
        ...product, 
        quantity: 1, 
        lineWarehouseId: selectedWarehouse 
      }]);
    }
  };

  const updateQuantity = (id, val) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, quantity: parseFloat(val) || 0 } : item
    ));
  };

  // 🔥 Sətir bazlı anbar dəyişimi
  const updateLineWarehouse = (id, warehouseId) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, lineWarehouseId: warehouseId } : item
    ));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedSupplier || !selectedWarehouse) return alert("Tədarükçü və Əsas Anbar seçilməlidir!");
    if (selectedItems.length === 0) return alert("Məhsul seçilməyib!");
    if (selectedItems.some(i => !i.lineWarehouseId)) return alert("Bəzi məhsulların anbarı təyin edilməyib!");

    onAdd({
      supplierId: selectedSupplier,
      warehouseId: selectedWarehouse, // Header üçün ana anbar
      purchaseDate: purchaseDate,
      invoiceNumber: invoiceNumber,
      items: selectedItems.map(i => ({
        productId: i.id,
        quantity: i.quantity,
        priceAtPurchase: i.costPrice,
        warehouseId: i.lineWarehouseId // 🔥 Hər sətir öz seçilən anbarı ilə gedir
      }))
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center overflow-hidden font-black">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-[95%] max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] border border-gray-100 relative z-10 animate-modalShow overflow-hidden italic">
        
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0 font-bold">
          <div>
            <h2 className="text-xl uppercase italic tracking-tighter leading-none">Yeni Mədaxil</h2>
            <p className="text-[10px] text-[#0ea5e9] uppercase tracking-widest mt-1.5 not-italic">{invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><FiX size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar bg-[#fafbfc]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-italic">
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 leading-none">Tarix</label>
              <input type="date" className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-sm outline-none" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>
            <div className="space-y-1 text-left font-bold">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 leading-none">Tədarükçü</label>
              <select required className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-sm outline-none" value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
                <option value="">Seçin...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1 text-left font-bold">
              <label className="text-[11px] font-black text-[#0ea5e9] uppercase tracking-widest ml-1 leading-none">Əsas Mədaxil Anbarı</label>
              <select required className="w-full px-5 py-3 bg-white border-2 border-[#0ea5e9]/20 rounded-2xl font-bold text-sm outline-none focus:border-[#0ea5e9]" value={selectedWarehouse} onChange={(e) => handleGlobalWarehouseChange(e.target.value)}>
                <option value="">Seçin...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div onClick={() => setShowProductPicker(true)} className="w-full py-8 border-2 border-dashed border-[#0ea5e9]/20 rounded-[2.5rem] bg-white flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#0ea5e9] transition-all group font-bold">
            <div className="w-14 h-14 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"><FiList size={28} /></div>
            <span className="font-black text-xs uppercase tracking-[0.2em] text-[#0ea5e9] not-italic">Məhsul Kataloqunu Aç</span>
          </div>

          <div className="space-y-4">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex flex-col lg:flex-row items-center gap-6 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative group font-bold">
                <div className="flex items-center gap-4 flex-1 min-w-0 text-left">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0"><FiBox size={20}/></div>
                  <div className="truncate">
                    <p className="font-black text-sm uppercase italic tracking-tighter text-[#1e293b] truncate">
                      {item.nameAz} 
                      <span className="ml-2 text-[9px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md uppercase not-italic font-bold">
                        {unitLabels[item.unit]}
                      </span>
                    </p>
                    <p className="text-[9px] font-black text-blue-500 uppercase mt-1 not-italic italic">Satış: {item.salePrice?.toFixed(2)} ₼</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 bg-gray-50/50 px-6 py-3 rounded-2xl border border-gray-100 not-italic">
                   {/* 🔥 SƏTİR SƏVİYYƏSİNDƏ ANBAR SEÇİMİ */}
                   <div className="w-40 text-left">
                    <label className="text-[9px] font-black text-gray-400 uppercase block mb-1 tracking-widest leading-none">Anbar</label>
                    <select 
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl font-bold text-[10px] outline-none"
                      value={item.lineWarehouseId}
                      onChange={(e) => updateLineWarehouse(item.id, e.target.value)}
                    >
                      <option value="">Seçin...</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>

                  <div className="text-center font-bold">
                    <label className="text-[9px] font-black text-gray-400 uppercase block mb-1 tracking-widest leading-none">Maya</label>
                    <p className="font-black text-sm text-[#1e293b] italic leading-none">{item.costPrice?.toFixed(2)} ₼</p>
                  </div>
                  <div className="w-24">
                    <label className="text-[9px] font-black text-gray-400 uppercase block mb-1 text-center tracking-widest leading-none">Miqdar</label>
                    <input type="number" step="any" className="w-full p-2 bg-white border border-gray-100 rounded-xl text-center font-black text-sm outline-none focus:border-[#0ea5e9]" value={item.quantity} onChange={(e) => updateQuantity(item.id, e.target.value)} />
                  </div>
                  <div className="text-right min-w-[100px] font-bold">
                    <label className="text-[9px] font-black text-gray-400 uppercase block mb-1 tracking-widest text-center leading-none">Cəmi</label>
                    <p className="font-black text-sm text-[#0ea5e9] text-center italic leading-none">{(item.quantity * item.costPrice).toFixed(2)} ₼</p>
                  </div>
                  <button type="button" onClick={() => setSelectedItems(selectedItems.filter(i => i.id !== item.id))} className="p-2 text-gray-300 hover:text-red-500 transition-all pt-3"><FiTrash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </form>

        <div className="px-8 py-5 border-t border-gray-100 flex justify-between items-center bg-white shrink-0 font-bold">
          <div className="text-left font-black italic leading-none">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest not-italic leading-none">Ümumi Mədaxil</p>
            <p className="text-2xl text-[#0ea5e9] tracking-tighter mt-1">
              {selectedItems.reduce((acc, curr) => acc + (curr.quantity * curr.costPrice), 0).toFixed(2)} ₼
            </p>
          </div>
          <div className="flex gap-4 not-italic">
            <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-black uppercase text-gray-400">Ləğv Et</button>
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={loading || selectedItems.length === 0} 
              className="bg-[#0ea5e9] text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all"
            >
              {loading ? "Gözləyin..." : "Mədaxili Təsdiqlə"}
            </button>
          </div>
        </div>

        {/* --- KATALOQ SEÇİMİ --- */}
        {showProductPicker && (
          <div className="absolute inset-0 bg-white z-[130] flex flex-col p-8 animate-fadeIn overflow-hidden font-black italic">
             <div className="flex justify-between items-center mb-6 shrink-0 font-bold">
               <h3 className="text-xl uppercase italic tracking-tighter text-[#1e293b]">Məhsul Kataloqu</h3>
               <button onClick={() => setShowProductPicker(false)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><FiX size={20}/></button>
             </div>
             <div className="relative mb-6 shrink-0 not-italic">
               <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
               <input type="text" placeholder="Axtar..." className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-2 custom-scrollbar content-start font-bold">
               {products.filter(p => p.nameAz.toLowerCase().includes(searchTerm.toLowerCase())).map(product => {
                 const isSelected = selectedItems.find(i => i.id === product.id);
                 return (
                   <div key={product.id} onClick={() => toggleProductSelection(product)} className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'border-[#0ea5e9] bg-sky-50/30' : 'border-gray-50 hover:bg-white hover:shadow-md'}`}>
                      <div className="flex items-center gap-3 min-w-0 leading-tight">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#0ea5e9] border-[#0ea5e9]' : 'border-gray-200'}`}>
                           {isSelected && <FiCheckCircle className="text-white" size={14}/>}
                        </div>
                        <div className="truncate text-left font-black leading-none">
                          <p className="text-xs uppercase italic tracking-tighter text-[#1e293b] truncate leading-none">{product.nameAz}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 not-italic leading-none">{unitLabels[product.unit]}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-black italic">
                         <p className="text-[10px] text-[#0ea5e9] leading-none">{product.costPrice?.toFixed(2)} ₼</p>
                      </div>
                   </div>
                 );
               })}
             </div>
             <button onClick={() => setShowProductPicker(false)} className="mt-8 w-full py-5 bg-[#1e293b] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shrink-0 not-italic">Seçimi Tamamla ({selectedItems.length})</button>
          </div>
        )}
      </div>
    </div>
  );
  return createPortal(modalContent, document.body);
};

export default AddPurchaseModal;