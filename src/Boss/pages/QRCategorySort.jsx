import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiMove, FiGrid, FiLoader } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const QRCategorySort = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Şirkət məlumatlarını alırıq
  const user = JSON.parse(localStorage.getItem('user'));
  const companyId = user?.companyId || user?.CompanyId;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCategories();
  }, [API_URL, companyId]);

  const fetchCategories = async () => {
    if (!companyId) return;
    try {
      // companyId filtri sorğuya əlavə edildi
      const res = await axios.get(`${API_URL}/Categories?companyId=${companyId}&skip=0&take=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rawData = Array.isArray(res.data) ? res.data : (res.data.items || []);
      // Sıralamanı orderIndexByQrMenu-ya görə edirik
      const sorted = rawData.sort((a, b) => (a.orderIndexByQrMenu ?? 999) - (b.orderIndexByQrMenu ?? 999));
      setCategories(sorted);
    } catch { 
      toast.error("Kateqoriyalar yüklənmədi"); 
    } finally { 
      setLoading(false); 
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCategories(items);
    await autoSave(items);
  };

  const autoSave = async (newList) => {
    setIsSaving(true);
    // Payload-a companyId əlavə etmək Backend-in təhlükəsizliyi üçün yaxşıdır
    const payload = newList.map((cat, index) => ({ 
      id: cat.id, 
      orderIndex: index + 1,
      companyId: companyId 
    }));

    try {
      await axios.post(`${API_URL}/QRMenu/update-category-orders?companyId=${companyId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Sıra yeniləndi", { duration: 1000, position: 'bottom-center' });
    } catch {
      toast.error("Yadda saxlamada xəta!");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400 uppercase animate-pulse">Yüklənir...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-10 font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#0ea5e9]/5 text-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-inner">
              <FiGrid size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0f172a] uppercase italic tracking-tighter">Kateqoriya Sıralama</h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Sürüşdürün, avtomatik yadda qalacaq</p>
            </div>
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-[#0ea5e9] font-black text-[10px] uppercase bg-sky-50 px-4 py-2 rounded-full animate-pulse">
              <FiLoader className="animate-spin" /> Saxlanılır...
            </div>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 gap-4">
                {categories.map((cat, index) => (
                  <Draggable key={cat.id} draggableId={cat.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                        className={`flex items-center justify-between p-6 bg-white rounded-3xl border transition-all ${snapshot.isDragging ? "shadow-2xl border-[#0ea5e9] scale-[1.01] z-50 bg-sky-50/30" : "border-gray-100 hover:border-blue-200"}`}
                      >
                        <div className="flex items-center gap-6">
                          <span className="text-xl font-black text-gray-200 italic w-8">#{index + 1}</span>
                          <h3 className="font-black text-[#0f172a] uppercase text-sm tracking-tight">{cat.nameAz}</h3>
                        </div>
                        <FiMove size={24} className="text-gray-300" />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default QRCategorySort;