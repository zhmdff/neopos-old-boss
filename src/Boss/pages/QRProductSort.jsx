import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiMove, FiPackage, FiLoader, FiChevronRight } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const QRProductSort = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const user = JSON.parse(localStorage.getItem('user'));
  const companyId = user?.companyId || user?.CompanyId;
  const token = localStorage.getItem('token');

  // 1. Şirkətin kateqoriyalarını çək
  useEffect(() => {
    const fetchCats = async () => {
      if (!companyId) return;
      try {
        const res = await axios.get(`${API_URL}/Categories?companyId=${companyId}&skip=0&take=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setCategories(data);
        if (data.length > 0) setSelectedCatId(data[0].id);
      } catch { toast.error("Kateqoriyalar gəlmədi"); }
    };
    fetchCats();
  }, [API_URL, companyId]);

  // 2. Seçilmiş kateqoriyanın məhsullarını (şirkət filtri ilə) çək
  useEffect(() => {
    if (!selectedCatId || !companyId) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/Products?categoryId=${selectedCatId}&companyId=${companyId}&take=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setProducts(data.sort((a, b) => (a.orderIndexByQrMenu ?? 999) - (b.orderIndexByQrMenu ?? 999)));
      } finally { setLoading(false); }
    };
    fetchProducts();
  }, [selectedCatId, API_URL, companyId]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setProducts(items);

    setIsSaving(true);
    const payload = items.map((p, index) => ({ 
      id: p.id, 
      orderIndex: index + 1,
      companyId: companyId 
    }));
    try {
      await axios.post(`${API_URL}/QRMenu/update-product-orders?companyId=${companyId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Sıra yeniləndi", { duration: 800, position: 'bottom-center' });
    } finally { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-10 font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sol Panel: Şirkətin Kateqoriyaları */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-10">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-4">Kateqoriya Seçimi</h3>
               <div className="space-y-2">
                 {categories.map(cat => (
                   <button 
                    key={cat.id} 
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-[11px] uppercase transition-all ${selectedCatId === cat.id ? "bg-[#0ea5e9] text-white shadow-lg shadow-blue-200" : "text-gray-500 hover:bg-gray-50"}`}
                   >
                     {cat.nameAz}
                     {selectedCatId === cat.id && <FiChevronRight />}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {/* Sağ Panel: Məhsullar */}
          <div className="lg:col-span-3">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-inner"><FiPackage size={24}/></div>
                   <h1 className="text-2xl font-black text-[#0f172a] uppercase italic tracking-tighter">Məhsul Sıralama</h1>
                </div>
                {isSaving && <FiLoader size={20} className="text-[#0ea5e9] animate-spin" />}
             </div>

             {loading ? <div className="p-20 text-center font-black text-gray-300 uppercase">Yüklənir...</div> : (
               <DragDropContext onDragEnd={onDragEnd}>
                 <Droppable droppableId="prods">
                   {(provided) => (
                     <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                       {products.map((p, index) => (
                         <Draggable key={p.id} draggableId={p.id.toString()} index={index}>
                           {(provided, snapshot) => (
                             <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                              className={`flex items-center justify-between p-5 bg-white rounded-3xl border transition-all ${snapshot.isDragging ? "shadow-2xl border-[#0ea5e9] scale-[1.01] bg-sky-50/30" : "border-gray-100 hover:border-blue-100"}`}
                             >
                                <div className="flex items-center gap-5">
                                   <span className="text-sm font-black text-gray-200 italic">#{index + 1}</span>
                                   <span className="font-black text-[#0f172a] uppercase text-xs tracking-tight">{p.nameAz}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                   <span className="text-xs font-black text-[#0ea5e9] bg-sky-50 px-4 py-1.5 rounded-xl">{p.salePrice} ₼</span>
                                   <FiMove className="text-gray-300" />
                                </div>
                             </div>
                           )}
                         </Draggable>
                       ))}
                       {provided.placeholder}
                       {products.length === 0 && <p className="text-center py-20 text-gray-300 font-black uppercase italic tracking-widest">Bu kateqoriyada məhsul yoxdur</p>}
                     </div>
                   )}
                 </Droppable>
               </DragDropContext>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRProductSort;