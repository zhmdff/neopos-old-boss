import React from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiBox, FiMapPin } from 'react-icons/fi';
import moment from 'moment';

const unitLabels = { 1: 'ədəd', 2: 'kq', 3: 'qr', 4: 'litr', 5: 'ml' };

const PurchaseViewModal = ({ isOpen, onClose, purchase, allProducts }) => {
  if (!isOpen || !purchase) return null;

  // DTO-da purchaseItems və ya items gələ bilər
  const itemsToShow = purchase.purchaseItems || purchase.items || [];
console.log("GƏLƏN DATA STRUKTURU:", itemsToShow[0]);
  const modalContent = (
    <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center overflow-hidden font-black italic">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      
      <div className="bg-white w-[90%] max-w-3xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] border border-gray-100 relative z-10 animate-modalShow overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white leading-none">
          <div className="text-left leading-none">
            <h2 className="text-xl uppercase italic tracking-tighter text-[#1e293b] font-black leading-none">Mədaxil Detalı</h2>
            <p className="text-[10px] text-[#0ea5e9] uppercase tracking-widest mt-2 not-italic font-bold leading-none">
                SƏNƏD №: {purchase.invoiceNumber || purchase.InvoiceNumber || "N/A"}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all leading-none"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar bg-[#fafbfc]">
          
          <div className="grid grid-cols-2 gap-4 leading-none">
            <div className="p-5 bg-white rounded-[1.8rem] border border-gray-100 shadow-sm text-left leading-none">
               <p className="text-[8px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-black leading-none">Tədarükçü Firma</p>
               <p className="text-xs uppercase italic text-[#1e293b] font-black leading-none truncate">
                 {purchase.supplierName || purchase.SupplierName || "DAXİLİ"}
               </p>
            </div>
            <div className="p-5 bg-white rounded-[1.8rem] border border-gray-100 shadow-sm text-left leading-none">
               <p className="text-[8px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-black leading-none">Mədaxil Tarixi</p>
               <p className="text-xs italic text-[#1e293b] font-black leading-none">
                 {moment(purchase.purchaseDate || purchase.PurchaseDate).format('DD.MM.YYYY')}
               </p>
            </div>
          </div>

          <div className="space-y-3 leading-none text-left">
            <div className="flex justify-between items-center px-2 leading-none">
                <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black leading-none text-left">Sənəd Tərkibi</p>
                <p className="text-[9px] text-blue-500 uppercase font-black italic leading-none">{itemsToShow.length} ÇEŞİD</p>
            </div>
            
            <div className="space-y-2.5 leading-none text-left">
                {itemsToShow.length > 0 ? (
                itemsToShow.map((item, idx) => {
                    const productInfo = allProducts?.find(p => p.id === item.productId || p.id === item.ProductId);
                    const unit = productInfo ? productInfo.unit : (item.product?.unit || 1);
                    
                    // 🔥 BÜTÜN DTO EHTİMALLARI (PriceAtPurchase və ya priceAtPurchase):
                    const unitPrice = item.PriceAtPurchase || item.priceAtPurchase || item.price || 0;
                    const quantity = item.Quantity || item.quantity || 0;
                    const itemTotal = quantity * unitPrice;

                    return (
                    <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:border-blue-100 transition-all group leading-none">
                        <div className="flex items-center gap-4 min-w-0 text-left leading-none">
                          <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-[#0ea5e9] shrink-0 group-hover:bg-[#0ea5e9] group-hover:text-white transition-all shadow-inner">
                              <FiBox size={18}/>
                          </div>
                          <div className="text-left leading-tight truncate">
                              <p className="text-sm uppercase italic tracking-tighter text-[#1e293b] font-black truncate leading-none mb-2 text-left">
                                  {item.ProductName || item.productName || item.product?.nameAz || "Məhsul"}
                              </p>
                              
                              <div className="flex items-center gap-1.5 leading-none text-left">
                                  <FiMapPin size={10} className="text-blue-500" />
                                  <span className="text-[9px] font-black text-blue-500 uppercase italic leading-none text-left truncate">
                                      {item.WarehouseName || item.warehouseName || "ANBAR QEYDİ YOXDUR"}
                                  </span>
                                  <span className="text-gray-200 mx-1 font-normal leading-none">|</span>
                                  <span className="text-[9px] text-gray-400 uppercase font-black italic leading-none">
                                      {unitLabels[unit]}
                                  </span>
                              </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-black italic leading-tight">
                          <p className="text-[10px] text-[#0ea5e9] mb-1.5 tracking-tighter leading-none">
                              {quantity} {unitLabels[unit]} × {unitPrice.toFixed(2)} ₼
                          </p>
                          <p className="text-sm text-gray-900 tracking-tighter font-black leading-none">
                              {itemTotal.toFixed(2)} ₼
                          </p>
                        </div>
                    </div>
                    );
                })
                ) : (
                <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] text-gray-300 uppercase text-[10px] tracking-[0.3em] font-black italic bg-white/50">
                    Sənəd daxilində məlumat yoxdur
                </div>
                )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-10 py-7 border-t border-gray-100 bg-white flex justify-between items-center font-black italic shrink-0 leading-none">
           <div className="text-left leading-none">
                <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1 leading-none">Yekun Mədaxil Dəyəri</p>
                <p className="text-[8px] text-[#0ea5e9] not-italic font-bold uppercase tracking-widest opacity-60 leading-none">Bütün vergilər daxil</p>
           </div>
           <div className="text-right leading-none">
                <span className="text-2xl text-[#1e293b] tracking-tighter italic font-black leading-none">
                    {(purchase.totalAmount || purchase.TotalAmount || 0).toFixed(2)} <span className="text-sm ml-1 text-[#0ea5e9]">₼</span>
                </span>
           </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PurchaseViewModal;