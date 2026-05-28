import React from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export const newChoiceOption = () => ({
  _k: crypto.randomUUID(),
  productId: '',
  quantity: 1,
  sortOrder: 0,
});

export const newChoiceGroup = () => ({
  _k: crypto.randomUUID(),
  nameAz: '',
  minChoices: 1,
  maxChoices: 1,
  sortOrder: 0,
  options: [newChoiceOption()],
});

export function buildChoiceGroupsPayload(groups) {
  if (!Array.isArray(groups) || groups.length === 0) return [];
  return groups
    .map((g, gi) => ({
      nameAz: String(g.nameAz || '').trim(),
      minChoices: parseInt(g.minChoices, 10) || 0,
      maxChoices: parseInt(g.maxChoices, 10) || 1,
      sortOrder: parseInt(g.sortOrder, 10) || gi + 1,
      options: (g.options || [])
        .filter((o) => o.productId)
        .map((o, oi) => ({
          productId: o.productId,
          quantity: parseFloat(o.quantity) || 1,
          sortOrder: parseInt(o.sortOrder, 10) || oi + 1,
        })),
    }))
    .filter((g) => g.nameAz && g.options.length > 0);
}

/**
 * Business lunch: seçim qrupları (API choiceGroups).
 * @param {{ id: string, nameAz: string }[]} allProducts
 */
export default function ProductSetChoiceGroupsEditor({ groups, setGroups, allProducts }) {
  const updateGroup = (gi, patch) => {
    setGroups((rows) => rows.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
  };

  const updateOption = (gi, oi, patch) => {
    setGroups((rows) =>
      rows.map((g, i) =>
        i === gi
          ? {
              ...g,
              options: g.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)),
            }
          : g
      )
    );
  };

  return (
    <div className="bg-amber-50/40 p-6 rounded-[2.5rem] border border-amber-100/80 space-y-4 text-black">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-left">
          <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest italic">
            Business lunch — seçim qrupları
          </h3>
          <p className="text-[10px] text-amber-900/70 font-bold mt-1 uppercase tracking-tight">
            Terminalda bu məhsula klik edəndə ofisiant qrupdan variant seçir. Boş buraxa bilərsiniz, yalnız tex/kart
            tərkibi kifayətdirsə.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGroups((g) => [...g, newChoiceGroup()])}
          className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:shadow-lg transition-all active:scale-95"
        >
          <FiPlus size={14} /> QRUP ƏLAVƏ ET
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-center py-6 text-amber-700/80 font-bold text-sm italic border border-dashed border-amber-200 rounded-2xl">
          Hələ seçim qrupu yoxdur.
        </p>
      ) : (
        groups.map((g, gi) => (
          <div key={g._k} className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-2 items-start justify-between">
              <input
                type="text"
                placeholder="Qrup adı (məs: Şorba)"
                value={g.nameAz}
                onChange={(e) => updateGroup(gi, { nameAz: e.target.value })}
                className="flex-1 min-w-[200px] px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setGroups((rows) => rows.filter((_, i) => i !== gi))}
                className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                title="Qrupu sil"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-left">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                Min
                <input
                  type="number"
                  min={0}
                  value={g.minChoices}
                  onChange={(e) => updateGroup(gi, { minChoices: e.target.value })}
                  className="w-16 px-2 py-1.5 border border-gray-100 rounded-lg font-bold text-sm"
                />
              </label>
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                Max
                <input
                  type="number"
                  min={1}
                  value={g.maxChoices}
                  onChange={(e) => updateGroup(gi, { maxChoices: e.target.value })}
                  className="w-16 px-2 py-1.5 border border-gray-100 rounded-lg font-bold text-sm"
                />
              </label>
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                Sıra
                <input
                  type="number"
                  value={g.sortOrder}
                  onChange={(e) => updateGroup(gi, { sortOrder: e.target.value })}
                  className="w-16 px-2 py-1.5 border border-gray-100 rounded-lg font-bold text-sm"
                />
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase">Variantlar</span>
                <button
                  type="button"
                  onClick={() =>
                    updateGroup(gi, { options: [...(g.options || []), newChoiceOption()] })
                  }
                  className="text-[10px] font-black text-amber-700 uppercase hover:underline"
                >
                  + variant
                </button>
              </div>
              {(g.options || []).map((o, oi) => (
                <div
                  key={o._k}
                  className="flex flex-wrap gap-2 items-center bg-gray-50/80 p-2 rounded-xl border border-gray-100"
                >
                  <select
                    value={o.productId}
                    onChange={(e) => updateOption(gi, oi, { productId: e.target.value })}
                    className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-amber-400"
                  >
                    <option value="">Məhsul seçin…</option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameAz}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.001"
                    title="Miqdar"
                    value={o.quantity}
                    onChange={(e) => updateOption(gi, oi, { quantity: e.target.value })}
                    className="w-24 px-2 py-2 border border-gray-100 rounded-xl font-bold text-sm text-center"
                  />
                  <input
                    type="number"
                    title="Sıra"
                    value={o.sortOrder}
                    onChange={(e) => updateOption(gi, oi, { sortOrder: e.target.value })}
                    className="w-20 px-2 py-2 border border-gray-100 rounded-xl font-bold text-sm text-center"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateGroup(gi, {
                        options: (g.options || []).filter((_, j) => j !== oi),
                      })
                    }
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
