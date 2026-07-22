import React, { lazy, Suspense, useCallback, useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomeView from './pages/HomeView';
import MenuView from './pages/MenuView';
import CartView from './pages/CartView';
import CheckoutView from './pages/CheckoutView';
import ProfileView from './pages/ProfileView';
import FoodDetailView from './pages/FoodDetailView';
import AddressView from './pages/AddressView';
import PaymentView from './pages/PaymentView';
import FavoritesView from './pages/FavoritesView';
import OffersView from './pages/OffersView';
import RewardsView from './pages/RewardsView';
import HelpView from './pages/HelpView';
import NotificationsView from './pages/NotificationsView';
import LoginView from './pages/LoginView';
import NotFoundView from './pages/NotFoundView';
import StoryView from './pages/StoryView';
import TermsView from './pages/TermsView';
import TrackerView from './pages/TrackerView';
import SearchView from './pages/SearchView';
import CategoriesView from './pages/CategoriesView';
import CartoonLoader from './components/CartoonLoader';
import OrderConfirmation from './components/OrderConfirmation';
import RazorpayLaunchOverlay from './components/RazorpayLaunchOverlay';
import { productService } from './services/productService';
import { categoryService } from './services/categoryService';
import { useRestaurantStatus } from './hooks/useRestaurantStatus';
import { cartService } from './services/cartService';
import { orderService } from './services/orderService';
import { rewardService } from './services/rewardService';
import { notificationService } from './services/notificationService';
import { paymentService } from './services/paymentService';
import { addressService } from './services/addressService';
import { Analytics } from './hooks/useAnalytics';

const AdminApp = lazy(() => import('./admin/AdminApp'));
const ComicPageTransition = lazy(() => import('./components/ComicPageTransition'));
const SPLASH_VISIT_KEY = 'has_visited_burgerburst_v2';
const LEGACY_DEMO_ADDRESS = 'Treehouse #1, Candy Kingdom Road';

function loadSavedAddresses() {
  try {
    const saved = JSON.parse(localStorage.getItem('burger_addresses') || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(address => address?.address !== LEGACY_DEMO_ADDRESS);
  } catch {
    return [];
  }
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-burgerburst-razorpay]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Razorpay Checkout')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.burgerburstRazorpay = 'true';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
    document.body.appendChild(script);
  });
}

