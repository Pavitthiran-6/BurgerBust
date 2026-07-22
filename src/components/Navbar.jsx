import React from 'react';

export default function Navbar({
  currentPage,
  setCurrentPage,
  cartQty,
  onSearchClick,
  isLoggedIn,
  user,
  unreadNotificationsCount = 0,
  onLogout,
  restaurantStatus
}) {
  return (
    <nav className="bg-surface border-b-4 border-on-secondary-fixed shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-12 py-stack-sm h-24">
        {/* Logo */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentPage('home')}>
          <img 
            alt="BurgerBurst Logo" 
            className="h-16 w-16 rounded-full border-4 border-on-secondary-fixed shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw4oArWR8qtfPmAuIKSdaPSJP7E56Z1d2K16t4f8toyIAU_vkGuKyIcqBQbEcrG0Gn2os8mCpHQ5IoJPXmWXvQ6GWSzdqzlYIXjzgOOB0VZD9zhieImcs3qfYeheIBXzsWH02prnk-aFkuZpEgHwo53bU7Vxg4CLmXMo0WItYHJxF3-84IKqFXRaAVQ30ejvbbddFdqJx5gPOAKaEOhnGpfyj1R7P5EwRyXcQHVrhYPm6lzjbYYXJ9ISJ98joLpOSt329W8DSsVw"
          />
          <span className="font-headline-lg text-headline-lg font-black text-primary border-4 border-on-secondary-fixed px-4 py-1 rounded-xl shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] bg-primary-container">
            BurgerBurst
          </span>
          {restaurantStatus && (
            <span
              title={restaurantStatus.error || restaurantStatus.message}
              className={`${restaurantStatus.color} hidden lg:inline-flex text-white border-2 border-[#1a1c1c] rounded-full px-2 py-1 text-[9px] font-black uppercase`}
            >
              {restaurantStatus.loading ? 'Checking…' : restaurantStatus.label}
            </span>
          )}
        </div>

        {/* Center Desktop Links */}
        <div className="hidden md:flex gap-gutter items-center">
          <button 
            type="button"
            onClick={() => setCurrentPage('home')}
            className={`font-bold transition-all duration-100 pb-1 cursor-pointer ${
              currentPage === 'home' 
                ? 'text-primary border-b-4 border-primary' 
                : 'text-on-surface-variant hover:text-primary hover:-translate-y-0.5'
            }`}
          >
            Home
          </button>
          <button 
            type="button"
            onClick={() => setCurrentPage('menu')}
            className={`font-bold transition-all duration-100 pb-1 cursor-pointer ${
              currentPage === 'menu' 
                ? 'text-primary border-b-4 border-primary' 
                : 'text-on-surface-variant hover:text-primary hover:-translate-y-0.5'
            }`}
          >
            Menu
          </button>
          <button 
            type="button"
            onClick={() => setCurrentPage('offers')}
            className={`font-bold transition-all duration-100 pb-1 cursor-pointer ${
              currentPage === 'offers' 
                ? 'text-primary border-b-4 border-primary' 
                : 'text-on-surface-variant hover:text-primary hover:-translate-y-0.5'
            }`}
          >
            Offers
          </button>
          <button 
            type="button"
            onClick={() => setCurrentPage('rewards')}
            className={`font-bold transition-all duration-100 pb-1 cursor-pointer ${
              currentPage === 'rewards' 
                ? 'text-primary border-b-4 border-primary' 
                : 'text-on-surface-variant hover:text-primary hover:-translate-y-0.5'
            }`}
          >
            Rewards
          </button>
          {isLoggedIn && (
            <button 
              type="button"
              onClick={() => setCurrentPage('profile')}
              className={`font-bold transition-all duration-100 pb-1 cursor-pointer ${
                currentPage === 'profile' 
                  ? 'text-primary border-b-4 border-primary' 
                  : 'text-on-surface-variant hover:text-primary hover:-translate-y-0.5'
              }`}
            >
              Profile
            </button>
          )}
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* 1. Search Button */}
          <button 
            type="button"
            onClick={onSearchClick}
            className="flex items-center justify-center bg-surface-container-lowest border-4 border-on-secondary-fixed rounded-full p-3 neo-shadow hover:-translate-y-0.5 hover:translate-x-0.5 transition-transform duration-100 active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer"
            title="Search Menu"
          >
            <svg className="w-5 h-5 stroke-current stroke-[3] text-on-surface" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path strokeLinecap="round" d="m21 21-4.3-4.3"/>
            </svg>
          </button>

          {/* 2. Favorites Button */}
          <button 
            type="button"
            onClick={() => setCurrentPage('favorites')}
            className="flex items-center justify-center bg-surface-container-lowest border-4 border-on-secondary-fixed rounded-full p-3 neo-shadow hover:-translate-y-0.5 hover:translate-x-0.5 transition-transform duration-100 active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer"
            title="Tom & Jerry Vault (Favorites)"
          >
            <svg className="w-5 h-5 fill-current text-red-500" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>

          {/* 3. Cart Button */}
          <button 
            type="button"
            onClick={() => setCurrentPage('cart')}
            className="relative flex items-center justify-center bg-surface-container-lowest border-4 border-on-secondary-fixed rounded-full p-3 neo-shadow hover:-translate-y-0.5 hover:translate-x-0.5 transition-transform duration-100 active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer"
            title="Shopping Cart"
          >
            <svg className="w-5 h-5 stroke-current stroke-[3] text-on-surface" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            {cartQty > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white font-bold border-2 border-on-secondary-fixed text-xs w-6 h-6 rounded-full flex items-center justify-center animate-scaleIn">
                {cartQty}
              </span>
            )}
          </button>

          {/* 4. Login vs Profile Avatar */}
          {isLoggedIn ? (
            <div className="relative group">
              <button 
                type="button"
                onClick={() => setCurrentPage('profile')}
                className="flex items-center gap-2 bg-[#FFD23F] text-[#1a1c1c] border-4 border-on-secondary-fixed rounded-xl px-3 py-1.5 neo-shadow cursor-pointer hover:bg-yellow-400"
                title="Profile Hub"
              >
                <div className="relative w-8 h-8 bg-[#FF0055] text-white rounded-full border-2 border-[#1a1c1c] flex items-center justify-center font-black text-xs uppercase">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (user?.name || 'Hero').slice(0, 2).toUpperCase()
                  )}
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-cyan-400 text-[#1a1c1c] border border-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-black text-xs uppercase">{user?.name?.split(' ')[0] || 'HERO'}</span>
              </button>

              {/* Quick Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] rounded-2xl p-2 hidden group-hover:block z-50 space-y-1">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="w-full text-left px-3 py-2 text-xs font-black uppercase hover:bg-yellow-100 rounded-xl flex items-center gap-2"
                >
                   PROFILE HUB
                </button>
                <button
                  onClick={() => setCurrentPage('orders')}
                  className="w-full text-left px-3 py-2 text-xs font-black uppercase hover:bg-yellow-100 rounded-xl flex items-center gap-2"
                >
                   MY ORDERS
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-xs font-black uppercase text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 border-t-2 border-dashed border-[#1a1c1c] pt-2"
                >
                   LOGOUT
                </button>
              </div>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => setCurrentPage('login')}
              className="flex items-center gap-1.5 bg-primary-container text-[#1a1c1c] border-4 border-on-secondary-fixed rounded-xl px-3.5 py-2 neo-shadow hover:-translate-y-0.5 hover:translate-x-0.5 transition-transform duration-100 active:translate-y-1 active:translate-x-1 active:shadow-none font-black text-xs uppercase cursor-pointer"
              title="Login to Cartoon Account"
            >
              <svg className="w-4 h-4 stroke-current stroke-[3] text-[#1a1c1c]" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
              <span className="hidden sm:inline">LOGIN</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
