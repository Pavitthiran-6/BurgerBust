import React from 'react';


export default function HomeView({
  setCurrentPage,
  setActiveCategory,
  onAddDirectItem,
  onAddToCart,
  onViewDetail,
  isLoggedIn,
  user,
  recentOrders = [],
  rewardPoints = 450
}) {
  const handleGoToMenu = (category = 'All') => {
    setActiveCategory(category);
    setCurrentPage('menu');
  };

  const handleOpenBossDetail = () => {
    if (onViewDetail) {
      onViewDetail('burger-classic');
    } else {
      handleGoToMenu('Burger');
    }
  };

  const handleAddHubItem = (itemKey, itemName) => {
    if (onAddDirectItem) {
      onAddDirectItem(itemKey);
    }
  };

  return (
    <div className="flex flex-col gap-24 w-full">
      {/* Logged In Personalized Welcome Banner */}
      {isLoggedIn && (
        <div className="w-full bg-[#00F0FF] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[#1a1c1c] mt-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FF0055] text-white border-3 border-[#1a1c1c] rounded-2xl flex items-center justify-center font-black text-2xl shadow-[2px_2px_0px_0px_#111111]">
              
            </div>
            <div>
              <h2 className="font-headline-md text-2xl font-black uppercase">WELCOME BACK, {user?.name || 'SAILOR HERO'}!</h2>
              <p className="text-xs font-bold text-gray-800">You have {rewardPoints} Pokéball Points ready to redeem in Hero Academy!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleGoToMenu('All')}
            className="px-6 py-3 bg-[#FFD23F] text-[#1a1c1c] border-3 border-[#1a1c1c] font-black text-xs uppercase rounded-xl hover:bg-yellow-400 cursor-pointer shadow-[3px_3px_0px_0px_#111111]"
          >
            CONTINUE ORDERING 
          </button>
        </div>
      )}

      {/* 1. Dynamic Hero Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 w-full">
        {/* Left Big Card (Toon Boss) */}
        <div className="lg:col-span-8 bg-[#FFD23F] comic-border rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center shadow-[12px_12px_0px_0px_rgba(17,17,17,1)] transform -rotate-1">
          <div className="flex-grow z-10 flex flex-col items-start">
            <div className="bg-white comic-border px-6 py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] transform -rotate-3 inline-block mb-6">
              <h1 className="font-headline-xl text-5xl md:text-7xl leading-none">THE TOON<br/>BOSS</h1>
            </div>
            <p className="text-2xl font-black mb-8 max-w-md">REAL BEEF. REAL CHEESE. CARTOON ATTITUDE.</p>
            <button 
              onClick={handleOpenBossDetail}
              className="bg-white text-black font-black text-xl px-10 py-5 rounded-full comic-border shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-1 hover:translate-x-1 transition-transform cursor-pointer"
            >
              VIEW DETAILS & GRAB ONE!
            </button>
          </div>
          <div className="flex-shrink-0 w-full md:w-1/2 relative mt-6 md:mt-0 flex justify-center">
            <img 
              alt="Toon Boss Burger" 
              className="w-full max-w-[320px] h-auto drop-shadow-[15px_15px_0px_rgba(17,17,17,0.3)] transform hover:scale-110 transition-transform duration-500 cursor-pointer"
              onClick={handleOpenBossDetail}
              src="/foods/burger-boss.png"
            />
            <div className="absolute -top-4 -right-4 bg-white comic-border px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transform rotate-12">
              <span className="font-black text-2xl italic">BOOM!</span>
            </div>
          </div>
        </div>

        {/* Right Small Card (Sidekick Fries) */}
        <div 
          onClick={() => handleGoToMenu('Fries')}
          className="lg:col-span-4 bg-white comic-border rounded-3xl p-6 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] flex flex-col items-center justify-center transform rotate-1 cursor-pointer group hover:-translate-y-1 transition-transform"
        >
          <h2 className="font-headline-lg text-3xl mb-4 text-center">SIDEKICK FRIES</h2>
          <img 
            alt="Sidekick Fries" 
            className="w-64 h-64 object-contain drop-shadow-[10px_10px_0px_rgba(17,17,17,0.2)] group-hover:scale-105 transition-transform" 
            src="/foods/home/fries.png"
          />
          <div className="absolute bottom-4 right-4 bg-[#FFD23F] comic-border px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transform -rotate-6">
            <span className="font-black text-xl">SALTY!</span>
          </div>
        </div>
      </section>

      {/* 2. The Toon Bucket (Bundles) */}
      <section className="bg-black comic-border rounded-[40px] p-10 md:p-16 relative overflow-hidden shadow-[16px_16px_0px_0px_rgba(255,210,63,1)] w-full">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 dots-bg"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-white flex-1 flex flex-col items-start">
            <div className="bg-[#FFD23F] comic-border inline-block px-8 py-3 rounded-2xl transform -rotate-2 mb-6">
              <h2 className="font-headline-xl text-black text-4xl md:text-6xl">THE BUCKET</h2>
            </div>
            <p className="text-2xl font-bold mb-8">NUGGETS + SODA = UNSTOPPABLE COMBO</p>
            <div className="flex gap-4">
              <button 
                onClick={() => handleGoToMenu('Chicken')}
                className="bg-white text-black font-black text-3xl p-4 comic-border rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,210,63,1)] hover:-translate-y-1 transition-transform cursor-pointer"
              >
                ONLY $12.99
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <img 
              alt="Nuggets" 
              className="w-64 h-64 md:w-80 md:h-80 object-contain z-20 drop-shadow-[0_20px_40px_rgba(255,255,255,0.2)]" 
              src="/foods/home/nuggets.png"
            />
            <img 
              alt="Soft Drink" 
              className="w-48 h-48 md:w-64 md:h-64 object-contain z-10 -ml-20 mt-20 drop-shadow-[0_20px_40px_rgba(255,255,255,0.2)]" 
              src="/foods/home/soft-drink.png"
            />
            <div 
              onClick={() => handleGoToMenu('Beverage')}
              className="absolute -top-10 -right-10 bg-[#FFD23F] w-32 h-32 rounded-full comic-border flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
            >
              <span className="font-black text-2xl text-black">POP!</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Daily Wanted Poster */}
      <section className="flex justify-center py-10 w-full">
        <div className="bg-[#f4e4bc] comic-border w-full max-w-2xl p-10 shadow-[15px_15px_0px_0px_rgba(17,17,17,1)] relative flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]">
          <div className="bg-black text-white px-12 py-4 mb-8">
            <h2 className="text-6xl font-black tracking-widest italic text-center">WANTED</h2>
          </div>
          <div className="comic-border bg-white p-4 mb-6 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] cursor-pointer" onClick={() => handleGoToMenu('Pizza')}>
            <img 
              alt="Cheesy Pal Pizza" 
              className="w-80 h-80 object-contain hover:scale-105 transition-transform duration-300" 
              src="/foods/pizza-cheesy.png"
            />
          </div>
          <h3 className="font-headline-lg text-4xl mb-4">"CHEESY PAL"</h3>
          <p className="text-2xl font-black border-t-4 border-black pt-4 w-full text-center mb-8">REWARD: STRETCHY SATISFACTION</p>
          <div 
            onClick={() => handleGoToMenu('Pizza')}
            className="absolute -bottom-8 -right-8 bg-[#FFD23F] comic-border w-32 h-32 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transform rotate-12 cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="font-black text-xl text-center">CHEESY!<br/>$3.50</span>
          </div>
        </div>
      </section>

      {/* 4. Late Night Cravings Grid */}
      <section className="w-full">
        <div className="flex items-center gap-6 mb-12 w-full">
          <h2 className="font-headline-xl text-5xl bg-white comic-border px-8 py-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] shrink-0">LATE NIGHT CRAVINGS</h2>
          <div className="flex-grow h-2 bg-black"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Wings */}
          <div 
            onClick={() => handleGoToMenu('Chicken')}
            className="bg-white comic-border p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] group hover:-translate-y-2 transition-transform cursor-pointer"
          >
            <div className="h-64 flex items-center justify-center relative">
              <img 
                alt="Spicy Wings" 
                className="max-h-full object-contain" 
                src="/foods/home/wings.png"
              />
              <div className="absolute top-0 right-0 bg-red-500 text-white comic-border px-3 py-1 rounded-lg transform rotate-12 font-black">HOT!</div>
            </div>
            <div className="mt-6 border-t-4 border-black pt-4">
              <h3 className="font-headline-lg text-2xl">SPICY WINGS</h3>
              <p className="font-bold">6-PIECE FIREPOWER</p>
            </div>
          </div>
          
          {/* Tacos */}
          <div 
            onClick={() => handleGoToMenu('Pasta')}
            className="bg-[#FFD23F] comic-border p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] group hover:-translate-y-2 transition-transform cursor-pointer"
          >
            <div className="h-64 flex items-center justify-center relative">
              <img 
                alt="Midnight Tacos" 
                className="max-h-full object-contain" 
                src="/foods/home/tacos.png"
              />
              <div className="absolute top-0 left-0 bg-white comic-border px-3 py-1 rounded-lg transform -rotate-12 font-black">ZAP!</div>
            </div>
            <div className="mt-6 border-t-4 border-black pt-4">
              <h3 className="font-headline-lg text-2xl">MIDNIGHT TACOS</h3>
              <p className="font-bold">CRUNCHY VIGILANTE</p>
            </div>
          </div>

          {/* Chicken */}
          <div 
            onClick={() => handleGoToMenu('Chicken')}
            className="bg-white comic-border p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] group hover:-translate-y-2 transition-transform cursor-pointer"
          >
            <div className="h-64 flex items-center justify-center relative">
              <img 
                alt="Fried Chicken" 
                className="max-h-full object-contain" 
                src="/foods/home/fried-chicken.png"
              />
              <div className="absolute bottom-0 right-0 bg-[#FFD23F] comic-border px-4 py-2 rounded-full font-black transform rotate-12">WHAM!</div>
            </div>
            <div className="mt-6 border-t-4 border-black pt-4">
              <h3 className="font-headline-lg text-2xl">FRIED CHICKEN</h3>
              <p className="font-bold">CRISPY JUSTICE</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Toon Bakery (Dots Pattern) */}
      <section className="dots-bg comic-border rounded-[50px] p-12 md:p-20 shadow-[15px_15px_0px_0px_rgba(17,17,17,1)] bg-white w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-grow flex-1 space-y-8">
            <h2 className="font-headline-xl text-6xl md:text-8xl leading-none">THE TOON<br/>BAKERY</h2>
            <p className="text-3xl font-black italic">SWEET VICTORY IN EVERY BITE!</p>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => handleGoToMenu('Bakery')}
                className="bg-white comic-border p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] flex items-center justify-center gap-2 cursor-pointer hover:bg-yellow-50"
              >
                <span className="material-symbols-outlined text-primary font-black">cookie</span>
                <span className="font-black text-xs md:text-sm">FRESHLY DRAWN</span>
              </div>
              <div 
                onClick={() => handleGoToMenu('Bakery')}
                className="bg-white comic-border p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] flex items-center justify-center gap-2 cursor-pointer hover:bg-yellow-50"
              >
                <span className="material-symbols-outlined text-primary font-black">cake</span>
                <span className="font-black text-xs md:text-sm">SUGAR RUSH</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex gap-8 justify-center relative mt-6 lg:mt-0">
            <div 
              onClick={() => handleGoToMenu('Bakery')}
              className="bg-white comic-border p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] transform -rotate-6 cursor-pointer hover:scale-105 transition-transform"
            >
              <img 
                alt="Donut" 
                className="w-36 h-36 md:w-48 md:h-48 object-contain" 
                src="/foods/home/donut.png"
              />
              <div className="bg-[#FFD23F] comic-border absolute -top-4 -left-4 px-4 py-2 rounded-xl font-black text-xs">DONUT</div>
            </div>
            <div 
              onClick={() => handleGoToMenu('Bakery')}
              className="bg-white comic-border p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] transform rotate-6 mt-12 cursor-pointer hover:scale-105 transition-transform"
            >
              <img 
                alt="Brownie" 
                className="w-36 h-36 md:w-48 md:h-48 object-contain" 
                src="/foods/home/brownie.png"
              />
              <div className="bg-black text-white comic-border absolute -bottom-4 -right-4 px-4 py-2 rounded-xl font-black text-xs">BROWNIE</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Global Fresh Hub */}
      <section className="overflow-hidden w-full">
        <h2 className="font-headline-lg text-4xl mb-8 uppercase italic border-l-8 border-primary pl-6">Global Fresh Hub</h2>
        <div className="flex overflow-x-auto gap-8 pb-10 px-4 snap-x -mx-4 no-scrollbar">
          {/* Pasta */}
          <div className="min-w-[300px] bg-white comic-border rounded-3xl p-6 snap-center shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] flex flex-col justify-between">
            <img 
              alt="Pasta" 
              className="w-full h-44 object-contain mb-4 cursor-pointer" 
              onClick={() => handleGoToMenu('Pasta')}
              src="/foods/pasta-tomato.png"
            />
            <div>
              <h3 className="font-black text-xl mb-2 line-clamp-1">ITALO-TOON PASTA</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-black text-primary">$11.00</span>
                <button 
                  onClick={() => handleAddHubItem('pasta-italo', 'Italo-Toon Pasta')}
                  className="bg-black text-white p-2 rounded-full comic-border cursor-pointer hover:bg-primary hover:text-black transition-colors"
                >
                  <span className="material-symbols-outlined font-bold flex items-center justify-center">add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Wrap */}
          <div className="min-w-[300px] bg-white comic-border rounded-3xl p-6 snap-center shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] flex flex-col justify-between">
            <img 
              alt="Chicken Wrap" 
              className="w-full h-44 object-contain mb-4 cursor-pointer" 
              onClick={() => handleGoToMenu('Chicken')}
              src="/foods/home/chicken-wrap.png"
            />
            <div>
              <h3 className="font-black text-xl mb-2 line-clamp-1">HERO WRAP</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-black text-primary">$8.50</span>
                <button 
                  onClick={() => handleAddHubItem('wrap-hero', 'Hero Wrap')}
                  className="bg-black text-white p-2 rounded-full comic-border cursor-pointer hover:bg-primary hover:text-black transition-colors"
                >
                  <span className="material-symbols-outlined font-bold flex items-center justify-center">add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Shawarma */}
          <div className="min-w-[300px] bg-white comic-border rounded-3xl p-6 snap-center shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] flex flex-col justify-between">
            <img 
              alt="Shawarma" 
              className="w-full h-44 object-contain mb-4 cursor-pointer" 
              onClick={() => handleGoToMenu('Chicken')}
              src="/foods/home/shawarma.png"
            />
            <div>
              <h3 className="font-black text-xl mb-2 line-clamp-1">ZAP SHAWARMA</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-black text-primary">$9.00</span>
                <button 
                  onClick={() => handleAddHubItem('shawarma-zap', 'Zap Shawarma')}
                  className="bg-black text-white p-2 rounded-full comic-border cursor-pointer hover:bg-primary hover:text-black transition-colors"
                >
                  <span className="material-symbols-outlined font-bold flex items-center justify-center">add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hot Dog */}
          <div className="min-w-[300px] bg-white comic-border rounded-3xl p-6 snap-center shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] flex flex-col justify-between">
            <img 
              alt="Hot Dog" 
              className="w-full h-44 object-contain mb-4 cursor-pointer" 
              onClick={() => handleGoToMenu('Chicken')}
              src="/foods/home/hot-dog.png"
            />
            <div>
              <h3 className="font-black text-xl mb-2 line-clamp-1">BOOM DOG</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-black text-primary">$6.00</span>
                <button 
                  onClick={() => handleAddHubItem('hotdog-boom', 'Boom Dog')}
                  className="bg-black text-white p-2 rounded-full comic-border cursor-pointer hover:bg-primary hover:text-black transition-colors"
                >
                  <span className="material-symbols-outlined font-bold flex items-center justify-center">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekend Warrior Packs */}
      <section className="w-full">
        <div className="flex items-center gap-6 mb-12 w-full">
          <h2 className="font-headline-xl text-4xl md:text-5xl bg-[#FFD23F] comic-border px-8 py-3 rounded-2xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] uppercase shrink-0">WEEKEND WARRIOR PACKS</h2>
          <div className="flex-grow h-2 bg-black"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Party Starter */}
          <div className="bg-white comic-border p-8 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(17,17,17,1)] relative group flex flex-col justify-between">
            <div className="absolute -top-6 -right-6 bg-red-500 text-white comic-border px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transform rotate-12 z-20 font-black text-xl">
              15% OFF
            </div>
            <div className="flex justify-center items-center h-64 gap-4 mb-8">
              <img 
                alt="Cheesy Chibi Burger" 
                className="w-1/2 h-full object-contain drop-shadow-[5px_5px_0px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform cursor-pointer" 
                onClick={() => handleGoToMenu('Burger')}
                src="/foods/burger-chibi.png"
              />
              <img 
                alt="Mozzarella Sticks" 
                className="w-1/2 h-full object-contain drop-shadow-[5px_5px_0px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform cursor-pointer" 
                onClick={() => handleGoToMenu('Sides')}
                src="/foods/home/mozzarella-sticks.png"
              />
            </div>
            <div className="border-t-4 border-black pt-6">
              <h3 className="font-headline-lg text-3xl mb-2">THE PARTY STARTER</h3>
              <p className="font-bold mb-6">Cheesy Chibi Burger + Mozzarella Sticks. The ultimate solo mission.</p>
              <button 
                onClick={() => handleGoToMenu('All')}
                className="w-full bg-[#FFD23F] text-black font-black py-4 rounded-xl comic-border shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:translate-y-1 active:shadow-none transition-all uppercase cursor-pointer"
              >
                GRAB PACK
              </button>
            </div>
          </div>

          {/* Family Feast */}
          <div className="bg-white comic-border p-8 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(17,17,17,1)] relative group flex flex-col justify-between">
            <div className="absolute -top-6 -right-6 bg-[#FFD23F] text-black comic-border px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transform -rotate-6 z-20 font-black text-xl">
              BEST VALUE
            </div>
            <div className="flex justify-center items-center h-64 gap-2 mb-8">
              <img 
                alt="Chicken Sandwich" 
                className="w-1/3 h-full object-contain drop-shadow-[5px_5px_0px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform cursor-pointer" 
                onClick={() => handleGoToMenu('Chicken')}
                src="/foods/home/chicken-sandwich.png"
              />
              <img 
                alt="Golden Onion Rings" 
                className="w-1/3 h-full object-contain drop-shadow-[5px_5px_0px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform cursor-pointer" 
                onClick={() => handleGoToMenu('Sides')}
                src="/foods/home/onion-rings.png"
              />
              <img 
                alt="Mystic Iced Coffee" 
                className="w-1/3 h-full object-contain drop-shadow-[5px_5px_0px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform cursor-pointer" 
                onClick={() => handleGoToMenu('Drinks')}
                src="/foods/home/iced-coffee.png"
              />
            </div>
            <div className="border-t-4 border-black pt-6">
              <h3 className="font-headline-lg text-3xl mb-2">THE FAMILY FEAST</h3>
              <p className="font-bold mb-6">Chicken Sandwich + Onion Rings + Iced Coffee. Feed the whole squad.</p>
              <button 
                onClick={() => handleGoToMenu('All')}
                className="w-full bg-[#FFD23F] text-black font-black py-4 rounded-xl comic-border shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:translate-y-1 active:shadow-none transition-all uppercase cursor-pointer"
              >
                GRAB PACK
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. The Toon Shake & Bites Haven */}
      <section className="bg-[#FFD23F] comic-border rounded-t-[60px] p-8 md:p-12 mt-12 relative overflow-hidden w-full">
        <div className="flex flex-col items-center mb-8 text-center gap-2 relative z-10">
          <span className="bg-black text-white px-6 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-wider comic-border shadow-[3px_3px_0px_0px_#FFFFFF]">
            SPECIAL CARTOON COMBOS
          </span>
          <h2 className="font-display-xl text-3xl md:text-5xl font-black uppercase text-[#1a1c1c] drop-shadow-[2px_2px_0px_#FFFFFF]">
            THE TOON SHAKES & BITES HAVEN
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10 w-full">
          {/* Shakes Pair Showcase */}
          <div className="flex gap-6 items-end justify-center w-full lg:w-auto">
            <div className="text-center group cursor-pointer" onClick={() => handleGoToMenu('Beverage')}>
              <img 
                alt="Strawberry Shake" 
                className="w-32 h-44 md:w-44 md:h-60 object-contain group-hover:-translate-y-3 transition-transform duration-300 drop-shadow-[5px_5px_0px_rgba(0,0,0,0.2)]" 
                src="/foods/home/strawberry-shake.png"
              />
              <div className="bg-white comic-border px-4 py-1 rounded-xl mt-2 font-black text-xs md:text-sm shadow-[2px_2px_0px_0px_#1a1c1c]">
                STRAWBERRY SHAKE
              </div>
            </div>

            <div className="text-center group cursor-pointer" onClick={() => handleGoToMenu('Beverage')}>
              <img 
                alt="Vanilla Shake" 
                className="w-32 h-44 md:w-44 md:h-60 object-contain group-hover:-translate-y-3 transition-transform duration-300 drop-shadow-[5px_5px_0px_rgba(0,0,0,0.2)]" 
                src="/foods/home/vanilla-shake.png"
              />
              <div className="bg-white comic-border px-4 py-1 rounded-xl mt-2 font-black text-xs md:text-sm shadow-[2px_2px_0px_0px_#1a1c1c]">
                VANILLA SHAKE
              </div>
            </div>
          </div>

          {/* Centerpiece Featured Food: Monster Pepperoni Pizza Box */}
          <div className="flex flex-col items-center bg-[#FF0055] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 text-white text-center transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300 max-w-xs w-full cursor-pointer my-4 lg:my-0" onClick={() => handleGoToMenu('Pizza')}>
            <span className="bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-1 rounded-full text-xs font-black uppercase mb-3 shadow-[2px_2px_0px_0px_#111111]">
              HOT CHEESY SLICE 
            </span>
            <img 
              alt="Monster Pepperoni Pizza" 
              className="w-36 h-36 md:w-44 md:h-44 object-contain drop-shadow-[6px_6px_0px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform duration-300 mb-3" 
              src="/foods/pizza-pepperoni.png"
            />
            <h3 className="font-headline-md text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-1">
              PEPPERONI SLICE
            </h3>
            <span className="text-xs font-bold text-yellow-200 mb-3 block">STRETCHY CHEESE OVERLOAD</span>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onAddDirectItem && onAddDirectItem('pizza-pepperoni'); }}
              className="bg-white text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#FFD23F] px-5 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-yellow-100 cursor-pointer"
            >
              GRAB SLICE • $5.99
            </button>
          </div>

          {/* Upgrade Combo Box */}
          <div className="flex-grow max-w-md bg-white comic-border p-6 md:p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] transform rotate-1 mx-auto lg:mx-0 w-full">
            <div className="bg-[#FF0055] text-white border-2 border-[#1a1c1c] inline-block px-4 py-1 rounded-xl mb-3 font-black text-xs uppercase shadow-[2px_2px_0px_0px_#111111]">
              POWER UP COMBO!
            </div>
            <h3 className="font-headline-lg text-2xl md:text-3xl mb-3 leading-tight font-black uppercase text-[#1a1c1c]">
              WAFFLE SUNDAE UPGRADE
            </h3>
            <div className="flex items-center gap-4 bg-yellow-50 border-2 border-[#1a1c1c] p-3 rounded-2xl">
              <img 
                alt="Strawberry Waffle Sundae" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)] cursor-pointer hover:scale-105 transition-transform" 
                onClick={() => handleGoToMenu('Desserts')}
                src="/foods/home/waffle-sundae.png"
              />
              <div>
                <span className="font-black text-sm text-[#1a1c1c] block">ADD TO ANY SHAKE</span>
                <span className="font-extrabold text-xs text-gray-700">Only +$6.99 Extra!</span>
              </div>
            </div>
            <button 
              onClick={() => onAddDirectItem && onAddDirectItem('waffle-sundae')}
              className="w-full mt-5 bg-[#FFD23F] text-[#1a1c1c] comic-border py-3.5 font-black text-lg shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 transition-all rounded-2xl cursor-pointer"
            >
              BOOST MY MEAL! • $6.99
            </button>
          </div>
        </div>
      </section>

      {/* 8. Today's Special — Magazine Cover Layout */}
      <section className="w-full bg-[#FFF8E7] border-4 border-[#1a1c1c] shadow-[12px_12px_0px_0px_#111111] rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-4 left-4 bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-4 py-1 rotate-[-6deg] font-black text-xs uppercase shadow-[2px_2px_0px_0px_#111111]">
          ISSUE #42 • DAILY COMIC SPECIAL
        </div>

        <div className="flex flex-col items-start gap-4 max-w-lg mt-6 md:mt-0">
          <span className="bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-1 rounded-full text-xs font-black uppercase">
            ‍ CHEF SPONGEBOB RECOMMENDATION
          </span>
          <h2 className="font-display-xl text-3xl md:text-5xl font-black uppercase tracking-tight text-[#1a1c1c]">
            THE CLASSIC TOON HERO!
          </h2>
          <p className="text-xs font-bold text-gray-800">
            A flame-grilled hero burger stacked with cheddar, crisp greens, toon pickles, and our secret sauce!
          </p>

          {/* Interactive Flavor Meter */}
          <div className="w-full bg-white border-3 border-[#1a1c1c] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#111111] space-y-2">
            <div className="flex justify-between items-center text-xs font-black">
              <span>JUICINESS LEVEL</span>
              <span className="text-[#FF0055]">99.8% OVERLOAD</span>
            </div>
            <div className="w-full h-3 bg-gray-200 border-2 border-[#1a1c1c] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF0055] w-[99%]"></div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleGoToMenu('Burger')}
            className="px-8 py-4 bg-[#34C759] text-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-sm uppercase rounded-2xl hover:bg-green-600 cursor-pointer"
          >
            ORDER TODAY'S SPECIAL • $14.99
          </button>
        </div>

        <div className="relative shrink-0 flex justify-center">
          <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center p-4">
            <img src="/foods/burger-classic.png" alt="The Classic Toon Hero" className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
      </section>

      {/* 9. Trending Foods — Sticker Board Bento Grid */}
      <section className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-[#00F0FF] border-2 border-[#1a1c1c] px-3 py-1 rounded-full font-black text-xs uppercase shadow-[2px_2px_0px_0px_#111111]">
            STICKER BENTO BOARD
          </span>
          <h2 className="font-display-xl text-3xl md:text-4xl font-black uppercase text-[#1a1c1c]">
            TRENDING TOON BITES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FF70A6] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between text-white rotate-[-1deg]">
            <span className="absolute top-3 right-3 bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-1 font-black text-[10px] uppercase rounded-full rotate-[12deg]">
             CRISPY CATCH
            </span>
            <img src="/foods/home/fish-burger.png" alt="Crispy Fish Hero Burger" className="w-40 h-40 object-contain mx-auto my-4" />
            <div>
              <h3 className="font-black text-xl uppercase">FISH HERO BURGER</h3>
              <p className="text-xs font-bold opacity-90">Crispy fish, cool slaw, and a punchy hero sauce!</p>
            </div>
          </div>

          <div className="bg-[#00F0FF] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between text-[#1a1c1c] rotate-[1deg]">
            <span className="absolute top-3 right-3 bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-3 py-1 font-black text-[10px] uppercase rounded-full rotate-[-8deg]">
               FRESH POWER
            </span>
            <img src="/foods/home/chicken-salad.png" alt="Hero Chicken Salad" className="w-40 h-40 object-contain mx-auto my-4" />
            <div>
              <h3 className="font-black text-xl uppercase">HERO CHICKEN SALAD</h3>
              <p className="text-xs font-bold text-gray-800">Fresh greens, grilled chicken, and crunchy color!</p>
            </div>
          </div>

          <div className="bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between text-[#1a1c1c]">
            <span className="absolute top-3 right-3 bg-[#34C759] text-white border-2 border-[#1a1c1c] px-3 py-1 font-black text-[10px] uppercase rounded-full rotate-[5deg]">
               LOADED VALUE
            </span>
            <img src="/foods/home/loaded-nachos.png" alt="Loaded Power Nachos" className="w-40 h-40 object-contain mx-auto my-4" />
            <div>
              <h3 className="font-black text-xl uppercase">LOADED POWER NACHOS</h3>
              <p className="text-xs font-bold text-gray-800">Crunchy chips stacked with cheese, salsa, and jalapeños!</p>
            </div>
          </div>
        </div>
      </section>


      {/* 12. Recommended For You — Big Comic Combo Cards */}
      <section className="w-full bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[12px_12px_0px_0px_#111111] rounded-3xl p-6 md:p-10">
        <div className="flex flex-col items-center mb-8 text-center gap-2">
          <span className="bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-4 py-1 rounded-full text-xs font-black uppercase shadow-[2px_2px_0px_0px_#111111] rotate-[-2deg]">
            SPECIAL HERO DISCOUNTS
          </span>
          <h2 className="font-display-xl text-3xl md:text-5xl font-black uppercase text-[#1a1c1c]">
            RECOMMENDED HERO COMBOS
          </h2>
          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            STACKED COMBO BUNDLES FOR MAXIMUM CARTOON HP RECOVERY!
          </p>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              id: "combo_adventurer",
              title: "ADVENTURER BUNDLE",
              desc: "1x Monster Burger + 1x Sidekick Fries + 1x Toon Shake",
              price: 18.99,
              oldPrice: "$24.50",
              comboImage: "/foods/combo_adventurer.png",
              badge: "25% OFF BUNDLE",
              badgeBg: "bg-[#FF0055] text-white",
              angle: "rotate-[-2deg]"
            },
            {
              id: "combo_titans_party",
              title: "TITANS PARTY PACK",
              desc: "2x Pepperoni Slices + 4x Fizzy Sodas + 1x Garlic Dip",
              price: 32.50,
              oldPrice: "$42.00",
              comboImage: "/foods/combo_titans_party.png",
              badge: "FAMILY PARTY DEAL",
              badgeBg: "bg-[#00F0FF] text-[#1a1c1c]",
              angle: "rotate-[2deg]"
            },
            {
              id: "combo_pokemon_chef",
              title: "POKÉMON CHEFS SPECIAL",
              desc: "1x Comic Pasta Bowl + 1x Sidekick Fries + 1x Shake",
              price: 16.00,
              oldPrice: "$21.00",
              comboImage: "/foods/combo_pokemon_chef.png",
              badge: "CHEF SPECIAL",
              badgeBg: "bg-[#34C759] text-white",
              angle: "rotate-[-1deg]"
            }
          ].map((combo, i) => (
            <div key={i} className={`bg-white border-4 border-[#1a1c1c] p-6 rounded-3xl shadow-[8px_8px_0px_0px_#111111] ${combo.angle} flex flex-col justify-between hover:scale-105 transition-transform duration-300`}>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className={`${combo.badgeBg} border-2 border-[#1a1c1c] px-3 py-1 rounded-full text-xs font-black uppercase shadow-[2px_2px_0px_0px_#111111]`}>
                    {combo.badge}
                  </span>
                  <span className="bg-[#FFD23F] text-[#1a1c1c] border border-[#1a1c1c] px-2.5 py-0.5 rounded text-[10px] font-black uppercase">
                    REAL COMBO MEAL 
                  </span>
                </div>

                {/* Real Photorealistic Combo Meal Image Container */}
                <div className="w-full h-52 md:h-60 flex items-center justify-center p-3 mb-4 relative">
                  <img src={combo.comboImage} alt={combo.title} className="w-full h-full object-contain drop-shadow-[6px_6px_0px_rgba(0,0,0,0.15)] hover:scale-110 transition-transform duration-300" />
                </div>

                <h3 className="font-headline-md text-xl md:text-2xl font-black uppercase text-[#1a1c1c] mb-1">{combo.title}</h3>
                <p className="text-xs font-bold text-gray-700 mb-4">{combo.desc}</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t-3 border-dashed border-[#1a1c1c] mt-2">
                <div>
                  <span className="font-black text-xl text-[#FF0055] block">${combo.price.toFixed(2)}</span>
                  <span className="text-xs font-bold text-gray-400 line-through">{combo.oldPrice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onAddToCart) {
                      onAddToCart(combo.id, { [combo.title]: true }, 1, combo.price);
                    } else if (onAddDirectItem) {
                      onAddDirectItem(combo.id);
                    }
                  }}
                  className="px-5 py-3 bg-[#34C759] text-white border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] font-black text-xs uppercase rounded-xl hover:bg-green-600 cursor-pointer"
                >
                  GRAB COMBO BUNDLE 
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
