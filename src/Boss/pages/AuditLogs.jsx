import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSearch, FiClock, FiUser, FiInfo, FiMapPin, FiBell, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import moment from 'moment';

const SHIFT_GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const AuditLogs = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const pinnedShiftId = useMemo(() => {
        const raw = searchParams.get('shiftId');
        if (!raw || !SHIFT_GUID_RE.test(String(raw).trim())) return '';
        return String(raw).trim();
    }, [searchParams]);
    const pinnedShiftLabel = useMemo(() => {
        try {
            return decodeURIComponent(searchParams.get('shiftLabel') || '').trim();
        } catch {
            return (searchParams.get('shiftLabel') || '').trim();
        }
    }, [searchParams]);

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAction, setSelectedAction] = useState("HAMISI");
    const [rangeMode, setRangeMode] = useState("shift"); // shift | month | custom
    const [customFrom, setCustomFrom] = useState(() => moment().subtract(7, "days").format("YYYY-MM-DD"));
    const [customTo, setCustomTo] = useState(() => moment().format("YYYY-MM-DD"));
    const [activeShiftRange, setActiveShiftRange] = useState({ start: null, end: null });
    const [activeShiftId, setActiveShiftId] = useState(null);
    const pageSize = 50; // hər «Daha çox» addımında serverdən əlavə qeyd (tarix aralığı serverdə süzülür)
    const maxTake = 5000;
    const [take, setTake] = useState(pageSize);
    const [hasMore, setHasMore] = useState(true);
    const sentinelRef = useRef(null);
    const fetchLockRef = useRef(false);
    const [liveTick, setLiveTick] = useState(0);
    const [notifyPermission, setNotifyPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
    );

    useLayoutEffect(() => {
        if (!pinnedShiftId) return;
        setActiveShiftId(pinnedShiftId);
        setRangeMode('shift');
        setTake(pageSize);
        setHasMore(true);
    }, [pinnedShiftId, pageSize]);

    useEffect(() => {
        if (pinnedShiftId && rangeMode !== 'shift') {
            setSearchParams({}, { replace: true });
        }
    }, [rangeMode, pinnedShiftId, setSearchParams]);

    const user = JSON.parse(localStorage.getItem('user'));
    const companyId = user?.companyId || user?.CompanyId;

    const normalizeAction = (s) => {
        const x = String(s || '').toUpperCase();
        return x
            .replace(/[Əə]/g, 'E')
            .replace(/[Ğğ]/g, 'G')
            .replace(/[Öö]/g, 'O')
            .replace(/[Üü]/g, 'U')
            .replace(/[Şş]/g, 'S')
            .replace(/[Çç]/g, 'C')
            .replace(/[İı]/g, 'I')
            .replace(/[Ə]/g, 'E');
    };

    const actionFilters = [
        { id: "HAMISI", label: "HAMİSİ" },
        // Arxiv çeki yeniləndi / Məhsul silindi - mütləq qırmızı
        { id: "ARXIV", label: "ARXİV ÇEKİ YENİLƏNDİ" },
        { id: "MEHSUL SILINDI", label: "MƏHSUL SİLİNDİ" },
        { id: "SILINDI", label: "SİLİNMƏLƏR" },
        { id: "ELAVE", label: "ƏLAVƏLƏR" },
        { id: "REDAKTE", label: "DƏYİŞİKLİKLƏR" },
        { id: "BAGLANDI", label: "ÖDƏNİŞLƏR" },
        { id: "ENDIRIM", label: "ENDİRİMLƏR" },
    ];

    useEffect(() => {
        fetchLogs();
    }, [take, companyId, liveTick, rangeMode, activeShiftId, customFrom, customTo]);

    useEffect(() => {
        if (!companyId) return;
        setTake(pageSize);
        setHasMore(true);
    }, [companyId, pageSize]);

    // Canlı siyahı: SignalR indi BossLayout-da (bütün Boss); hadisə gələndə bu səhifə açıqdırsa yenilə.
    useEffect(() => {
        const onLive = () => setLiveTick((n) => n + 1);
        window.addEventListener('neopos-audit-live', onLive);
        return () => window.removeEventListener('neopos-audit-live', onLive);
    }, []);

    const requestProductDeleteNotifications = async () => {
        if (typeof Notification === 'undefined') {
            toast.error('Bu cihaz brauzer bildirişini dəstəkləmir.');
            return;
        }
        const p = await Notification.requestPermission();
        setNotifyPermission(p);
        if (p === 'granted') toast.success('Məhsul silinmə bildirişləri aktivdir.');
        else if (p === 'denied') toast.error('Bildiriş əl ilə bloklanıb — brauzer parametrlərindən açın.');
    };

    // URL-dən növbə və ya aktiv növbənin vaxt sərhədləri
    useEffect(() => {
        if (!companyId) return;
        if (pinnedShiftId) {
            setActiveShiftId(pinnedShiftId);
            setRangeMode('shift');
            setActiveShiftRange({ start: null, end: null });
            return;
        }
        (async () => {
            try {
                const sr = await api.get(`/CashShifts/active/${companyId}`);
                const shift = sr.data || null;
                const sid = shift?.id ?? shift?.Id ?? shift?.shiftId ?? shift?.ShiftId ?? null;
                setActiveShiftId(sid);
                const st = shift?.startTime ?? shift?.StartTime ?? shift?.openTime ?? shift?.OpenTime ?? null;
                const et = shift?.endTime ?? shift?.EndTime ?? null;
                setActiveShiftRange({
                    start: st ? moment.utc(st) : null,
                    end: et ? moment.utc(et) : null,
                });
            } catch {
                setActiveShiftRange({ start: null, end: null });
                setActiveShiftId(null);
            }
        })();
    }, [companyId, pinnedShiftId]);

    // Infinite scroll: sentinel görünən kimi take-ni artırırıq.
    useEffect(() => {
        if (!sentinelRef.current) return;
        if (!hasMore) return;
        if (loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first?.isIntersecting && hasMore && !loading) {
                    setTake((t) => Math.min(t + pageSize, maxTake));
                }
            },
            { root: null, threshold: 0.1, rootMargin: '600px' }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loading, pageSize, maxTake]);

    const fetchLogs = async () => {
        if (!companyId) return;
        if (fetchLockRef.current) return;
        fetchLockRef.current = true;
        setLoading(true);
        try {
            let url;
            if (rangeMode === "shift" && activeShiftId) {
                url = `/AuditLogs/shift/${activeShiftId}?companyId=${companyId}&take=${take}`;
            } else {
                const params = new URLSearchParams({
                    companyId: String(companyId),
                    take: String(take),
                });
                if (rangeMode === "month") {
                    const start = moment.utc().startOf("month");
                    const end = moment.utc().endOf("month");
                    params.set("from", start.toISOString());
                    params.set("to", end.toISOString());
                } else if (rangeMode === "custom") {
                    const start = moment.utc(customFrom, "YYYY-MM-DD").startOf("day");
                    const end = moment.utc(customTo, "YYYY-MM-DD").endOf("day");
                    params.set("from", start.toISOString());
                    params.set("to", end.toISOString());
                }
                url = `/AuditLogs?${params.toString()}`;
            }
            const res = await api.get(url);
            const next = Array.isArray(res.data) ? res.data : [];
            setLogs(next);
            setHasMore(next.length === take && take < maxTake);
        } catch (err) { console.error(err); } finally {
            setLoading(false);
            fetchLockRef.current = false;
        }
    };

    const inTimeRange = (createdAt) => {
        if (rangeMode === "shift") {
            // Shift rejimində artıq API özü filtr edir: /AuditLogs/shift/{shiftId}
            return true;
        }

        const created = createdAt ? moment.utc(createdAt) : null;
        if (!created || !created.isValid()) return false;

        if (rangeMode === "month") {
            const start = moment.utc().startOf("month");
            const end = moment.utc().endOf("month");
            return created.isSameOrAfter(start) && created.isSameOrBefore(end);
        }

        // custom
        const start = moment.utc(customFrom, "YYYY-MM-DD").startOf("day");
        const end = moment.utc(customTo, "YYYY-MM-DD").endOf("day");
        return created.isSameOrAfter(start) && created.isSameOrBefore(end);
    };

    const timeFilteredLogs = logs.filter((log) => inTimeRange(log.createdAt));

    const actionCounts = actionFilters.reduce((acc, f) => {
        if (f.id === "HAMISI") {
            acc[f.id] = timeFilteredLogs.length;
            return acc;
        }
        const count = timeFilteredLogs.filter((l) => normalizeAction(l.action).includes(normalizeAction(f.id))).length;
        acc[f.id] = count;
        return acc;
    }, {});

    const filteredLogs = timeFilteredLogs.filter(log => {
        const matchesSearch =
            log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.tableName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction =
            selectedAction === "HAMISI" || normalizeAction(log.action).includes(normalizeAction(selectedAction));
        return matchesSearch && matchesAction;
    });

    const showFinalCounts = !loading && !hasMore;

    const getActionStyle = (action) => {
        const a = normalizeAction(action);
        if (a.includes('ARXIV') || a.includes('MEHSUL SILINDI') || a.includes('SILINDI')) return 'bg-red-50 text-red-600 border-red-100';
        if (a.includes('ENDIRIM')) return 'bg-amber-50 text-amber-600 border-amber-100';
        if (a.includes('BAGLANDI')) return 'bg-purple-50 text-purple-600 border-purple-100';
        if (a.includes('REDAKTE')) return 'bg-sky-50 text-blue-600 border-blue-100';
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    };

    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen text-black">
            {/* Header Area */}
            <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-800">Hərəkət Tarixçəsi</h1>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Canlı Sistem Loqları</p>
                        {pinnedShiftId ? (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/90 px-3 py-2">
                                <span className="text-[10px] font-black uppercase text-indigo-900">
                                    Seçilmiş növbə
                                    {pinnedShiftLabel ? (
                                        <span className="ml-1 font-bold normal-case text-indigo-800">· {pinnedShiftLabel}</span>
                                    ) : null}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSearchParams({}, { replace: true })}
                                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[9px] font-black uppercase text-slate-600 border border-indigo-100"
                                >
                                    <FiX size={12} /> Bağla
                                </button>
                            </div>
                        ) : null}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={requestProductDeleteNotifications}
                                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-700 shadow-sm transition hover:border-[#0ea5e9]/40"
                            >
                                <FiBell className="text-[#0ea5e9]" size={14} />
                                Telefonda bildiriş (məhsul silinmə)
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500">
                                    {notifyPermission === 'granted'
                                        ? 'aktiv'
                                        : notifyPermission === 'denied'
                                          ? 'bloklanıb'
                                          : notifyPermission === 'unsupported'
                                            ? 'yoxdur'
                                            : 'icazə ver'}
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="relative w-full md:w-80">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" placeholder="Axtar..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#0ea5e9] outline-none shadow-sm"
                        />
                    </div>
                </div>

                {/* Range + Filter Chips */}
                <div className="flex flex-col gap-3">
                    {/* Time Range Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {[
                            { id: "shift", label: "CARI NÖVBƏ" },
                            { id: "month", label: "BU AY" },
                            { id: "custom", label: "ARALIQ" },
                        ].map((r) => (
                            <button
                                key={r.id}
                                onClick={() => {
                                    setTake(pageSize);
                                    setHasMore(true);
                                    setRangeMode(r.id);
                                }}
                                className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 uppercase ${
                                    rangeMode === r.id
                                        ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white shadow-md scale-95'
                                        : 'bg-white border-transparent text-slate-500 hover:border-slate-100'
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {rangeMode === "custom" ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-sm">
                                <FiClock className="text-slate-300" size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Başlanğıc</span>
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) => {
                                        setTake(pageSize);
                                        setHasMore(true);
                                        setCustomFrom(e.target.value);
                                    }}
                                    className="text-xs font-bold text-slate-700 bg-transparent outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-sm">
                                <FiClock className="text-slate-300" size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Son</span>
                                <input
                                    type="date"
                                    value={customTo}
                                    onChange={(e) => {
                                        setTake(pageSize);
                                        setHasMore(true);
                                        setCustomTo(e.target.value);
                                    }}
                                    className="text-xs font-bold text-slate-700 bg-transparent outline-none"
                                />
                            </div>
                        </div>
                    ) : null}

                    {/* Filter Chips - Horizontal Scrollable on Mobile */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {actionFilters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setSelectedAction(filter.id)}
                                className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 uppercase ${
                                    selectedAction === filter.id
                                        ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white shadow-md scale-95'
                                        : 'bg-white border-transparent text-slate-500 hover:border-slate-100'
                                }`}
                            >
                                {filter.label}
                                <span className="ml-2 text-[10px] font-black text-slate-400">
                                    - {showFinalCounts ? (actionCounts[filter.id] ?? 0) : '—'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop Table Rejimi (lg və yuxarı) */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vaxt / Tarix</th>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">İşçi</th>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Əməliyyat</th>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Masa</th>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading && logs.length === 0 ? (
                            <tr><td colSpan="5" className="p-10 text-center font-bold text-slate-400">Yüklənir...</td></tr>
                        ) : filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-sky-50/30 transition-colors group">
                                <td className="p-5">
                                    <div className="flex flex-col font-black text-xs">
                                        <div className="text-[#0ea5e9] flex items-center gap-1"><FiClock size={12}/>{moment.utc(log.createdAt).format('HH:mm')}</div>
                                        <div className="text-slate-400 text-[10px] ml-4">{moment.utc(log.createdAt).format('DD.MM.YYYY')}</div>
                                    </div>
                                </td>
                                <td className="p-5 text-xs font-black text-slate-700 uppercase">{log.userName}</td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getActionStyle(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-5 text-xs font-black text-slate-600 uppercase italic">{log.tableName || "---"}</td>
                                <td className="p-5 text-xs font-bold text-slate-500 max-w-sm truncate group-hover:whitespace-normal">{log.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card Rejimi (lg-dən aşağı) */}
            <div className="lg:hidden space-y-3">
                {loading && logs.length === 0 ? (
                    <div className="text-center py-10 font-bold text-slate-400">Yüklənir...</div>
                ) : filteredLogs.map((log) => (
                    <div key={log.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getActionStyle(log.action)}`}>
                                {log.action}
                            </span>
                                <div className="text-right">
                                <div className="text-[#0ea5e9] font-black text-sm">{moment.utc(log.createdAt).format('HH:mm')}</div>
                                <div className="text-slate-400 font-bold text-[10px]">{moment.utc(log.createdAt).format('DD.MM.YYYY')}</div>
                                </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 border-y border-slate-50 py-3">
                            <div className="flex items-center gap-2">
                                <FiUser className="text-slate-400" size={14}/>
                                <span className="text-[11px] font-black text-slate-700 uppercase">{log.userName}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-end text-right">
                                <FiMapPin className="text-slate-400" size={14}/>
                                <span className="text-[11px] font-black text-slate-700 uppercase italic">{log.tableName || "---"}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 items-start bg-slate-50 p-3 rounded-2xl">
                            <FiInfo className="text-slate-300 mt-0.5 shrink-0" size={14}/>
                            <p className="text-xs font-bold text-slate-500 leading-snug">{log.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div ref={sentinelRef} className="flex items-center justify-center py-6">
                {loading ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Yüklənir...
                    </span>
                ) : hasMore ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Daha çox
                    </span>
                ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Bitdi
                    </span>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default AuditLogs;