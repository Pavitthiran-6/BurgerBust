import React, { useState, useEffect } from 'react';
import FoodCard from '../components/FoodCard';

export default function MenuView({
  menuItems = [],
  categories: categoryData = [],
  loading = false,
  error = null,
  hasMore = false,
  onLoadMore,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  favorites,
  onToggleFavorite,
  onAddToCart,
  selectedItemId,
  setSelectedItemId,
  onViewDetail
}) {
  const [customizingItem, setCustomizingItem] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    if (recentlyViewed.length === 0 && menuItems.length > 0) {
      setRecentlyViewed(menuItems.slice(0, 3));
    }
  }, [menuItems, recentlyViewed.length]);

  useEffect(() => {
    if (selectedItemId && onViewDetail) {
      onViewDetail(selectedItemId);
    }
  }, [selectedItemId]);

  const handleOpenModal = (item) => {
    setCustomizingItem(item);
    setModalQty(1);
    setSelectedOptions({});

    setRecentlyViewed(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      return [item, ...filtered].slice(0, 4);
    });
  };

  const handleCloseModal = () => {
    setCustomizingItem(null);
  };

  const handleOptionCheckboxChange = (optionName, price) => {
    setSelectedOptions(prev => {
      const updated = { ...prev };
      if (updated[optionName]) {
        delete updated[optionName];
      } else {
        updated[optionName] = price;
      }
      return updated;
    });
  };

  const handleSubmitCustomization = (e) => {
    e.preventDefault();
    if (!customizingItem) return;
    onAddToCart(customizingItem.id, selectedOptions, modalQty);
    handleCloseModal();
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryIcons = {
    Burger: 'lunch_dining', Pizza: 'local_pizza', Pasta: 'ramen_dining',
    'Fried Chicken': 'kebab_dining', Fries: 'fastfood', Drinks: 'local_drink', Combos: 'restaurant_menu',
    Sides: 'tapas', Wraps: 'bakery_dining', Desserts: 'icecream', Salads: 'nutrition',
  };
  const categories = [
    { name: 'All', icon: 'grid_view' },
    ...categoryData.map(category => ({ name: category.name, icon: categoryIcons[category.name] || 'category' })),
  ];

  return (
    <main className="flex-1 bg-background p-4 md:p-8 max-w-7xl mx-auto w-full pb-32">
      {/* Title & Search bar next to it */}
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end border-b-4 border-on-secondary-fixed pb-6">
        <div>
          <h1 className="font-headline-xl text-4xl md:text-5xl text-on-surface drop-shadow-[3px_3px_0px_rgba(28,27,27,1)] font-black uppercase">
            Explore Menu
          </h1>
          <p className="text-xs font-bold text-gray-500 mt-1">Savor the cartoon flavor dimensions!</p>
        </div>
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-black">
            search
          </span>
          <input
            id="menu-search-input"
            type="text"
            placeholder="Search burgers, pizzas, shakes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-3 border-[#1a1c1c] rounded-2xl font-bold text-xs shadow-[3px_3px_0px_0px_#111111] focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
          />
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl border-4 border-[#1a1c1c] bg-red-100 p-5 text-center font-black text-red-700">
          {error}
        </div>
      )}

      {loading && menuItems.length === 0 && (
        <div className="mb-8 rounded-2xl border-4 border-[#1a1c1c] bg-white p-10 text-center font-black uppercase">
          Loading the BurgerBurst menu…
        </div>
      )}

      {/* Categories section */}
      <section className="mb-12">
        <h2 className="mb-6 font-headline-lg text-2xl font-black uppercase text-[#1a1c1c]">Categories</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => setActiveCategory(category.name)}
              className={`${
                activeCategory === category.name ? 'bg-primary-container' : 'bg-white'
              } group flex flex-col items-center justify-center gap-2 rounded-xl p-4 comic-border comic-shadow hover-comic-lift active-comic-press transition-all cursor-pointer`}
            >
              <div
                className={`${
                  activeCategory === category.name ? 'bg-white' : 'bg-primary-container'
                } flex h-14 w-14 items-center justify-center rounded-full comic-border transition-transform group-hover:scale-110`}
              >
                <span className="material-symbols-outlined text-2xl text-on-surface">{category.icon}</span>
              </div>
              <span className="text-center font-label-bold text-xs font-black text-on-surface group-hover:text-primary uppercase">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Full filtered menu items section */}
      <section className="mb-12">
        <h2 className="mb-6 font-headline-lg text-2xl font-black uppercase text-[#1a1c1c]">
          {activeCategory === 'All' ? 'All Items' : activeCategory} ({filteredItems.length})
        </h2>

        {filteredItems.length === 0 ? (
          <div className="bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-12 text-center rounded-3xl">
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-2">sentiment_dissatisfied</span>
            <h3 className="font-black text-xl uppercase mb-2">NO FOOD ITEMS FOUND!</h3>
            <p className="text-xs font-bold text-gray-600">Try searching for another cartoon burger or sauce!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        )}
      </section>

      {hasMore && (
        <div className="mb-12 flex justify-center">
          <button
            type="button"
            disabled={loading}
            onClick={onLoadMore}
            className="rounded-xl border-4 border-[#1a1c1c] bg-[#FFD23F] px-8 py-3 text-xs font-black uppercase shadow-[4px_4px_0px_0px_#111111] disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}



      {/* Customizer Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1a1c1c] shadow-[12px_12px_0px_0px_#111111] rounded-3xl p-6 md:p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-9 h-9 bg-red-500 text-white border-2 border-[#1a1c1c] rounded-full font-black text-xs flex items-center justify-center cursor-pointer"
            >
              
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img src={customizingItem.image} alt={customizingItem.name} className="w-20 h-20 object-contain" />
              <div>
                <h3 className="font-black text-xl uppercase">{customizingItem.name}</h3>
                <span className="text-sm font-black text-[#FF0055]">${customizingItem.price.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitCustomization} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase">Extra Sauce & Toppings</label>
                {['Extra Cheese (+$1.50)', 'Shadow Onions (+$1.00)', 'Dragon Breath Sauce (+$1.25)'].map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 text-xs font-bold p-2 border-2 border-[#1a1c1c] rounded-xl bg-[#fcfbf7] cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={() => handleOptionCheckboxChange(opt, 1.25)}
                    />
                    {opt}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-[#1a1c1c]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                    className="w-8 h-8 bg-[#FFD23F] border-2 border-[#1a1c1c] font-black text-sm rounded-lg"
                  >
                    -
                  </button>
                  <span className="font-black text-sm">{modalQty}</span>
                  <button
                    type="button"
                    onClick={() => setModalQty(modalQty + 1)}
                    className="w-8 h-8 bg-[#FFD23F] border-2 border-[#1a1c1c] font-black text-sm rounded-lg"
                  >
                    +
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-[#FF0055] text-white border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-xs uppercase rounded-xl hover:bg-pink-600 cursor-pointer"
                >
                  ADD TO CART • ${(customizingItem.price * modalQty).toFixed(2)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
