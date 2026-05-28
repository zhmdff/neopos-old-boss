import React, { useState, useEffect, useMemo } from 'react';
import {
  FiFileText,
  FiLayers,
  FiMenu,
  FiShield,
  FiChevronRight,
  FiX,
  FiTrendingUp,
  FiGrid,
  FiBriefcase,
  FiArchive,
  FiActivity,
  FiUsers,
} from 'react-icons/fi';
import DebugSyncButton from '../components/DebugSyncButton';
import { useNavigate, useLocation } from 'react-router-dom';

const BRAND = '#38bdf8';
const LOGO_SRC = '/favicon.png';

/** Sidebar fonu — əvvəlki slate-950 əvəzinə bir az açıq göy-boz */
const SIDEBAR_BG =
  'bg-gradient-to-b from-[#2a3f5c] via-[#334d6e] to-[#2d4563]';

/** Seçilmiş bölmə — açıq göy (boz deyil) */
const SIDEBAR_ACTIVE =
  'bg-sky-400/45 text-white shadow-sm ring-1 ring-sky-300/55';
const SIDEBAR_ACTIVE_SUB =
  'bg-sky-400/40 text-white ring-1 ring-sky-300/50';

const SubMenuItem = ({ onClick, label, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-lg px-2.5 py-2.5 text-left text-[13px] font-semibold leading-snug transition-colors min-h-[44px] lg:min-h-0 ${
      active
        ? SIDEBAR_ACTIVE_SUB
        : 'text-slate-200/80 hover:bg-sky-400/20 hover:text-white'
    }`}
  >
    {label}
  </button>
);

const Sidebar = ({ isOpen, toggleSidebar, expandSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const allMenuItems = useMemo(
    () => [
    { title: 'Dashboard', icon: <FiActivity />, path: '/boss/dashboard' },
    { title: 'Çeklər', icon: <FiFileText />, path: '/boss/checks' },
    {
      title: 'Hesabatlar',
      icon: <FiTrendingUp />,
      hasSub: true,
      subPaths: [
        '/boss/reports',
        '/boss/reports/tables',
        '/boss/reports/waiters',
        '/boss/reports/products',
        '/boss/reports/deletions',
        '/boss/shifts',
        '/boss/shift-expenses',
        '/boss/audit-logs',
      ],
    },
    {
      title: 'Əsas',
      icon: <FiLayers />,
      hasSub: true,
      subPaths: [
        '/boss/table-types',
        '/boss/workshops',
        '/boss/integrations',
        '/boss/receipt-design',
        '/boss/kitchen-printer-design',
        '/boss/payment-methods',
      ],
    },
    {
      title: 'Menyu',
      icon: <FiMenu />,
      hasSub: true,
      subPaths: [
        '/boss/products',
        '/boss/product-sets',
        '/boss/business-lunch',
        '/boss/products-sort',
        '/boss/categories',
      ],
    },
    {
      title: 'Anbar',
      icon: <FiArchive />,
      hasSub: true,
      subPaths: ['/boss/stock-history', '/boss/purchases', '/boss/warehouses', '/boss/suppliers'],
    },
    {
      title: 'QR Menyu',
      icon: <FiGrid />,
      hasSub: true,
      subPaths: ['/boss/qr-settings', '/boss/qr-category-sort', '/boss/qr-product-sort'],
    },
    { title: 'Müştərilər', icon: <FiUsers />, path: '/boss/customers-loyalty' },
    {
      title: 'Şirkət',
      icon: <FiBriefcase />,
      hasSub: true,
      subPaths: ['/boss/company-settings'],
    },
    {
      title: 'İcazə',
      icon: <FiShield />,
      hasSub: true,
      subPaths: ['/boss/users', '/boss/roles'],
    },
    ],
    []
  );

  const menuItems = allMenuItems;

  const isLg = () =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) toggleSidebar();
  };

  const checkActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.subPaths && item.subPaths.some((p) => location.pathname.startsWith(p))) return true;
    return false;
  };

  const onPrimaryItemClick = (item) => {
    if (item.path) {
      handleNavigate(item.path);
    }
    if (item.hasSub) {
      if (isLg() && !isOpen && expandSidebar) {
        expandSidebar();
        setOpenSubMenu(item.title);
        return;
      }
      setOpenSubMenu((prev) => (prev === item.title ? null : item.title));
    }
  };

  const subBlocks = {
    Hesabatlar: (
      <>
        <SubMenuItem
          onClick={() => handleNavigate('/boss/reports')}
          label="Maliyyə analizi"
          active={location.pathname === '/boss/reports'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/reports/tables')}
          label="Masalara görə"
          active={location.pathname === '/boss/reports/tables'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/reports/waiters')}
          label="Ofisiantlara görə"
          active={location.pathname === '/boss/reports/waiters'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/reports/products')}
          label="Məhsullara görə"
          active={location.pathname === '/boss/reports/products'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/reports/deletions')}
          label="Silinmələr"
          active={location.pathname === '/boss/reports/deletions'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/shifts')}
          label="Növbə hesabatı"
          active={location.pathname === '/boss/shifts'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/shift-expenses')}
          label="Daxili xərclər"
          active={location.pathname === '/boss/shift-expenses'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/audit-logs')}
          label="Hərəkət tarixçəsi"
          active={location.pathname === '/boss/audit-logs'}
        />
      </>
    ),
    Əsas: (
      <>
        <SubMenuItem
          onClick={() => handleNavigate('/boss/table-types')}
          label="Masa tipləri"
          active={location.pathname === '/boss/table-types'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/workshops')}
          label="Şöbə"
          active={location.pathname === '/boss/workshops'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/integrations')}
          label="İnteqrasiyalar"
          active={location.pathname === '/boss/integrations'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/receipt-design')}
          label="Kassa printer"
          active={location.pathname === '/boss/receipt-design'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/kitchen-printer-design')}
          label="Mətbəx printer"
          active={location.pathname === '/boss/kitchen-printer-design'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/payment-methods')}
          label="Ödəniş üsulları"
          active={location.pathname === '/boss/payment-methods'}
        />
      </>
    ),
    Menyu: (
      <>
        <SubMenuItem
          onClick={() => handleNavigate('/boss/products')}
          label="Məhsullar"
          active={location.pathname === '/boss/products'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/business-lunch')}
          label="Business lunch"
          active={location.pathname === '/boss/business-lunch'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/product-sets')}
          label="Tex / Karta"
          active={location.pathname === '/boss/product-sets'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/products-sort')}
          label="Məhsul sıralama"
          active={location.pathname === '/boss/products-sort'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/categories')}
          label="Kateqoriyalar"
          active={location.pathname === '/boss/categories'}
        />
      </>
    ),
    Anbar: (
      <>
        <SubMenuItem
          onClick={() => handleNavigate('/boss/stock-history')}
          label="Məhsul stok"
          active={location.pathname === '/boss/stock-history'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/purchases')}
          label="Tədarük"
          active={location.pathname === '/boss/purchases'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/warehouses')}
          label="Anbarlar"
          active={location.pathname === '/boss/warehouses'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/suppliers')}
          label="Tədarükçülər"
          active={location.pathname === '/boss/suppliers'}
        />
      </>
    ),
    'QR Menyu': (
      <>
        <SubMenuItem
          onClick={() => handleNavigate('/boss/qr-settings')}
          label="Ayarlar"
          active={location.pathname === '/boss/qr-settings'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/qr-category-sort')}
          label="Kateqoriya sıralama"
          active={location.pathname === '/boss/qr-category-sort'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/qr-product-sort')}
          label="Məhsul sıralama"
          active={location.pathname === '/boss/qr-product-sort'}
        />
      </>
    ),
    Şirkət: (
      <SubMenuItem
        onClick={() => handleNavigate('/boss/company-settings')}
        label="Şirkət ayarları"
        active={location.pathname === '/boss/company-settings'}
      />
    ),
    İcazə: (
      <>
        <SubMenuItem
          onClick={() => handleNavigate('/boss/users')}
          label="İstifadəçilər"
          active={location.pathname === '/boss/users'}
        />
        <SubMenuItem
          onClick={() => handleNavigate('/boss/roles')}
          label="Vəzifələr"
          active={location.pathname === '/boss/roles'}
        />
      </>
    ),
  };

  return (
    <>
      <button
        type="button"
        aria-label="Menyunu bağla"
        className={`fixed inset-0 z-[90] bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={[
          'flex h-screen max-h-[100dvh] shrink-0 flex-col overflow-hidden border-r border-white/10',
          `${SIDEBAR_BG} text-slate-300 shadow-[1px_0_0_0_rgba(255,255,255,0.08)]`,
          'fixed inset-y-0 left-0 z-[100] transition-[transform,width] duration-200 ease-out lg:static lg:z-0',
          isOpen
            ? 'w-[min(20rem,calc(100vw-2.5rem))] translate-x-0 lg:w-64'
            : '-translate-x-full w-[min(20rem,calc(100vw-2.5rem))] lg:translate-x-0 lg:w-[4.5rem]',
        ].join(' ')}
      >
        <div
          className="flex h-16 flex-none items-center justify-between gap-2 border-b border-white/10 px-3 sm:px-4"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
        >
          <div className={`flex min-w-0 items-center gap-2.5 ${isOpen ? '' : 'lg:mx-auto lg:justify-center'}`}>
            <img
              src={LOGO_SRC}
              alt="NeoPos"
              className="h-9 w-9 shrink-0 object-contain object-center"
            />
            {isOpen ? (
              <span className="truncate text-base font-bold tracking-tight text-white">NeoPos</span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-xl p-2.5 text-white/90 transition hover:bg-white/10 lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Bağla"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="boss-sidebar-scroll neo-scroll flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2.5 pb-3 pt-3 sm:px-3">
          {menuItems.map((item) => {
            const active = checkActive(item);
            const isSubOpen = openSubMenu === item.title || active;

            return (
              <div key={item.title} className="min-w-0">
                <button
                  type="button"
                  title={!isOpen ? item.title : undefined}
                  onClick={() => onPrimaryItemClick(item)}
                  className={[
                    'flex w-full min-h-[44px] items-center gap-3 rounded-xl py-2.5 text-left transition-colors touch-manipulation',
                    isOpen ? 'px-3' : 'px-3 lg:justify-center lg:px-0',
                    active
                      ? SIDEBAR_ACTIVE
                      : 'hover:bg-sky-400/20 hover:text-white',
                  ].join(' ')}
                >
                  <span
                    className={`flex shrink-0 text-[1.25rem] leading-none ${
                      active ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {isOpen ? (
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-tight">
                      {item.title}
                    </span>
                  ) : null}
                  {isOpen && item.hasSub ? (
                    <FiChevronRight
                      className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                        isSubOpen ? 'rotate-90' : ''
                      }`}
                      size={16}
                      aria-hidden
                    />
                  ) : null}
                </button>

                {isOpen && item.hasSub && isSubOpen ? (
                  <div className="mt-1 space-y-0.5 border-l-2 border-sky-400/60 py-1 pl-3 ml-1 mb-2">
                    {subBlocks[item.title]}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div
          className="flex-none border-t border-white/10 bg-black/10 p-3 space-y-3"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="px-1 flex justify-end">
             <DebugSyncButton />
          </div>

          <div
            className={`flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/10 p-2.5 ${
              isOpen ? '' : 'lg:justify-center lg:p-2'
            }`}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm"
              style={{ backgroundColor: BRAND }}
            >
              {user?.fullName?.charAt(0) || 'N'}
            </div>
            {isOpen ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold uppercase tracking-wide text-white">
                  {user?.fullName || 'Admin'}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {user?.companyName || 'NeoPos'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <style>{`
        .boss-sidebar-scroll::-webkit-scrollbar { width: 5px; }
        .boss-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .boss-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.25);
          border-radius: 999px;
        }
        .boss-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.45);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
