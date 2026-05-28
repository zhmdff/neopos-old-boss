import React, { useEffect, useState } from 'react';

function workshopName(w) {
  return String(w?.nameAz ?? w?.NameAz ?? '').trim();
}

function workshopId(w) {
  return String(w?.id ?? w?.Id ?? '');
}

/** Emalatxana: datalist ilə mövcud adlardan seçim (yazma ilə uyğunlaşdırma). */
export default function WorkshopCombobox({
  workshops,
  value,
  onChange,
  disabled = false,
  labelClassName = 'text-[11px] font-black text-[#1e293b] uppercase ml-1 tracking-wider',
  fallbackName = '',
}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const w = workshops.find((x) => workshopId(x) === String(value));
    if (w) setInputValue(workshopName(w));
    else if (fallbackName && String(value)) setInputValue(String(fallbackName));
    else if (!value) setInputValue('');
  }, [value, workshops, fallbackName]);

  const applyTextToId = (txt) => {
    const t = txt.trim();
    if (!t) {
      onChange('');
      return;
    }
    const m = workshops.find((x) => workshopName(x).toLowerCase() === t.toLowerCase());
    onChange(m ? workshopId(m) : '');
  };

  const handleInputChange = (e) => {
    const txt = e.target.value;
    setInputValue(txt);
    applyTextToId(txt);
  };

  const handleBlur = () => {
    applyTextToId(inputValue);
  };

  return (
    <div className="space-y-2 text-left">
      <label className={labelClassName}>Emalatxana</label>
      <input
        disabled={disabled}
        list="boss-workshop-datalist"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        autoComplete="off"
        placeholder="Siyahıdan seçin…"
        className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-black outline-none transition focus:border-[#0ea5e9] focus:ring-4 focus:ring-blue-50 disabled:opacity-50"
      />
      <datalist id="boss-workshop-datalist">
        {workshops.map((w) => (
          <option key={workshopId(w)} value={workshopName(w)} />
        ))}
      </datalist>
      {inputValue.trim() && !value ? (
        <p className="text-[10px] font-bold leading-snug text-slate-500">
          Dəqiq adı siyahıdan seçin — yalnız mövcud emalatxanalar.
        </p>
      ) : null}
    </div>
  );
}
