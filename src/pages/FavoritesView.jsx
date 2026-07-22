import React from 'react';

export default function FavoritesView({ favorites = [], menuItems = [], onToggleFavorite, onAddToCart, onViewDetail, onBrowseMenu }) {
  // Filter favorited items or provide sample favorite items if none favorited
  const favoriteItems = menuItems.filter(item => favorites.includes(item.id));

  return (
    <div className="w-full py-6 flex flex-col items-center relative z-10 text-[#1a1c1c]">
      {/* Tom & Jerry Header Section */}
      <div className="w-full max-w-6xl px-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl bg-[#FFC72C] p-2 rounded-2xl border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] rotate-[-5deg] block font-black text-[#1a1c1c]">
              favorite
            </span>
            <div>
              <h1 className="font-display-xl text-3xl md:text-5xl uppercase font-black tracking-tight text-[#1a1c1c]">
                TOM & JERRY VAULT
              </h1>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mt-1">
                STOLEN CHEESE & FAVORITE BITES STASH
              </p>
            </div>
          </div>
        </div>

        {/* Playful Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#FFC72C] text-[#1a1c1c] border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] px-4 py-1.5 rotate-[-2deg] font-black text-xs md:text-sm uppercase rounded-xl">
            {favorites.length} {favorites.length === 1 ? 'SAVED TREAT' : 'SAVED TREATS'}
          </div>
          <div className="bg-[#4A6B82] text-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] px-4 py-1.5 rotate-[2deg] font-black text-xs uppercase hidden sm:block rounded-xl">
            CHASE IS ON!
          </div>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="w-full max-w-6xl px-4">
        {favoriteItems.length === 0 ? (
          /* Empty Favorites State - Tom & Jerry Trap */
          <div className="bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-10 md:p-16 text-center max-w-xl mx-auto flex flex-col items-center gap-4 relative overflow-hidden">
            {/* Cheese hole graphic accent */}
            <div className="w-16 h-16 bg-[#FFC72C] rounded-full border-4 border-[#1a1c1c] absolute -top-6 -right-6 opacity-40"></div>

            <span className="material-symbols-outlined text-6xl text-[#FFC72C] font-black block mb-1">
              sentiment_dissatisfied
            </span>
            <h2 className="font-headline-lg text-2xl md:text-3xl font-black uppercase text-[#1a1c1c]">
              Jerry's Cheese Trap is Empty!
            </h2>
            <p className="font-body-lg text-sm text-gray-700 font-bold max-w-md">
              Tom chased away all the snacks! Click the heart icon on any burger or drink in the menu to save your favorite treats here.
            </p>

            <button
              type="button"
              onClick={onBrowseMenu}
              className="mt-4 bg-[#FFC72C] text-[#1a1c1c] border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] px-8 py-3.5 font-headline-lg font-black text-lg uppercase hover:bg-yellow-400 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer rounded-2xl flex items-center gap-2"
            >
              <span>FILL THE VAULT!</span>
            </button>
          </div>
        ) : (
          /* Favorited Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteItems.map(item => (
              <div
                key={item.id}
                className="bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] rounded-3xl p-5 flex flex-col relative group hover:-translate-y-1 transition-all"
              >
                {/* Cheese Badge Accent */}
                <div className="absolute -top-3 -left-3 bg-[#FFC72C] border-3 border-[#1a1c1c] shadow-[2px_2px_0px_0px_#111111] px-3 py-0.5 rounded-full text-[11px] font-black uppercase z-10 rotate-[-6deg]">
                  JERRY'S CHOICE
                </div>

                {/* Heart Toggle Button */}
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item.id)}
                  className="absolute top-4 right-4 bg-white border-3 border-[#1a1c1c] shadow-[2px_2px_0px_0px_#111111] w-10 h-10 rounded-full flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer"
                  aria-label="Remove from favorites"
                >
                  <span className="material-symbols-outlined text-xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </button>

                {/* Product Image Box */}
                <div
                  onClick={() => onViewDetail && onViewDetail(item.id)}
                  className="w-full h-44 mb-4 flex items-center justify-center p-3 cursor-pointer relative"
                >
                  <img
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md z-10"
                    src={item.image}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3
                      onClick={() => onViewDetail && onViewDetail(item.id)}
                      className="font-black text-lg text-[#1a1c1c] cursor-pointer hover:text-[#4A6B82] transition-colors leading-tight"
                    >
                      {item.name}
                    </h3>
                    <span className="bg-white border-2 border-[#1a1c1c] px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-yellow-500 text-xs font-bold">star</span> {item.rating}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 font-bold mb-3 line-clamp-2">
                    {item.desc}
                  </p>

                  {/* Price & Action Buttons */}
                  <div className="mt-auto pt-3 border-t-3 border-[#1a1c1c] flex items-center justify-between gap-2">
                    <span className="font-black text-xl text-[#1a1c1c]">
                      ${item.price.toFixed(2)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetail && onViewDetail(item.id)}
                        className="px-3 py-1.5 bg-white border-2 border-[#1a1c1c] shadow-[2px_2px_0px_0px_#111111] rounded-xl text-xs font-black hover:bg-gray-100 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">visibility</span> Details
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddToCart && onAddToCart(item.id, {}, 1)}
                        className="px-3.5 py-1.5 bg-[#FFC72C] text-[#1a1c1c] border-2 border-[#1a1c1c] shadow-[2px_2px_0px_0px_#111111] rounded-xl text-xs font-black hover:bg-yellow-400 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">add_shopping_cart</span> Grab
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
