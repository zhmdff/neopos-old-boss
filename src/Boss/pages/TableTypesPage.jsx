import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../api/axios';
import HallItem from '../components/Halls/HallItem';
import HallAddModal from '../components/Halls/HallAddModal';
import HallEditModal from '../components/Halls/HallEditModal';
import GlobalDeleteModal from '../components/GlobalDeleteModal';

const TableTypesPage = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHallAddOpen, setIsHallAddOpen] = useState(false);
  const [isHallEditOpen, setIsHallEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 1. Şirkət məlumatı
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const companyId = user?.companyId;

  // 2. Məlumatları gətirmə funksiyası
  const fetchHalls = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await api.get(`/Halls?companyId=${companyId}`);
      // Backend-dən gələn məlumatı orderIndex-ə görə sıralayırıq
      const sortedData = res.data.sort((a, b) => a.orderIndex - b.orderIndex);
      setHalls(sortedData);
    } catch (err) {
      console.error("Zalları yükləyərkən xəta:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  // 3. Sürüşdürmə (Drag & Drop) məntiqi
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(halls);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Yeni orderIndex-ləri təyin edirik (1-dən başlayaraq)
    const updatedHalls = items.map((item, index) => ({
      ...item,
      orderIndex: index + 1,
    }));

    setHalls(updatedHalls); // Frontda dərhal yenilə

    try {
      const orderPayload = updatedHalls.map((h) => ({
        id: h.id,
        orderIndex: h.orderIndex,
      }));
      
      // Backend-ə yeni sıralamanı göndər
      await api.put(`/Halls/update-orders?companyId=${companyId}`, orderPayload);
    } catch (err) {
      console.error("Sıralama yenilənərkən xəta:", err);
      fetchHalls(); // Xəta olarsa köhnə vəziyyətə qayıt
    }
  };

  // 4. Silməni təsdiqləyən funksiya (ReferenceError həlli)
  const handleDeleteConfirm = async () => {
    if (!selectedHall || !companyId) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/Halls/${selectedHall.id}?companyId=${companyId}`);
      await fetchHalls();
      setIsDeleteOpen(false);
      setSelectedHall(null);
    } catch (err) {
      alert(err.response?.data?.message || "Zalı silmək mümkün olmadı!");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn px-3 pb-6 pt-2 text-left sm:px-4 md:p-2">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">Masa tipləri</h1>
          <p className="mt-1.5 max-w-xl text-sm font-medium italic leading-snug text-gray-400">
            Zalları genişləndirin; siyahıda tutub sürüşdürərək sıranı dəyişə bilərsiniz.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsHallAddOpen(true)}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#0ea5e9] px-6 py-3.5 text-sm font-black uppercase text-white shadow-lg shadow-[#0ea5e9]/15 transition-all hover:shadow-xl hover:shadow-[#0ea5e9]/25 active:scale-[0.98] sm:w-auto"
        >
          <FiPlus strokeWidth={3} className="shrink-0" />
          Zal yarat
        </button>
      </div>

      <div className="min-h-[12rem] overflow-x-hidden overflow-y-visible rounded-2xl border border-gray-100 bg-white shadow-sm sm:rounded-3xl md:rounded-[2.5rem]">
        {/* Desktop cədvəl başlığı — mobilə sığmır, gizlədilir */}
        <div className="hidden border-b border-gray-50 bg-gray-50/50 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 md:grid md:grid-cols-12 md:gap-4 md:px-10 md:py-5">
          <div className="col-span-1">#</div>
          <div className="col-span-7 lg:col-span-8">Zal adı</div>
          <div className="col-span-4 text-right lg:col-span-3">Əməliyyatlar</div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-[#0ea5e9] animate-pulse font-bold italic tracking-widest uppercase text-xs">
            Zallar Yüklənir...
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="halls-list">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className="divide-y divide-gray-50"
                >
                  {halls.length > 0 ? (
                    halls.map((hall, index) => (
                      <Draggable key={hall.id} draggableId={hall.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={provided.draggableProps.style}
                            className={`${snapshot.isDragging ? 'bg-sky-50/50' : ''} transition-colors`}
                          >
                            <HallItem
                              hall={hall}
                              index={index + 1}
                              dragHandleProps={provided.dragHandleProps}
                              onRefresh={fetchHalls}
                              onDelete={(h) => { setSelectedHall(h); setIsDeleteOpen(true); }}
                              onEditHall={(h) => { setSelectedHall(h); setIsHallEditOpen(true); }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                      Hələ ki, zal əlavə edilməyib
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Modallar */}
      <HallAddModal 
        isOpen={isHallAddOpen} 
        onClose={() => setIsHallAddOpen(false)} 
        onRefresh={fetchHalls} 
      />

      <HallEditModal 
        isOpen={isHallEditOpen}
        onClose={() => setIsHallEditOpen(false)}
        onRefresh={fetchHalls}
        hallData={selectedHall}
      />

      <GlobalDeleteModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        title={selectedHall?.nameAz}
        description={`"${selectedHall?.nameAz}" zalını silmək istədiyinizə əminsiniz?`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default TableTypesPage;