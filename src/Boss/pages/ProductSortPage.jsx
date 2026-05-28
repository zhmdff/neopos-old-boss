import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiMenu } from 'react-icons/fi';
import api from '../../api/axios';

const ProductSortPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Şirkət ID-sini götürürük
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const companyId = user?.companyId;

  // 2. Kateqoriyaları şirkətə görə çəkirik
  useEffect(() => {
    if (companyId) {
      api.get(`/Categories?companyId=${companyId}&take=1000`)
        .then(res => setCategories(res.data))
        .catch(err => console.error("Kateqoriyalar gəlmədi:", err));
    }
  }, [companyId]);

  // 3. Məhsulları şirkət və kateqoriya filtri ilə çəkirik
  useEffect(() => {
    if (selectedCategory && companyId) {
      setLoading(true);
      api.get(`/Products?companyId=${companyId}&categoryId=${selectedCategory}&take=1000`)
        .then(res => {
          // Gələn datanı orderIndex-ə görə sıralayırıq
          const sortedData = res.data.sort((a, b) => a.orderIndex - b.orderIndex);
          setProducts(sortedData);
        })
        .catch(err => console.error("Məhsullar gəlmədi:", err))
        .finally(() => setLoading(false));
    } else {
      setProducts([]);
    }
  }, [selectedCategory, companyId]);

  // 4. Sürükləyib buraxandan sonra sıralamanı yadda saxlayırıq
  const onDragEnd = async (result) => {
    if (!result.destination || !companyId) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProducts(items);

    const updateData = items.map((prod, index) => ({
      id: prod.id,
      orderIndex: index + 1
    }));

    try {
      // Backend-dəki UpdateOrdersAsync(companyId, dtos) metoduna uyğun
      await api.post(`/Products/update-orders?companyId=${companyId}`, updateData);
    } catch (err) {
      alert("Sıralama yadda saxlanılmadı! Səbəb: " + (err.response?.data?.message || "Bilinməyən xəta"));
      // Xəta olsa siyahını yenidən çək ki, köhnə halına qayıtsın
      api.get(`/Products?companyId=${companyId}&categoryId=${selectedCategory}&take=1000`)
        .then(res => setProducts(res.data.sort((a, b) => a.orderIndex - b.orderIndex)));
    }
  };

  return (
    <div className="p-8 animate-fadeIn max-w-6xl mx-auto text-black">
      <div className="mb-10 text-left">
        <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter mb-2 italic">Məhsulları Sırala</h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">Menyuda məhsulların görünmə ardıcıllığını təyin et</p>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block text-left">Kateqoriya Seçin:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none font-bold text-[#1e293b] outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all cursor-pointer"
          >
            <option value="">Kateqoriya seçin...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nameAz}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCategory && (
        <div className="space-y-6">
          <div className="flex flex-col text-left">
            <h2 className="text-xl font-black text-[#0f172a] uppercase tracking-tighter">
              "{categories.find(c => c.id === selectedCategory)?.nameAz}" Kateqoriyası
            </h2>
            <p className="text-sm font-medium text-gray-400 mt-1">Sıralama dəyişmək üçün aşağıdakı kartları yuxarı-aşağı sürükləyin.</p>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="products">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {products.map((prod, index) => (
                    <Draggable key={prod.id} draggableId={prod.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center justify-between p-6 bg-white rounded-2xl border transition-all ${
                            snapshot.isDragging ? 'border-[#0ea5e9] shadow-2xl z-50 ring-4 ring-[#0ea5e9]/5' : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center font-black text-[#0ea5e9] text-sm border border-gray-100">
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-[#1e293b] uppercase tracking-tight">{prod.nameAz}</h3>
                              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Barkod: {prod.barcode || 'Yoxdur'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-lg font-black text-[#1e293b]">{Number(prod.salePrice).toFixed(2)} ₼</p>
                              <p className="text-[10px] font-black text-[#0ea5e9] uppercase tracking-widest">{prod.workshopName || 'Mətbəx'}</p>
                            </div>
                            <div className="text-gray-300">
                              <FiMenu size={24} />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          {loading && <div className="text-center py-10 font-black text-[#0ea5e9] animate-pulse uppercase tracking-widest text-xs">Yüklənir...</div>}
          {!loading && products.length === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] py-20 text-center">
              <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Bu kateqoriyada məhsul tapılmadı</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSortPage;