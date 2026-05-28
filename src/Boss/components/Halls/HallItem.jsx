import React, { useState, useRef } from 'react';
import { FiChevronDown, FiEdit2, FiTrash2, FiPlus, FiMove, FiMap, FiClock, FiMoreVertical } from 'react-icons/fi';
import BossDropdownMenu from '../BossDropdownMenu';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TableAddModal from '../Tables/TableAddModal';
import TableEditModal from '../Tables/TableEditModal';
import BulkTableAddModal from '../Tables/BulkTableAddModal';
import GlobalDeleteModal from '../GlobalDeleteModal';
import HallFloorPlanEditor from './HallFloorPlanEditor';
import HallTimeDiscountRulesModal from './HallTimeDiscountRulesModal';
import api from '../../../api/axios';

const HallItem = ({ hall, onRefresh, onDelete, onEditHall, dragHandleProps }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTableAddOpen, setIsTableAddOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isTableEditOpen, setIsTableEditOpen] = useState(false);
  
  const [isTableDeleteOpen, setIsTableDeleteOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [timeDiscountOpen, setTimeDiscountOpen] = useState(false);
  const [hallMenuOpen, setHallMenuOpen] = useState(false);
  const hallMenuBtnRef = useRef(null);

  // Masaları sıralayırıq
  const tablesList = (hall.tables || hall.Tables || []).sort((a, b) => a.orderIndex - b.orderIndex);

  // 🔥 Masaların sıralanması üçün DND funksiyası
  const onTablesDragEnd = async (result) => { 
    if (!result.destination) return;

    const items = Array.from(tablesList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Yeni orderIndex-ləri təyin edirik
    const updatedTables = items.map((item, index) => ({
      ...item,
      orderIndex: index + 1,
    }));

    try {
      const companyId = JSON.parse(localStorage.getItem('user'))?.companyId;
      const orderPayload = updatedTables.map(t => ({
        id: t.id,
        orderIndex: t.orderIndex
      }));

      // Backend-də TablesController-ə yazdığımız PUT update-orders metodu
      await api.put(`/Tables/update-orders?companyId=${companyId}`, orderPayload);
      onRefresh(); // Səhifəni yeniləyirik ki, yeni sıralama bazadan gəlsin
    } catch (err) {
      console.error("Masaların sıralanmasında xəta:", err);
      onRefresh();
    }
  };

  const handleTableDelete = async () => {
    if (!tableToDelete) return;
    setIsDeleting(true);
    const companyId = JSON.parse(localStorage.getItem('user'))?.companyId;
    try {
      await api.delete(`/Tables/${tableToDelete.id}?companyId=${companyId}`);
      onRefresh(); 
      setIsTableDeleteOpen(false);
      setTableToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || "Xəta baş verdi!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Hall Header — mobil: başlıq + ayrıca əməliyyat sətri */}
      <div className={`transition-colors ${isExpanded ? 'bg-gray-50/50' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-4 md:px-8 md:py-4">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }
            }}
            className={`flex cursor-pointer items-center gap-3 px-4 py-3 md:min-w-0 md:flex-1 md:px-0 md:py-0 ${isExpanded ? '' : 'hover:bg-gray-50/30 md:hover:bg-transparent'}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {dragHandleProps ? (
              <div
                {...dragHandleProps}
                className="shrink-0 cursor-grab rounded-lg p-1 text-gray-300 active:cursor-grabbing hover:bg-gray-100 hover:text-gray-500"
                onClick={(e) => e.stopPropagation()}
                title="Sıranı dəyişmək üçün sürüşdürün"
              >
                <FiMove size={16} />
              </div>
            ) : null}
            <div className={`shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <FiChevronDown className="text-gray-400" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-base font-bold tracking-tight text-[#1e293b] md:text-lg">{hall.nameAz}</span>
              <span className="text-[10px] font-black uppercase text-gray-400">Sıra: #{hall.orderIndex}</span>
            </div>
          </div>

          <div
            className="relative flex flex-wrap items-center justify-end gap-1.5 border-t border-gray-100/80 px-4 py-2.5 md:border-t-0 md:px-0 md:py-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              title="Zalı redaktə et"
              onClick={() => onEditHall(hall)}
              className="rounded-lg bg-[#0ea5e9] p-2.5 text-white shadow-sm transition-all hover:bg-sky-600"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              type="button"
              title="Masa əlavə et"
              onClick={() => setIsTableAddOpen(true)}
              className="rounded-lg bg-[#f1f5f9] p-2.5 text-[#475569] transition-all hover:bg-[#e2e8f0]"
            >
              <FiPlus size={20} />
            </button>
            <button
              ref={hallMenuBtnRef}
              type="button"
              aria-label="Zal əməliyyatları"
              aria-expanded={hallMenuOpen}
              aria-haspopup="menu"
              title="Əlavə əməliyyatlar"
              onClick={() => setHallMenuOpen((v) => !v)}
              className={`rounded-lg border bg-white p-2.5 text-slate-500 shadow-sm transition-all ${
                hallMenuOpen
                  ? 'border-[#0ea5e9]/40 text-[#0ea5e9] ring-2 ring-[#0ea5e9]/25'
                  : 'border-slate-200 hover:border-[#0ea5e9]/35 hover:bg-slate-50 hover:text-[#0ea5e9]'
              }`}
            >
              <FiMoreVertical size={20} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>

      {/* Tables List (Expanded) */}
      {isExpanded && (
        <div className="bg-white">
          {tablesList.length > 0 ? (
            <DragDropContext onDragEnd={onTablesDragEnd}>
              <Droppable droppableId={`tables-droppable-${hall.id}`}>
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    className="flex flex-col"
                  >
                    {tablesList.map((table, index) => (
                      <Draggable key={table.id} draggableId={table.id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex flex-col gap-3 border-t border-gray-50 px-4 py-3 transition-all hover:bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4 md:px-12 lg:px-16 ${snapshot.isDragging ? 'bg-sky-50/50 shadow-sm' : ''}`}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                              {/* Sürüşdürmə tutacağı (Drag Handle) */}
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 text-gray-300">
                                <FiMove size={14} />
                              </div>
                              <span className="text-[11px] font-black text-gray-300 w-6">#{table.orderIndex}</span>
                              <span className="truncate font-semibold text-gray-700">{table.nameAz}</span>
                              <span className="shrink-0 rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-500">
                                {table.capacity} nəfər
                              </span>
                            </div>

                            <div className="flex shrink-0 items-center justify-end gap-2 pl-8 sm:pl-0">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedTable({ ...table, hallId: hall.id }); setIsTableEditOpen(true); }}
                                className="p-2 bg-[#0ea5e9] text-white rounded-lg hover:bg-sky-600 transition-all shadow-sm"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setTableToDelete(table); setIsTableDeleteOpen(true); }}
                                className="p-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-all shadow-sm"
                              >
                                <FiTrash2 size={14} />
                              </button>
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
          ) : (
            <div className="border-t border-gray-50 px-6 py-8 text-center text-[10px] font-black uppercase italic tracking-widest text-gray-400 sm:px-12">
              Bu zalda masa yoxdur.
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <TableAddModal
        isOpen={isTableAddOpen}
        onClose={() => setIsTableAddOpen(false)}
        onRefresh={onRefresh}
        hallId={hall.id}
        hallName={hall.nameAz}
        isTableHourActive={Boolean(hall.isTableHourActive ?? hall.IsTableHourActive)}
        onSwitchToBulkAdd={() => setBulkAddOpen(true)}
      />

      <BulkTableAddModal
        isOpen={bulkAddOpen}
        onClose={() => setBulkAddOpen(false)}
        onRefresh={onRefresh}
        hallId={hall.id}
        hallName={hall.nameAz}
        isTableHourActive={Boolean(hall.isTableHourActive ?? hall.IsTableHourActive)}
      />
      
      {selectedTable && (
        <TableEditModal 
          isOpen={isTableEditOpen} 
          onClose={() => { setIsTableEditOpen(false); setSelectedTable(null); }} 
          onRefresh={onRefresh} 
          tableData={selectedTable}
          isTableHourActive={Boolean(hall.isTableHourActive ?? hall.IsTableHourActive)}
        />
      )}

      <GlobalDeleteModal 
        isOpen={isTableDeleteOpen}
        onClose={() => setIsTableDeleteOpen(false)}
        onConfirm={handleTableDelete}
        title="Masanı Sil"
        description={`"${tableToDelete?.nameAz}" adlı masanı silmək istədiyinizə əminsiniz?`}
        isLoading={isDeleting}
      />

      <HallFloorPlanEditor
        isOpen={floorPlanOpen}
        hall={hall}
        onClose={() => setFloorPlanOpen(false)}
        onSaved={onRefresh}
      />

      <HallTimeDiscountRulesModal
        isOpen={timeDiscountOpen}
        onClose={() => setTimeDiscountOpen(false)}
        hallId={hall.id}
        hallName={hall.nameAz}
      />

      <BossDropdownMenu
        isOpen={hallMenuOpen}
        onClose={() => setHallMenuOpen(false)}
        anchorRef={hallMenuBtnRef}
      >
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-800 transition hover:bg-slate-50"
          onClick={() => {
            setHallMenuOpen(false);
            setFloorPlanOpen(true);
          }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
            <FiMap size={16} />
          </span>
          <span className="leading-snug">Xəritə üzrə düzəliş</span>
        </button>
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-800 transition hover:bg-slate-50"
          onClick={() => {
            setHallMenuOpen(false);
            setTimeDiscountOpen(true);
          }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <FiClock size={16} />
          </span>
          <span className="leading-snug">Endirim ayarları</span>
        </button>
        <div className="my-1 border-t border-slate-100" />
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-50"
          onClick={() => {
            setHallMenuOpen(false);
            onDelete(hall);
          }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
            <FiTrash2 size={16} />
          </span>
          <span className="leading-snug">Zalı sil</span>
        </button>
      </BossDropdownMenu>
    </div>
  );
};

export default HallItem;