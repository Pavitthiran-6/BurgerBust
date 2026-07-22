import React, { createContext, useContext, useState, useEffect } from 'react';
import { MENU_ITEMS } from '../data/menu';

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  // 1. Restaurant/Branch Status & Settings
  const [restaurantStatus, setRestaurantStatus] = useState("OPEN"); // OPEN | CLOSED | PAUSED
  const [branchStatus, setBranchStatus] = useState("ACTIVE"); // ACTIVE | EMERGENCY_CLOSE | HOLIDAY_MODE
  const [settings, setSettings] = useState({
    restaurantHours: "09:00 - 23:00",
    deliveryRadius: 10, // in kms
    minimumOrder: 15.00,
    deliveryCharges: 2.99,
    maintenanceMode: false,
    holidayMode: false
  });

  // 2. Products & Categories State (Seeded from MENU_ITEMS)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('admin_products');
    if (saved) return JSON.parse(saved);
    return MENU_ITEMS.map(item => ({
      ...item,
      isSpecial: item.popular,
      isSeasonal: false,
      isLimited: item.stockStatus === 'LIMITED_EDITION',
      active: true
    }));
  });

  const [categories, setCategories] = useState([
    { id: 1, name: 'Burger', active: true, sortOrder: 1 },
    { id: 2, name: 'Pizza', active: true, sortOrder: 2 },
    { id: 3, name: 'Pasta', active: true, sortOrder: 3 },
    { id: 4, name: 'Fried Chicken', active: true, sortOrder: 4 },
    { id: 5, name: 'Fries', active: true, sortOrder: 5 },
    { id: 6, name: 'Drinks', active: true, sortOrder: 6 }
  ]);

  // 3. Inventory State
  const [inventory, setInventory] = useState([
    { id: 'i1', name: 'Flame-Grilled Beef Patty', currentStock: 120, lowStockAlert: 30, unit: 'pcs' },
    { id: 'i2', name: 'Fresh Sesame Buns', currentStock: 25, lowStockAlert: 40, unit: 'pcs' }, // Low stock
    { id: 'i3', name: 'Toon Pizza Mozzarella', currentStock: 80, lowStockAlert: 20, unit: 'kg' },
    { id: 'i4', name: 'Crispy Chicken Breast', currentStock: 0, lowStockAlert: 15, unit: 'pcs' }, // Out of stock
    { id: 'i5', name: 'Mystical Soda Syrup', currentStock: 150, lowStockAlert: 25, unit: 'liters' }
  ]);

  const [inventoryHistory, setInventoryHistory] = useState([
    { id: 'h1', date: '2026-07-21 14:30', item: 'Flame-Grilled Beef Patty', change: '+50', type: 'RESTOCK' },
    { id: 'h2', date: '2026-07-21 12:00', item: 'Fresh Sesame Buns', change: '-10', type: 'USAGE' }
  ]);

  // 4. Mock Orders Database
  const [orders, setOrders] = useState([
    {
      id: "BB-9831",
      customerName: "Gwen Stacy",
      items: [{ name: "The Classic Toon", quantity: 2, price: 8.99 }],
      total: 20.97,
      status: "PENDING", // PENDING | PREPARING | PACKED | OUT_OF_DELIVERY | DELIVERED | CANCELLED | REFUNDED
      riderName: "Rider Pikachu",
      timestamp: "2026-07-21 18:30",
      paymentMethod: "OMNITRIX CARD",
      deliveryAddress: "Omnitrix Lab, Tower 4"
    },
    {
      id: "BB-9830",
      customerName: "Dexter Boy",
      items: [{ name: "Cheesy Pal", quantity: 1, price: 4.99 }, { name: "Happy Fries", quantity: 2, price: 2.99 }],
      total: 13.96,
      status: "PREPARING",
      riderName: "Rider Doraemon",
      timestamp: "2026-07-21 18:15",
      paymentMethod: "CASH ON DELIVERY",
      deliveryAddress: "Suburban Lab, Block B"
    },
    {
      id: "BB-9829",
      customerName: "Chester Cheetah",
      items: [{ name: "Quadruple Krabby Tower", quantity: 1, price: 14.99 }],
      total: 17.98,
      status: "DELIVERED",
      riderName: "Rider Sonic",
      timestamp: "2026-07-21 17:10",
      paymentMethod: "CARTOON WALLET",
      deliveryAddress: "Cheetah Plain 45"
    }
  ]);

  // 5. Dealers Database
  const [dealers, setDealers] = useState([
    { id: 'd1', name: 'Uncle Secret Kitchen', location: 'Chinatown Block 3', revenue: 4200.50, commission: 420.05, ordersCount: 142, rating: 4.8, storePaused: false, holidayMode: false },
    { id: 'd2', name: 'Spongebob Grillers', location: 'Bikini Bottom Way', revenue: 9800.00, commission: 980.00, ordersCount: 310, rating: 4.9, storePaused: false, holidayMode: false },
    { id: 'd3', name: 'Dexter Lab Bakeries', location: 'Sector 5 Laboratory', revenue: 1500.20, commission: 150.02, ordersCount: 54, rating: 4.2, storePaused: true, holidayMode: false }
  ]);

  // 6. Customers Database
  const [customers, setCustomers] = useState([
    { id: 'c1', name: 'Gwen Stacy', email: 'gwen@spider.com', phone: '555-0144', ordersCount: 12, points: 280, status: 'ACTIVE', couponsUsed: 3 },
    { id: 'c2', name: 'Dexter Boy', email: 'dexter@lab.com', phone: '555-9000', ordersCount: 45, points: 1420, status: 'ACTIVE', couponsUsed: 8 },
    { id: 'c3', name: 'Chester Cheetah', email: 'chester@cheetos.com', phone: '555-3212', ordersCount: 8, points: 90, status: 'ACTIVE', couponsUsed: 1 },
    { id: 'c4', name: 'Mojo Jojo', email: 'mojo@townsville.org', phone: '555-6666', ordersCount: 0, points: 0, status: 'SUSPENDED', couponsUsed: 0 }
  ]);

  // 7. Delivery Partners
  const [riders, setRiders] = useState([
    { id: 'r1', name: 'Rider Pikachu', phone: '555-1234', activeOrders: 1, completedCount: 88, avgTime: '12 mins', status: 'ACTIVE', rating: 4.9 },
    { id: 'r2', name: 'Rider Doraemon', phone: '555-5678', activeOrders: 1, completedCount: 124, avgTime: '8 mins', status: 'ACTIVE', rating: 4.8 },
    { id: 'r3', name: 'Rider Sonic', phone: '555-9999', activeOrders: 0, completedCount: 412, avgTime: '4 mins', status: 'ACTIVE', rating: 4.9 },
    { id: 'r4', name: 'Rider Shaggy', phone: '555-0000', activeOrders: 0, completedCount: 14, avgTime: '24 mins', status: 'INACTIVE', rating: 3.5 }
  ]);

  // 8. Coupons Management
  const [coupons, setCoupons] = useState([
    { code: 'COMIC50', discount: 50, type: 'PERCENTAGE', minOrder: 20.00, expiry: '2026-08-31', active: true, usageCount: 144 },
    { code: 'HERO20', discount: 20, type: 'PERCENTAGE', minOrder: 15.00, expiry: '2026-09-15', active: true, usageCount: 89 },
    { code: 'FREEKAY', discount: 5.00, type: 'FLAT', minOrder: 10.00, expiry: '2026-07-25', active: false, usageCount: 12 }
  ]);

  // 9. Reward Statistics & Referrals
  const [rewardStats, setRewardStats] = useState({
    pointsIssued: 45200,
    pointsRedeemed: 28400,
    activeReferrals: 112,
    referralBonusPoints: 50
  });

  // 10. Reviews Management
  const [reviews, setReviews] = useState([
    { id: 'rev1', itemName: 'The Classic Toon', customerName: 'Dexter Boy', rating: 5, comment: 'Simply mathematical! The sauce formula is perfectly balanced.', date: '2026-07-21', status: 'VISIBLE' },
    { id: 'rev2', itemName: 'Cheesy Pal', customerName: 'Mojo Jojo', rating: 2, comment: 'Evil Mojo hates cheese that smiles back at him! CURSE YOU BURGERBURST!', date: '2026-07-20', status: 'VISIBLE' },
    { id: 'rev3', itemName: 'Happy Fries', customerName: 'Gwen Stacy', rating: 5, comment: 'Extra crispy and hot on arrival! Piakchu rider was fast.', date: '2026-07-19', status: 'VISIBLE' }
  ]);

  // 11. Broadcast Notifications Log
  const [broadcastLog, setBroadcastLog] = useState([
    { id: 'b1', date: '2026-07-21 10:00', category: 'OFFERS', title: '50% FLASH DEAL', message: 'Use COMIC50 for 50% off all Burgers today!' },
    { id: 'b2', date: '2026-07-20 15:00', category: 'MAINTENANCE', title: 'SCHEDULED BACKEND CLEANUP', message: 'Vault services will be offline for 10 mins tonight.' }
  ]);

  // 12. Admin Profile & Logs
  const [adminProfile, setAdminProfile] = useState({
    name: "Master Chef Nick",
    email: "admin@burgerburst.com",
    role: "HEAD RESTAURANT ADMINISTRATOR",
    joined: "2024-03-10"
  });

  const [activityLogs, setActivityLogs] = useState([
    { id: 'a1', time: '2026-07-21 19:02', action: 'Modified secret sauce price to $1.25' },
    { id: 'a2', time: '2026-07-21 18:30', action: 'Approved Order BB-9831' },
    { id: 'a3', time: '2026-07-21 17:00', action: 'Paused Dexter Lab Bakery Store' }
  ]);

  // Save Products to localStorage
  useEffect(() => {
    localStorage.setItem('admin_products', JSON.stringify(products));
  }, [products]);

  // --- API/Helper Methods Ready for Spring Boot REST Integration ---

  const addProduct = (prod) => {
    setProducts(prev => {
      const newProd = {
        id: `prod-${Date.now()}`,
        name: prod.name,
        category: prod.category || 'Burger',
        price: parseFloat(prod.price) || 0.00,
        rating: 5.0,
        desc: prod.desc || '',
        image: prod.image || '/foods/burger-classic.png',
        tag: prod.tag || 'Standard',
        popular: !!prod.isSpecial,
        stockStatus: prod.isLimited ? 'LIMITED_EDITION' : 'AVAILABLE',
        isSpecial: !!prod.isSpecial,
        isSeasonal: !!prod.isSeasonal,
        isLimited: !!prod.isLimited,
        active: true
      };
      return [...prev, newProd];
    });
    logActivity(`Added new product: ${prod.name}`);
  };

  const updateProduct = (id, updatedFields) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    logActivity(`Updated product ID: ${id}`);
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    logActivity(`Deleted product ID: ${id}`);
  };

  const updateOrderStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    logActivity(`Changed Order ${id} status to ${status}`);
  };

  const addCategory = (name) => {
    setCategories(prev => [...prev, { id: Date.now(), name, active: true, sortOrder: prev.length + 1 }]);
    logActivity(`Added category: ${name}`);
  };

  const updateCategoryStatus = (id, active) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active } : c));
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const updateStock = (id, amount) => {
    setInventory(prev => prev.map(inv => {
      if (inv.id === id) {
        const nextStock = Math.max(0, inv.currentStock + amount);
        setInventoryHistory(history => [
          { id: `h-${Date.now()}`, date: new Date().toISOString().replace('T', ' ').substring(0, 16), item: inv.name, change: amount > 0 ? `+${amount}` : `${amount}`, type: amount > 0 ? 'RESTOCK' : 'USAGE' },
          ...history
        ]);
        return { ...inv, currentStock: nextStock };
      }
      return inv;
    }));
  };

  const toggleDealerStatus = (id) => {
    setDealers(prev => prev.map(d => d.id === id ? { ...d, storePaused: !d.storePaused } : d));
  };

  const toggleDealerHoliday = (id) => {
    setDealers(prev => prev.map(d => d.id === id ? { ...d, holidayMode: !d.holidayMode } : d));
  };

  const addCoupon = (coupon) => {
    setCoupons(prev => [...prev, { ...coupon, active: true, usageCount: 0 }]);
    logActivity(`Added coupon: ${coupon.code}`);
  };

  const toggleCouponStatus = (code) => {
    setCoupons(prev => prev.map(c => c.code === code ? { ...c, active: !c.active } : c));
  };

  const updateReviewStatus = (id, status) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const broadcastNotification = (notif) => {
    setBroadcastLog(prev => [
      { id: `b-${Date.now()}`, date: new Date().toISOString().replace('T', ' ').substring(0, 16), ...notif },
      ...prev
    ]);
    logActivity(`Broadcasted notice: ${notif.title}`);
  };

  const logActivity = (action) => {
    setActivityLogs(prev => [
      { id: `act-${Date.now()}`, time: new Date().toISOString().replace('T', ' ').substring(0, 16), action },
      ...prev
    ]);
  };

  return (
    <AdminContext.Provider value={{
      restaurantStatus, setRestaurantStatus,
      branchStatus, setBranchStatus,
      settings, setSettings,
      products, setProducts,
      categories, setCategories,
      inventory, setInventory,
      inventoryHistory,
      orders, setOrders,
      dealers, setDealers,
      customers, setCustomers,
      riders, setRiders,
      coupons, setCoupons,
      rewardStats, setRewardStats,
      reviews, setReviews,
      broadcastLog,
      adminProfile, setAdminProfile,
      activityLogs,
      addProduct,
      updateProduct,
      deleteProduct,
      updateOrderStatus,
      addCategory,
      updateCategoryStatus,
      deleteCategory,
      updateStock,
      toggleDealerStatus,
      toggleDealerHoliday,
      addCoupon,
      toggleCouponStatus,
      updateReviewStatus,
      broadcastNotification,
      logActivity
    }}>
      {children}
    </AdminContext.Provider>
  );
}