function AppContent() {
  const { currentUser, isLoggedIn, logout } = useAuth();

  const getRouteFromPath = () => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (!path || path === 'home') return { page: 'home', itemId: null };
    const [section, itemId] = path.split('/');
    if (section === 'products' && itemId) {
      return { page: 'food-detail', itemId: decodeURIComponent(itemId) };
    }
    return { page: path, itemId: null };
  };

  const initialRoute = getRouteFromPath();

  const profile = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '',
    avatar: null
  } : {
    name: "Hungry Hero",
    email: "hero@burgerburst.com",
    phone: "",
    avatar: null
  };

  // 2. Navigation State
  const [currentPage, setCurrentPageState] = useState(() => initialRoute.page);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuPagination, setMenuPagination] = useState({ page: 0, last: true });
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(() => initialRoute.itemId);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [razorpayOverlayMode, setRazorpayOverlayMode] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [toasts, setToasts] = useState([]);
  const confirmationTimerRef = useRef(null);
  const restaurantStatus = useRestaurantStatus();

  useEffect(() => {
    let active = true;
    Promise.all([
      productService.getProducts({ page: 0, size: 100 }),
      categoryService.getCategories(),
    ])
      .then(([products, categories]) => {
        if (!active) return;
        setMenuItems(products.items);
        setMenuPagination(products.pagination);
        setMenuCategories(categories || []);
        setMenuError(null);
      })
      .catch((error) => {
        if (active) setMenuError(error.message || 'Unable to load the menu');
      })
      .finally(() => {
        if (active) setMenuLoading(false);
      });
    return () => { active = false; };
  }, []);

  const loadMoreProducts = async () => {
    if (menuLoading || menuPagination.last) return;
    setMenuLoading(true);
    try {
      const nextPage = await productService.getProducts({ page: menuPagination.page + 1, size: 100 });
      setMenuItems(previous => [...previous, ...nextPage.items]);
      setMenuPagination(nextPage.pagination);
      setMenuError(null);
    } catch (error) {
      setMenuError(error.message || 'Unable to load more products');
    } finally {
      setMenuLoading(false);
    }
  };

  // Ben 10 Splash loader
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem(SPLASH_VISIT_KEY);
  });

  const finishSplash = useCallback(() => {
    sessionStorage.setItem(SPLASH_VISIT_KEY, 'true');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) return undefined;
    const timer = setTimeout(finishSplash, 10000);
    return () => clearTimeout(timer);
  }, [finishSplash, isLoading]);

  useEffect(() => () => {
    if (confirmationTimerRef.current) clearTimeout(confirmationTimerRef.current);
  }, []);

  // Page transition effect
  const triggerComicTransition = () => {
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 1050);
  };

  // Toast System
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Protected Page Guard & Navigator
  const setCurrentPage = (page, detailItemId = null, skipTransition = false) => {
    const protectedPages = ['favorites', 'checkout', 'rewards', 'profile', 'orders', 'address', 'addresses', 'payment', 'payments', 'tracker'];

    if (page === 'login') {
      setIsLoginOpen(true);
      return;
    }

    if (protectedPages.includes(page) && !isLoggedIn) {
      showToast("Please login to access your Cartoon Vault! ", "info");
      setIsLoginOpen(true);
      return;
    }

    if (page === 'food-detail' && detailItemId) {
      setSelectedItemId(detailItemId);
    } else if (page === 'menu') {
      setSelectedItemId(null);
    }

    if (page !== currentPage && !skipTransition) {
      triggerComicTransition();
    }
    setCurrentPageState(page);
    const productId = detailItemId || selectedItemId;
    const targetPath = page === 'home'
      ? '/'
      : page === 'food-detail' && productId
        ? `/products/${encodeURIComponent(productId)}`
        : `/${page}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo(0, 0);
  };

  const openOrderConfirmation = order => {
    if (confirmationTimerRef.current) clearTimeout(confirmationTimerRef.current);
    setConfirmedOrder(order);
    confirmationTimerRef.current = setTimeout(() => {
      setConfirmedOrder(null);
      setCurrentPage('tracker');
    }, 2600);
  };

  const trackConfirmedOrder = () => {
    if (confirmationTimerRef.current) clearTimeout(confirmationTimerRef.current);
    setConfirmedOrder(null);
    setCurrentPage('tracker');
  };

  // Listen for browser Back/Forward arrows
  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteFromPath();
      if (route.page === 'food-detail') {
        setSelectedItemId(route.itemId);
      } else if (route.page === 'menu') {
        setSelectedItemId(null);
      }
      triggerComicTransition();
      setCurrentPageState(route.page);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 3. Application Data Stores
  const [cart, setCart] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('burger_favorites')) || []);
  const [orders, setOrders] = useState([]);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState(() => JSON.parse(localStorage.getItem('burger_recently_viewed')) || []);
  const [recentSearches, setRecentSearches] = useState(() => JSON.parse(localStorage.getItem('burger_recent_searches')) || []);

  const [notifications, setNotifications] = useState([]);
  const [commerceLoading, setCommerceLoading] = useState(false);
  const [commerceError, setCommerceError] = useState(null);

  const [addresses, setAddresses] = useState(loadSavedAddresses);

  const [paymentMethods, setPaymentMethods] = useState(() => {
    return JSON.parse(localStorage.getItem('burger_payment_methods')) || [
      { id: 'cod', type: 'CASH ON DELIVERY', details: 'Pay when your order arrives', primary: true, icon: 'payments' },
      { id: 'p1', type: 'RAZORPAY', details: 'Card, UPI, wallet or netbanking', primary: false, icon: 'credit_card' }
    ];
  });

  // LocalStorage Sync Effects
  useEffect(() => { localStorage.setItem('burger_is_logged_in', JSON.stringify(isLoggedIn)); }, [isLoggedIn]);
  useEffect(() => { localStorage.setItem('burger_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('burger_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('burger_addresses', JSON.stringify(addresses)); }, [addresses]);
  useEffect(() => { localStorage.setItem('burger_payment_methods', JSON.stringify(paymentMethods)); }, [paymentMethods]);
  useEffect(() => { localStorage.setItem('burger_recently_viewed', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem('burger_recent_searches', JSON.stringify(recentSearches)); }, [recentSearches]);

  const syncCart = (cartData) => {
    setCart(cartData?.items || []);
    setAppliedCoupon(cartData?.coupon || null);
    setCartSummary(cartData?.summary || null);
  };

  const refreshCommerceData = async () => {
    if (!isLoggedIn) return;
    setCommerceLoading(true);
    const results = await Promise.allSettled([
      cartService.getCart(),
      orderService.getOrders(),
      rewardService.getRewards(),
      notificationService.getNotifications(),
      addressService.list(),
    ]);
    const [cartResult, orderResult, rewardResult, notificationResult, addressResult] = results;
    if (cartResult.status === 'fulfilled') syncCart(cartResult.value);
    if (orderResult.status === 'fulfilled') setOrders(orderResult.value.items);
    if (rewardResult.status === 'fulfilled') setRewardPoints(rewardResult.value.balance);
    if (notificationResult.status === 'fulfilled') setNotifications(notificationResult.value.items);
    if (addressResult.status === 'fulfilled') {
      setAddresses(previous => addressResult.value.length > 0 ? addressResult.value : previous);
    }
    const failure = results.find(result => result.status === 'rejected');
    setCommerceError(failure?.reason?.message || null);
    setCommerceLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshCommerceData();
    } else {
      setCart([]);
      setCartSummary(null);
      setAppliedCoupon(null);
      setOrders([]);
      setRewardPoints(0);
      setNotifications([]);
    }
  }, [isLoggedIn, currentUser?.uuid]);

  // Notification actions
  const handleMarkNotificationRead = async (id) => {
    try {
      const updated = await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? updated : n));
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.read).map(n => notificationService.markRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      showToast(error.message, 'error');
    }
    showToast("All notifications marked as read! ️", "info");
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast("Notification deleted.", "info");
  };

  // Profile completion calculation
  const getProfileCompletion = () => {
    let score = 0;
    if (profile.name) score += 20;
    if (profile.email) score += 20;
    if (profile.phone) score += 20;
    if (addresses.length > 0) score += 20;
    if (paymentMethods.length > 0) score += 20;
    return score;
  };

  // Auth Handlers
  const handleLogout = () => {
    logout();
    showToast("Logged out of Cartoon Vault.", "info");
    setCurrentPage('home');
  };

  // Favorites Handler
  const handleToggleFavorite = (itemId) => {
    const index = favorites.indexOf(itemId);
    let newFavs = [...favorites];

    if (index > -1) {
      newFavs.splice(index, 1);
      showToast("Removed from Favorites Vault", "info");
    } else {
      newFavs.push(itemId);
      showToast("Added to Tom & Jerry Favorites Vault! ️", "success");
    }

    setFavorites(newFavs);
  };

  const handleApiAddToCart = async (itemId, _options = {}, quantity = 1) => {
    if (!isLoggedIn) {
      showToast('Please login to use your saved cart.', 'info');
      setIsLoginOpen(true);
      return;
    }
    const legacyNames = {
      'burger-classic': 'The Classic Toon',
      'pizza-pepperoni': 'Happy Pepperoni Pizza',
      'chicken-popcorn': 'Boom Boom Popcorn',
      'fries-happy': 'Happy Fries',
      'drink-sunny': 'Sunny Shake',
      'waffle-sundae': 'Strawberry Waffle Sundae',
      'combo-adventurer': 'Adventurer Combo',
      'combo-titans-party': 'Titans Party Combo',
    };
    let item = menuItems.find(value => value.id === itemId)
      || menuItems.find(value => value.name === legacyNames[itemId]);
    if (!item) {
      try {
        item = await productService.getProduct(itemId);
      } catch (error) {
        showToast(error.message || 'Unable to load that product.', 'error');
        return;
      }
    }
    try {
      syncCart(await cartService.addItem(item.id, quantity));
      Analytics.addedToCart(item.id, item.name, item.price);
      showToast(`Added ${item.name} to Cart!`, 'success');
      if (!recentlyViewed.includes(item.id)) setRecentlyViewed(prev => [item.id, ...prev.slice(0, 5)]);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleApiUpdateQty = async (itemId, delta) => {
    const item = cart.find(value => value.itemId === itemId || value.cartUniqueId === itemId);
    if (!item) return;
    try {
      if (item.quantity + delta <= 0) syncCart(await cartService.removeItem(item.itemId));
      else syncCart(await cartService.updateItem(item.itemId, item.quantity + delta));
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleApiRemoveItem = async (itemId) => {
    const removed = cart.find(value => value.itemId === itemId || value.cartUniqueId === itemId);
    try {
      syncCart(await cartService.removeItem(itemId));
      if (removed?.id) Analytics.removedFromCart(removed.id, removed.name);
      showToast('Removed item from cart.', 'info');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleApiClearCart = async () => {
    try {
      await cartService.clear();
      syncCart(await cartService.getCart());
      showToast('Cleared all items from cart.', 'info');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleApiCoupon = async (coupon) => {
    try {
      const updatedCart = coupon ? await cartService.applyCoupon(typeof coupon === 'string' ? coupon : coupon.code)
        : await cartService.removeCoupon();
      syncCart(updatedCart);
      if (coupon) Analytics.couponApplied(
        typeof coupon === 'string' ? coupon : coupon.code,
        updatedCart.summary?.couponDiscount,
      );
      showToast(coupon ? 'Coupon applied.' : 'Coupon removed.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleApiAutoCoupon = () => handleApiCoupon('WELCOME20');

  const handleAddAddress = async address => {
    try {
      const saved = await addressService.create({
        ...address,
        default: !addresses.some(item => item.default),
      });
      setAddresses(previous => [
        ...previous.map(item => saved.default ? { ...item, default: false } : item),
        saved,
      ]);
      showToast(`Saved delivery address: ${saved.title}!`, 'success');
      return saved;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const handleSetDefaultAddress = async addressId => {
    try {
      if (typeof addressId === 'string' && addressId.includes('-')) {
        const selected = await addressService.setDefault(addressId);
        setAddresses(previous => previous.map(item => ({
          ...item,
          default: item.id === selected.id,
        })));
      } else {
        setAddresses(previous => previous.map(item => ({ ...item, default: item.id === addressId })));
      }
      showToast('Default delivery address updated.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteAddress = async addressId => {
    try {
      if (typeof addressId === 'string' && addressId.includes('-')) {
        await addressService.delete(addressId);
        const refreshed = await addressService.list();
        setAddresses(refreshed);
      } else {
        setAddresses(previous => previous.filter(item => item.id !== addressId));
      }
      showToast('Delivery address removed.', 'info');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleApiPlaceOrder = async (deliveryAddress, selectedPayment, rewardPointsToUse = 0) => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);
    const razorpay = !selectedPayment?.type?.toUpperCase().includes('CASH');
    if (razorpay) setRazorpayOverlayMode('opening');
    const address = {
      recipientName: deliveryAddress?.recipientName || profile.name || 'BurgerBurst Customer',
      phone: deliveryAddress?.phone || profile.phone,
      addressLine1: deliveryAddress?.addressLine1 || deliveryAddress?.address,
      addressLine2: deliveryAddress?.addressLine2 || null,
      city: deliveryAddress?.city,
      state: deliveryAddress?.state,
      postalCode: deliveryAddress?.postalCode || deliveryAddress?.pincode,
      deliveryInstructions: deliveryAddress?.deliveryInstructions || deliveryAddress?.deliveryNotes || null,
    };
    let pendingOrder = null;
    let checkoutOpened = false;
    let paymentCompleted = false;

    const cancelPendingOrder = async reason => {
      if (!pendingOrder || paymentCompleted) return;
      const orderId = pendingOrder.id;
      pendingOrder = null;
      try {
        await orderService.cancelOrder(orderId, reason);
      } catch {
        // A concurrent verified-payment callback may have completed the order first.
      }
    };

    const waitForConfirmedOrder = async orderId => {
      let lastError = null;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const latest = await orderService.getOrder(orderId);
          if (latest.statusCode === 'CONFIRMED') return latest;
          if (latest.statusCode === 'CANCELLED') throw new Error('The pending order was cancelled');
        } catch (error) {
          lastError = error;
        }
        if (attempt < 4) await new Promise(resolve => setTimeout(resolve, 1000));
      }
      throw lastError || new Error('Backend payment confirmation is still pending');
    };

    try {
      Analytics.checkoutStarted(cartSummary.total, cartSummary.itemCount);
      const checkoutScript = razorpay ? loadRazorpayCheckout() : null;
      const order = await orderService.createOrder(address, razorpay ? 'RAZORPAY' : 'COD', rewardPointsToUse);
      if (!razorpay) {
        Analytics.orderPlaced(order.id, order.total);
        setOrders(previous => [order, ...previous]);
        syncCart(await cartService.getCart());
        showToast(`Order ${order.orderNumber} placed successfully!`, 'success');
        await refreshCommerceData();
        openOrderConfirmation(order);
        setIsPlacingOrder(false);
        return;
      }
      pendingOrder = order;
      const idempotencyKey = window.crypto?.randomUUID?.() || `${order.id}-${Date.now()}`;
      const [payment] = await Promise.all([
        paymentService.createOrder(order.id, idempotencyKey),
        checkoutScript,
      ]);
      const checkout = new window.Razorpay({
        key: payment.keyId,
        amount: payment.amountInSubunits,
        currency: payment.currency,
        name: 'BurgerBurst',
        description: `Order ${order.orderNumber}`,
        order_id: payment.razorpayOrderId,
        prefill: { name: address.recipientName, email: profile.email, contact: address.phone },
        notes: { burgerburst_order: order.orderNumber },
        theme: { color: '#FF0055', backdrop_color: '#1a1c1c' },
        retry: { enabled: true },
        config: {
          display: {
            sequence: ['upi', 'netbanking', 'wallet', 'card'],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async response => {
          paymentCompleted = true;
          setRazorpayOverlayMode('verifying');
          try {
            let verificationError = null;
            try {
              await paymentService.verify(response);
            } catch (error) {
              verificationError = error;
            }
            const confirmed = await waitForConfirmedOrder(order.id).catch(error => {
              throw verificationError || error;
            });
            pendingOrder = null;
            Analytics.orderPlaced(confirmed.id, confirmed.total);
            setOrders(previous => [confirmed, ...previous.filter(item => item.id !== confirmed.id)]);
            showToast(`Payment verified for ${confirmed.orderNumber}!`, 'success');
            setCurrentPage('tracker', null, true);
            syncCart(await cartService.getCart());
            await refreshCommerceData();
          } catch (error) {
            showToast(`${error.message}. Do not pay again; check Orders after a moment.`, 'error');
          } finally {
            setRazorpayOverlayMode(null);
            setIsPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: async () => {
            setRazorpayOverlayMode(null);
            try {
              if (!paymentCompleted) {
                await cancelPendingOrder('Payment window closed before payment');
                syncCart(await cartService.getCart());
                showToast('Payment cancelled. Your cart has been kept safely.', 'info');
              }
            } finally {
              setIsPlacingOrder(false);
            }
          },
        },
      });
      checkout.on('payment.failed', response => {
        showToast(response?.error?.description || 'Payment failed. Please try another method.', 'error');
      });
      checkout.open();
      checkoutOpened = true;
      setRazorpayOverlayMode(null);
    } catch (error) {
      if (razorpay && !checkoutOpened) {
        await cancelPendingOrder('Could not open the payment window');
      }
      setRazorpayOverlayMode(null);
      setIsPlacingOrder(false);
      showToast(error.message, 'error');
    }
  };

  const handleApiCancelOrder = async (orderId) => {
    try {
      const updated = await orderService.cancelOrder(orderId, 'Cancelled by customer');
      setOrders(previous => previous.map(order => order.id === orderId ? updated : order));
      showToast(`Order ${updated.orderNumber} cancelled.`, 'info');
      await refreshCommerceData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleApiReorder = async (orderOrItems) => {
    const orderId = typeof orderOrItems === 'string' ? orderOrItems : orderOrItems?.id;
    if (!orderId) return;
    try {
      syncCart(await orderService.reorder(orderId));
      showToast('Available items were added to your cart.', 'success');
      setCurrentPage('cart');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    Analytics.pageViewed(currentPage);
    if (currentPage === 'food-detail' && selectedItemId) {
      const product = menuItems.find(item => item.id === selectedItemId);
      Analytics.productViewed(selectedItemId, product?.name);
    }
  }, [currentPage, selectedItemId, menuItems]);

  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const isAuthorizedAdmin = isAdminRoute && isLoggedIn && currentUser?.role === 'ROLE_ADMIN';

  useEffect(() => {
    // 1. Guard Admin Routes
    if (isAdminRoute) {
      if (!isLoggedIn) {
        showToast("Please login as Admin to access the Command Deck!", "error");
        setIsLoginOpen(true);
        window.history.pushState(null, '', '/');
        setCurrentPageState('home');
        window.dispatchEvent(new Event('popstate'));
      } else if (currentUser?.role !== 'ROLE_ADMIN') {
        showToast("Unauthorized access! Customers are not allowed on the Admin Deck.", "error");
        window.history.pushState(null, '', '/');
        setCurrentPageState('home');
        window.dispatchEvent(new Event('popstate'));
      }
    }
  }, [isAdminRoute, isLoggedIn, currentUser]);

  // 2. Guard Protected Customer Pages
  useEffect(() => {
    const protectedPages = ['favorites', 'checkout', 'rewards', 'profile', 'orders', 'address', 'addresses', 'payment', 'payments', 'tracker'];
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
      setCurrentPage('home');
      setIsLoginOpen(true);
    }
  }, [currentPage, isLoggedIn]);

  if (isAuthorizedAdmin) {
    return <Suspense fallback={<CartoonLoader isVisible />}><AdminApp /></Suspense>;
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col font-sans text-on-surface antialiased selection:bg-secondary selection:text-on-secondary">
      {/* 1. Ben 10 Omnitrix Animated Splash Screen */}
      {isLoading && <CartoonLoader isVisible={isLoading} onFinish={finishSplash} />}

      {/* 2. Page Switcher Comic Book Reveal Animation */}
      {isNavigating && <Suspense fallback={null}><ComicPageTransition /></Suspense>}

      {/* 3. Global Toast System */}
      <OrderConfirmation order={confirmedOrder} onTrack={trackConfirmedOrder} />
      <RazorpayLaunchOverlay mode={razorpayOverlayMode} />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto px-5 py-3 border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-xs uppercase rounded-2xl ${
              t.type === 'success' ? 'bg-[#34C759] text-white' :
              t.type === 'error' ? 'bg-red-500 text-white' :
              t.type === 'warning' ? 'bg-[#FFD23F] text-[#1a1c1c]' :
              'bg-[#00F0FF] text-[#1a1c1c]'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* 4. Top Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        cartQty={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onSearchClick={() => setCurrentPage('search')}
        isLoggedIn={isLoggedIn}
        user={profile}
        unreadNotificationsCount={unreadNotificationsCount}
        onLogout={handleLogout}
        restaurantStatus={restaurantStatus}
      />

      {/* 5. Main Route View */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
        {commerceError && isLoggedIn && (
          <div className="mb-4 rounded-xl border-2 border-red-700 bg-red-50 p-3 text-xs font-black text-red-700">
            {commerceError}
          </div>
        )}
        {(() => {
          switch (currentPage) {
            case 'home':
              return (
                <HomeView
                  menuItems={menuItems}
                  setCurrentPage={setCurrentPage}
                  setActiveCategory={setActiveCategory}
                  onNavigateMenu={() => setCurrentPage('menu')}
                  onAddDirectItem={(itemId) => handleApiAddToCart(itemId, {}, 1)}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                  onViewDetail={(itemId) => {
                    const legacyDetail = itemId === 'burger-classic'
                      ? menuItems.find(item => item.name === 'The Classic Toon')?.id
                      : itemId;
                    setCurrentPage('food-detail', legacyDetail || itemId);
                  }}
                  isLoggedIn={isLoggedIn}
                  user={profile}
                  rewardPoints={rewardPoints}
                />
              );

            case 'menu':
              return (
                <MenuView
                  menuItems={menuItems}
                  categories={menuCategories}
                  loading={menuLoading}
                  error={menuError}
                  hasMore={!menuPagination.last}
                  onLoadMore={loadMoreProducts}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleApiAddToCart}
                  selectedItemId={selectedItemId}
                  setSelectedItemId={setSelectedItemId}
                  onViewDetail={(itemId) => {
                    setCurrentPage('food-detail', itemId);
                  }}
                />
              );

            case 'cart':
              return (
                <CartView
                  cart={cart}
                  summary={cartSummary}
                  loading={commerceLoading}
                  appliedCoupon={appliedCoupon}
                  onRemoveCoupon={() => handleApiCoupon(null)}
                  onApplyCoupon={handleApiCoupon}
                  onAutoApplyBestCoupon={handleApiAutoCoupon}
                  onUpdateQuantity={(id, nextQuantity) => {
                    const target = cart.find(item => item.itemId === id || item.cartUniqueId === id);
                    if (target) handleApiUpdateQty(target.itemId, nextQuantity - target.quantity);
                  }}
                  onRemoveFromCart={(idOrUniqueId) => {
                    const target = cart.find(c => c.cartUniqueId === idOrUniqueId || c.id === idOrUniqueId);
                    if (target) handleApiRemoveItem(target.itemId);
                  }}
                  onClearCart={handleApiClearCart}
                  setCurrentPage={setCurrentPage}
                  showToast={showToast}
                />
              );

            case 'checkout':
              return (
                <CheckoutView
                  cart={cart}
                  summary={cartSummary}
                  appliedCoupon={appliedCoupon}
                  addresses={addresses}
                  paymentMethods={paymentMethods}
                  rewardPoints={rewardPoints}
                  isPlacingOrder={isPlacingOrder}
                  onPlaceOrder={handleApiPlaceOrder}
                  onAddAddress={handleAddAddress}
                  profile={profile}
                  setCurrentPage={setCurrentPage}
                  showToast={showToast}
                />
              );

            case 'search':
              return (
                <SearchView
                  menuItems={menuItems}
                  categories={menuCategories}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  recentSearches={recentSearches}
                  setRecentSearches={setRecentSearches}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleApiAddToCart}
                  onViewDetail={(itemId) => {
                    setCurrentPage('food-detail', itemId);
                  }}
                />
              );

            case 'categories':
              return (
                <CategoriesView
                  categories={menuCategories}
                  menuItems={menuItems}
                  loading={menuLoading}
                  error={menuError}
                  setActiveCategory={setActiveCategory}
                  setCurrentPage={setCurrentPage}
                />
              );

            case 'address':
            case 'addresses':
              return (
                <AddressView
                  addresses={addresses}
                  onAddAddress={handleAddAddress}
                  onSetDefaultAddress={handleSetDefaultAddress}
                  onDeleteAddress={handleDeleteAddress}
                  profile={profile}
                />
              );

            case 'payment':
            case 'payments':
              return (
                <PaymentView
                  paymentMethods={paymentMethods}
                  setPaymentMethods={setPaymentMethods}
                  showToast={showToast}
                />
              );

            case 'favorites':
              return (
                <FavoritesView
                  favorites={favorites}
                  menuItems={menuItems}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleApiAddToCart}
                  onViewDetail={(itemId) => {
                    setCurrentPage('food-detail', itemId);
                  }}
                  onBrowseMenu={() => setCurrentPage('menu')}
                />
              );

            case 'profile':
            case 'orders':
              return (
                <ProfileView
                  profile={profile}
                  completionPercentage={getProfileCompletion()}
                  orders={orders}
                  onCancelOrder={handleApiCancelOrder}
                  onReorder={handleApiReorder}
                  favorites={favorites}
                  addresses={addresses}
                  paymentMethods={paymentMethods}
                  rewardPoints={rewardPoints}
                  notifications={notifications}
                  onLogout={handleLogout}
                  showToast={showToast}
                  setCurrentPage={setCurrentPage}
                  initialTab={currentPage === 'orders' ? 'ORDERS' : 'PROFILE'}
                />
              );

            case 'food-detail':
              return (
                <FoodDetailView
                  menuItems={menuItems}
                  loading={menuLoading}
                  error={menuError}
                  itemId={selectedItemId}
                  onAddToCart={handleApiAddToCart}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  showToast={showToast}
                  onViewDetail={(itemId) => setCurrentPage('food-detail', itemId)}
                />
              );

            case 'offers':
              return (
                <OffersView
                  onApplyCoupon={handleApiCoupon}
                  showToast={showToast}
                  setCurrentPage={setCurrentPage}
                />
              );

            case 'rewards':
              return (
                <RewardsView
                  rewardPoints={rewardPoints}
                  showToast={showToast}
                  setCurrentPage={setCurrentPage}
                />
              );

            case 'help':
              return <HelpView showToast={showToast} />;

            case 'notifications':
              return (
                <NotificationsView
                  notifications={notifications}
                  setNotifications={setNotifications}
                  onMarkRead={handleMarkNotificationRead}
                  onMarkAllRead={handleMarkAllNotificationsRead}
                  onDeleteNotif={handleDeleteNotification}
                />
              );

            case 'story':
              return (
                <StoryView
                  onBrowseMenu={() => setCurrentPage('menu')}
                  setCurrentPage={setCurrentPage}
                />
              );

            case 'terms':
              return <TermsView />;

            case 'tracker':
              return (
                <TrackerView
                  currentOrder={orders[0] || null}
                  onCancelOrder={handleApiCancelOrder}
                  showToast={showToast}
                  setCurrentPage={setCurrentPage}
                />
              );

            default:
              return <NotFoundView setCurrentPage={setCurrentPage} />;
          }
        })()}
      </main>

      {/* 6. Poopdeck Pappy Sailor Login Slide-Over Drawer */}
      {isLoginOpen && (
        <LoginView
          onClose={() => setIsLoginOpen(false)}
          showToast={showToast}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/*  Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t-4 border-[#1a1c1c] shadow-[0px_-4px_0px_0px_#111111] flex items-center justify-around py-2 px-1">
        {[
          { page: 'home', icon: '', label: 'HOME' },
          { page: 'menu', icon: '', label: 'MENU' },
          { page: 'search', icon: '', label: 'SEARCH' },
          { page: 'rewards', icon: '', label: 'REWARDS' },
          { page: isLoggedIn ? 'profile' : 'login', icon: '', label: 'PROFILE' },
        ].map(item => (
          <button
            key={item.page}
            type="button"
            onClick={() => setCurrentPage(item.page)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
              currentPage === item.page ? 'bg-[#FFD23F] text-[#1a1c1c]' : 'text-gray-600'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 7. Bottom Cartoon Footer */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* Page Wipe Transition */}
      <ComicPageTransition isTransitioning={isNavigating} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
