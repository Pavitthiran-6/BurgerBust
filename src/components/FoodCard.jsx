import React from 'react';
import { STOCK_STATUS_CONFIG } from '../data/menu';

export default function FoodCard({ item, isFavorite, onToggleFavorite, onAddToCart, onViewDetail }) {
  const stockConfig = STOCK_STATUS_CONFIG[item.stockStatus] || STOCK_STATUS_CONFIG.AVAILABLE;
  const isUnavailable = stockConfig.disabled;

  return (
    <article 
      className={`group relative flex flex-col rounded-[2rem] bg-white p-6 comic-border comic-shadow transition-all ${
        isUnavailable ? 'opacity-65 pointer-events-none select-none' : ''
      }`}
    >
      {/* Badge (e.g. Popular, Spicy, etc.) */}
      {item.popular && !stockConfig.label && (
        <div className="absolute -left-4 -top-4 z-10 rounded-full bg-primary-container px-3 py-1 font-label-bold text-label-bold comic-border comic-shadow-sm rotate-[-10deg] text-xs font-black">
          POPULAR!
        </div>
      )}
      
      {/* Stock Status Badge */}
      {stockConfig.label && (
        <div className={`absolute -left-4 -top-4 z-10 rounded-full px-3 py-1 font-label-bold text-label-bold comic-border comic-shadow-sm ${stockConfig.color} rotate-[5deg] text-xs font-black`}>
          {stockConfig.label}
        </div>
      )}

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(item.id); }}
        className="absolute right-4 top-4 z-10 transition-transform hover:scale-110 cursor-pointer"
        aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      >
        <span 
          className={`material-symbols-outlined text-2xl ${isFavorite ? 'text-red-500' : 'text-black'}`} 
          style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          favorite
        </span>
      </button>

      {/* Image Container */}
      <div
        onClick={() => !isUnavailable && onViewDetail && onViewDetail(item.id)}
        className="mb-4 flex h-48 w-full items-center justify-center cursor-pointer"
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Info Area */}
      <div className="flex flex-grow flex-col">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-black text-sm uppercase text-[#1a1c1c] leading-tight font-black text-lg uppercase">{item.name}</h3>
          <span className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 font-label-bold text-label-bold comic-border shrink-0 text-xs">
            ★ {item.rating}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 font-body-md text-on-surface-variant text-xs font-medium leading-relaxed">{item.desc}</p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2 mt-auto">
          <span className="rounded-full border-2 border-outline-variant px-2.5 py-0.5 text-[10px] font-bold text-on-surface-variant bg-gray-50 uppercase">{item.tag}</span>
          {item.prepTime && (
            <span className="rounded-full border-2 border-outline-variant px-2.5 py-0.5 text-[10px] font-bold text-on-surface-variant bg-gray-50 uppercase">Prep: {item.prepTime}</span>
          )}
        </div>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between border-t-4 border-on-secondary-fixed pt-4">
          <span className="font-headline-xl text-headline-xl text-primary text-xl font-black">₹{item.price.toFixed(2)}</span>
          <button
            type="button"
            disabled={isUnavailable}
            onClick={() => !isUnavailable && onAddToCart && onAddToCart(item.id, {}, 1)}
            className={`flex h-12 w-12 items-center justify-center rounded-full comic-border comic-shadow transition-all ${
              isUnavailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-primary-container text-on-surface hover-comic-lift active-comic-press cursor-pointer'
            }`}
            aria-label={`Add ${item.name}`}
          >
            <span className="text-xl font-black">{isUnavailable ? '❌' : '＋'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
