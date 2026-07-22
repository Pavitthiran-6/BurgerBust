import React, { useState, useEffect } from 'react';
import { STOCK_STATUS_CONFIG } from '../data/menu';
import FoodCard from '../components/FoodCard';
import { productService } from '../services/productService';

const TRENDING_SEARCHES = ['Monster Burger', 'Cheese Pizza', 'Happy Fries', 'Sunny Shake', 'Popcorn Chicken'];
const POPULAR_SEARCHES = ['Burger', 'Pizza', 'Combo', 'Vegan', 'Spicy'];

const PRICE_RANGES = [
  { label: 'Under $5', min: 0, max: 5 },
  { label: '$5 - $10', min: 5, max: 10 },
  { label: 'Over $10', min: 10, max: 999 },
];

export default function SearchView({
  menuItems = [],
  categories: categoryData = [],
  searchQuery,
  setSearchQuery,
  recentSearches = [],
  setRecentSearches,
  favorites = [],
  onToggleFavorite,
  onAddToCart,
  onViewDetail
}) {
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const categories = ['All', ...categoryData.map(category => category.name)];

  useEffect(() => {
    if (!localQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return undefined;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const selectedCategoryUuid = categoryData.find(category => category.name === selectedCategory)?.uuid;
        const result = await productService.searchProducts({
          q: localQuery.trim(),
          category: selectedCategoryUuid,
          minPrice: selectedPriceRange?.min,
          maxPrice: selectedPriceRange?.max,
          size: 50,
        });
        if (active) {
          setSearchResults(result.items);
          setSearchError(null);
        }
      } catch (error) {
        if (active) setSearchError(error.message || 'Search is temporarily unavailable');
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [localQuery, selectedCategory, selectedPriceRange, categoryData]);

  const filtered = searchResults.filter(item => {
    const q = localQuery.toLowerCase();
    const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesRating = !selectedRating || item.rating >= selectedRating;
    const matchesPrice = !selectedPriceRange || (item.price >= selectedPriceRange.min && item.price < selectedPriceRange.max);
    return matchesQuery && matchesCat && matchesRating && matchesPrice;
  });

  const handleSearch = (q) => {
    setLocalQuery(q);
    if (setSearchQuery) setSearchQuery(q);
  };

  const handleCommitSearch = (q) => {
    if (!q.trim()) return;
    handleSearch(q);
    if (setRecentSearches && !recentSearches.includes(q)) {
      setRecentSearches(prev => [q, ...prev.slice(0, 4)]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCommitSearch(localQuery);
  };

  const clearRecentSearches = () => {
    if (setRecentSearches) setRecentSearches([]);
  };

  const getSuggestions = () => {
    if (!localQuery || localQuery.length < 2) return [];
    return menuItems
      .filter(i => i.name.toLowerCase().includes(localQuery.toLowerCase()))
      .slice(0, 4)
      .map(i => i.name);
  };

  const suggestions = getSuggestions();
  const noResults = localQuery && filtered.length === 0;
  const noResultSuggestions = menuItems.filter(i => STOCK_STATUS_CONFIG[i.stockStatus]?.disabled === false).slice(0, 3);

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-6xl mx-auto px-4">
      {/* Inspector Gadget Search Banner */}
      <div className="w-full bg-[#00F0FF] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 relative overflow-hidden mb-8 text-[#1a1c1c]">
        <span className="bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-2 rotate-[-2deg]">
          INSPECTOR GADGET FOOD ENGINE
        </span>
        <h1 className="font-display-xl text-3xl md:text-5xl font-black uppercase tracking-tight">
          GADGET FOOD RADAR
        </h1>
        <p className="text-xs font-bold mt-1">SCAN THE MULTIVERSE FOR CARTOON BURGERS, PIZZAS & SHAKES!</p>

        {/* Search Input */}
        <div className="mt-6 relative max-w-xl">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type 'burger', 'pepperoni', 'fries'..."
            className="w-full p-4 pl-12 pr-24 bg-white border-4 border-[#1a1c1c] rounded-2xl font-bold text-sm shadow-[4px_4px_0px_0px_#111111]"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-700">search</span>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
            <button type="button" title="Voice Search (Coming Soon)" className="w-8 h-8 bg-[#FFD23F] border-2 border-[#1a1c1c] rounded-xl flex items-center justify-center text-base cursor-pointer" onClick={() => {}}></button>
            <button type="button" title="QR Scanner (Coming Soon)" className="w-8 h-8 bg-[#FF70A6] border-2 border-[#1a1c1c] rounded-xl flex items-center justify-center text-base cursor-pointer" onClick={() => {}}></button>
          </div>

          {/* Live Suggestions Dropdown */}
          {suggestions.length > 0 && localQuery && (
            <div className="absolute top-full left-0 right-0 z-20 bg-white border-4 border-[#1a1c1c] rounded-2xl shadow-[4px_4px_0px_0px_#111111] mt-1 overflow-hidden">
              {suggestions.map((s, i) => (
                <button key={i} type="button" onClick={() => handleCommitSearch(s)} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-yellow-50 border-b border-gray-100 last:border-0">
                   {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent + Trending Chips */}
      {!localQuery && (
        <div className="w-full space-y-4 mb-8">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black uppercase text-gray-700"> RECENT SEARCHES</span>
                <button type="button" onClick={clearRecentSearches} className="text-[10px] font-black text-[#FF0055] underline cursor-pointer">CLEAR ALL</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {recentSearches.map((s, i) => (
                  <button key={i} type="button" onClick={() => handleSearch(s)}
                    className="px-3 py-1.5 bg-white border-2 border-[#1a1c1c] font-black text-xs rounded-full hover:bg-yellow-50 cursor-pointer shadow-[2px_2px_0px_0px_#111111]">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-black uppercase text-gray-700 block mb-2"> TRENDING NOW</span>
            <div className="flex gap-2 flex-wrap">
              {TRENDING_SEARCHES.map((s, i) => (
                <button key={i} type="button" onClick={() => handleCommitSearch(s)}
                  className="px-3 py-1.5 bg-[#FFD23F] border-2 border-[#1a1c1c] font-black text-xs rounded-full cursor-pointer shadow-[2px_2px_0px_0px_#111111]">
                   {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-black uppercase text-gray-700 block mb-2"> POPULAR CATEGORIES</span>
            <div className="flex gap-2 flex-wrap">
              {POPULAR_SEARCHES.map((s, i) => (
                <button key={i} type="button" onClick={() => handleCommitSearch(s)}
                  className="px-3 py-1.5 bg-[#00F0FF] border-2 border-[#1a1c1c] font-black text-xs rounded-full cursor-pointer shadow-[2px_2px_0px_0px_#111111]">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Smart Filters */}
      {localQuery && (
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-lg uppercase">RADAR SCAN RESULTS ({filtered.length})</h2>
            <button type="button" onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 bg-white border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl shadow-[2px_2px_0px_0px_#111111] cursor-pointer">
              ️ {showFilters ? 'HIDE FILTERS' : 'SMART FILTERS'}
            </button>
          </div>

          {showFilters && (
            <div className="bg-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] rounded-2xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
              {/* Category Filter */}
              <div>
                <span className="text-xs font-black uppercase block mb-2">CATEGORY</span>
                <div className="flex flex-wrap gap-1">
                  {categories.map(cat => (
                    <button key={cat} type="button" onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 border-2 border-[#1a1c1c] font-black text-[10px] uppercase rounded-lg cursor-pointer ${selectedCategory === cat ? 'bg-[#FFD23F]' : 'bg-gray-100'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <span className="text-xs font-black uppercase block mb-2">MIN RATING</span>
                <div className="flex gap-1">
                  {[4, 4.5, 4.8].map(r => (
                    <button key={r} type="button" onClick={() => setSelectedRating(selectedRating === r ? 0 : r)}
                      className={`px-2 py-1 border-2 border-[#1a1c1c] font-black text-[10px] uppercase rounded-lg cursor-pointer ${selectedRating === r ? 'bg-[#FFD23F]' : 'bg-gray-100'}`}>
                       {r}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <span className="text-xs font-black uppercase block mb-2">PRICE RANGE</span>
                <div className="flex flex-wrap gap-1">
                  {PRICE_RANGES.map(r => (
                    <button key={r.label} type="button" onClick={() => setSelectedPriceRange(selectedPriceRange?.label === r.label ? null : r)}
                      className={`px-2 py-1 border-2 border-[#1a1c1c] font-black text-[10px] uppercase rounded-lg cursor-pointer ${selectedPriceRange?.label === r.label ? 'bg-[#00F0FF]' : 'bg-gray-100'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {searchError && (
        <div className="mb-6 w-full rounded-2xl border-4 border-[#1a1c1c] bg-red-100 p-4 text-center text-xs font-black text-red-700">
          {searchError}
        </div>
      )}

      {searchLoading && localQuery && (
        <div className="mb-6 w-full text-center text-xs font-black uppercase">Scanning the menu…</div>
      )}

      {noResults && !searchLoading && (
        <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-10 text-center mb-8">
          <div className="text-5xl mb-3"></div>
          <h3 className="font-black text-xl uppercase mb-2">NO RESULTS FOR "{localQuery}"</h3>
          <p className="text-xs font-bold text-gray-600 mb-4">Inspector Gadget's radar couldn't find that item! Did you mean something else?</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {noResultSuggestions.map(item => (
              <button key={item.id} type="button" onClick={() => handleSearch(item.name)}
                className="px-4 py-2 bg-[#FFD23F] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer">
                TRY: {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!noResults && localQuery && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filtered.map(item => (
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
    </div>
  );
}
