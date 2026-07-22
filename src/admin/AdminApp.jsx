import React, { useState, useEffect } from 'react';
import { AdminProvider } from './AdminContext';

// Import all subpages
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Dealers from './pages/Dealers';
import Customers from './pages/Customers';
import DeliveryPartners from './pages/DeliveryPartners';
import Inventory from './pages/Inventory';
import Coupons from './pages/Coupons';
import Rewards from './pages/Rewards';
import Notifications from './pages/Notifications';
import Reviews from './pages/Reviews';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

export default function AdminApp() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle path-based routing
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        const subpage = path.replace(/^\/admin\/?/, '').trim();
        setActivePage(subpage || 'dashboard');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Initial check

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigateToPage = (page) => {
    const path = page === 'dashboard' ? '/admin' : `/admin/${page}`;
    window.history.pushState({}, '', path);
    setActivePage(page);
    setSidebarOpen(false);
  };

  // Render correct subpage content
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={navigateToPage} />;
      case 'orders':
        return <Orders />;
      case 'products':
        return <Products />;
      case 'categories':
        return <Categories />;
      case 'dealers':
        return <Dealers />;
      case 'customers':
        return <Customers />;
      case 'delivery':
        return <DeliveryPartners />;
      case 'inventory':
        return <Inventory />;
      case 'coupons':
        return <Coupons />;
      case 'rewards':
        return <Rewards />;
      case 'notifications':
        return <Notifications />;
      case 'reviews':
        return <Reviews />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard setActivePage={navigateToPage} />;
    }
  };

  const SIDEBAR_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'orders', label: 'Orders Queue', icon: 'list_alt' },
    { id: 'products', label: 'Toon Products', icon: 'restaurant_menu' },
    { id: 'categories', label: 'Categories', icon: 'category' },
    { id: 'inventory', label: 'Inventory Stash', icon: 'inventory' },
    { id: 'dealers', label: 'Store Dealers', icon: 'storefront' },
    { id: 'customers', label: 'Hero Customers', icon: 'group' },
    { id: 'delivery', label: 'Delivery Riders', icon: 'moped' },
    { id: 'coupons', label: 'Discount Coupons', icon: 'local_offer' },
    { id: 'rewards', label: 'Rewards System', icon: 'military_tech' },
    { id: 'notifications', label: 'Announcements', icon: 'campaign' },
    { id: 'reviews', label: 'Reviews Moderation', icon: 'rate_review' },
    { id: 'analytics', label: 'Growth Stats', icon: 'monitoring' },
    { id: 'settings', label: 'Global Settings', icon: 'settings' },
    { id: 'profile', label: 'Admin Profile', icon: 'account_circle' }
  ];

  return (
    <AdminProvider>
      <div className="min-h-screen bg-[#FFF8E7] flex text-[#1a1c1c] antialiased selection:bg-[#FFD23F]">
        {sidebarOpen && <button aria-label="Close admin navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-[70] bg-black/50 lg:hidden" />}
        {/* Left Sidebar */}
        <aside className={`w-64 bg-white border-r-4 border-black flex flex-col justify-between shrink-0 h-screen fixed lg:sticky top-0 z-[80] transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div>
            {/* Logo area */}
            <div className="p-6 border-b-4 border-black bg-[#FFD23F] flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-3 border-black rounded-xl flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_0px_#111111]">
                🍔
              </div>
              <div>
                <h1 className="font-display-xl text-lg font-black tracking-tight leading-none uppercase">BURGERBUST</h1>
                <span className="text-[10px] font-black text-[#FF0055] uppercase tracking-wider block mt-0.5">ADMIN PORTAL</span>
              </div>
            </div>

            {/* Sidebar list items */}
            <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateToPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4.5 py-3 border-2 rounded-2xl font-black text-xs uppercase text-left transition-all cursor-pointer ${
                    activePage === item.id
                      ? 'bg-[#FFD23F] border-black shadow-[3px_3px_0px_0px_#111111] translate-x-1'
                      : 'bg-white border-transparent hover:bg-yellow-50/50 hover:border-black/20 text-gray-700'
                  }`}
                >
                  <span className="material-symbols-outlined font-black text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Footer exit link */}
          <div className="p-4 border-t-4 border-black bg-white">
            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="w-full py-3 bg-[#FF0055] text-white border-2 border-black font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 cursor-pointer shadow-[2px_2px_0px_0px_#111111] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
              <span>EXIT TO CUSTOMER SITE</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          {/* Top Bar Header */}
          <header className="h-20 bg-white border-b-4 border-black flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <button aria-label="Open admin navigation" onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 border-2 border-black rounded-xl bg-[#FFD23F] flex items-center justify-center mr-1"><span className="material-symbols-outlined">menu</span></button>
              <span className="material-symbols-outlined text-2xl font-black uppercase text-[#FFD23F]">
                {SIDEBAR_ITEMS.find(s => s.id === activePage)?.icon || 'dashboard'}
              </span>
              <h2 className="font-display-xl text-xl font-black uppercase">
                {SIDEBAR_ITEMS.find(s => s.id === activePage)?.label || 'DASHBOARD'}
              </h2>
            </div>

            {/* Profile widget */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="font-black text-xs block uppercase">Master Chef Nick</span>
                <span className="text-[10px] font-bold text-gray-400 block uppercase">HEAD RESTAURANT ADMINISTRATOR</span>
              </div>
              <div className="w-10 h-10 bg-yellow-300 border-2 border-black rounded-full flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_#111111]">
                CN
              </div>
            </div>
          </header>

          {/* Page contents */}
          <main className="flex-grow p-4 md:p-8 bg-[#FAF3E0] overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
