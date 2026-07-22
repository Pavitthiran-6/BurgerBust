import React, { useState } from 'react';
import FoodCard from '../components/FoodCard';

export default function FoodDetailView({
  menuItems = [],
  loading = false,
  error = null,
  itemId,
  onViewDetail,
  onAddToCart,
  favorites = [],
  onToggleFavorite,
  showToast
}) {
  const currentItem = menuItems.find(item => item.id === itemId);

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});

  if (!currentItem) {
    return (
      <div className="mx-auto my-12 max-w-xl rounded-3xl border-4 border-[#1a1c1c] bg-white p-10 text-center font-black">
        {loading ? 'Loading product details…' : error || 'Product not found'}
      </div>
    );
  }

  // Price calculations
  const optionsPrice = Object.values(selectedOptions).reduce((sum, val) => {
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);

  const unitPrice = currentItem.price + optionsPrice;
  const totalPrice = unitPrice * quantity;

  const handleToggleOption = (name, price) => {
    setSelectedOptions(prev => {
      const updated = { ...prev };
      if (updated[name] !== undefined) {
        delete updated[name];
      } else {
        updated[name] = price;
      }
      return updated;
    });
  };

  const handleAddCurrentToCart = () => {
    if (onAddToCart) {
      onAddToCart(currentItem.id, selectedOptions, quantity);
      if (showToast) showToast(`Added ${quantity}x ${currentItem.name} to Cart! `, 'success');
    }
  };

  const handleAddComboToCart = () => {
    if (onAddToCart) {
      // Adding the combo bundle to cart
      onAddToCart(
        currentItem.id,
        {
          "Adventurer's Combo": true,
          "Ninja Fries": true,
          "Mystical Soda": true
        },
        1,
        18.99 // Set the custom price for combo
      );
      if (showToast) showToast(`Claimed Adventurer's Combo Bundle for $18.99! ‍️`, 'success');
    }
  };

  const isFav = favorites.includes(currentItem.id);

  // Sides configuration
  const sides = [
    {
      id: "side-fries",
      name: "Ninja Fries",
      price: 3.49,
      desc: "Crispy, golden, and silent... until you crunch them. Dusted with ancient sea salt.",
      image: "/foods/home/fries.png"
    },
    {
      id: "side-drumstick",
      name: "Dragon Drumstick",
      price: 4.99,
      desc: "Fried to perfection with a secret blend of 9 mystical herbs and spices.",
      image: "/foods/home/fried-chicken.png"
    }
  ];

  // Nine Talisman Toppings
  const talismanToppings = [
    { name: "Extra Cheese", price: 1.50, image: "/toppings/extra-cheese.png" },
    { name: "Jalapeños", price: 0.75, image: "/toppings/jalapenos.png" },
    { name: "Crispy Bacon", price: 1.50, image: "/toppings/crispy-bacon.png" },
    { name: "Shadow Onions", price: 0.50, image: "/toppings/shadow-onions.png" },
    { name: "Toon Pickles", price: 0.50, image: "/toppings/toon-pickles.png" },
    { name: "Mystic Mushrooms", price: 1.25, image: "/toppings/mystic-mushrooms.png" },
    { name: "Solar Egg", price: 1.25, image: "/toppings/fried-egg.png" },
    { name: "Emerald Avocado", price: 1.50, image: "/toppings/avocado.png" },
    { name: "Sunfire Pineapple", price: 1.00, image: "/toppings/pineapple.png" }
  ];

  // Uncle's Secret Sauces
  const secretSauces = [
    { name: "Dragon Breath Hot Sauce", price: 1.00, desc: "Fiery heat that lingers like an ancient curse. Not for the faint of heart.", icon: "🔥", color: "text-red-500" },
    { name: "Shadow Glaze", price: 1.00, desc: "A mysterious, savory soy-garlic blend that disappears as fast as a ninja.", icon: "🏺", color: "text-[#7f7661]" },
    { name: "Chi-Cheese Dip", price: 1.25, desc: "Liquid gold. Pure comfort to restore your inner balance after a long battle.", icon: "🧀", color: "text-[#ffd23f]" }
  ];

  return (
    <div className="w-full relative min-h-screen">
      {/* Dynamic Mockup Styles Embedded */}
      <style>{`
        .comic-panel {
          background-color: #ffffff;
          border: 4px solid #111111;
          box-shadow: 8px 8px 0px 0px #111111;
          position: relative;
        }

        .comic-button {
          background-color: #ffd23f;
          border: 4px solid #111111;
          box-shadow: 6px 6px 0px 0px #111111;
          transition: all 0.1s ease-in-out;
        }

        .comic-button:hover {
          transform: translate(4px, 4px);
          box-shadow: 2px 2px 0px 0px #111111;
        }
        
        .talisman-badge {
          clip-path: polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%);
        }

        .ancient-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23111111' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        
        .scroll-bg {
          background-color: #fff8e7;
          position: relative;
        }
        
        .scroll-bg::before, .scroll-bg::after {
          content: '';
          position: absolute;
          left: -10px;
          right: -10px;
          height: 30px;
          background-color: #d1c5ad;
          border: 4px solid #111111;
          border-radius: 20px;
          z-index: -1;
        }
        .scroll-bg::before { top: -15px; }
        .scroll-bg::after { bottom: -15px; }

        .treasure-map {
          background-color: #f4e8c1;
          background-image: 
            radial-gradient(circle at 100% 150%, #f4e8c1 24%, #111111 25%, #f4e8c1 26%),
            radial-gradient(circle at 0 150%, #f4e8c1 24%, #111111 25%, #f4e8c1 26%),
            radial-gradient(circle at 50% 100%, #111111 10%, #f4e8c1 11%);
          background-size: 50px 25px;
          border: 4px dashed #111111;
        }

        .action-bubble {
          clip-path: polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%);
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        .wiggle-hover:hover {
          animation: wiggle 0.3s ease-in-out infinite;
        }
        
        .speed-lines {
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            #111111 10px,
            #111111 11px
          );
          opacity: 0.05;
        }
      `}</style>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-12">
        
        {/* Hero Section: Dynamic Description & Image */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Description scroll panel */}
          <div className="lg:col-span-5 comic-panel bg-surface-container-lowest p-6 md:p-8 relative z-10">
            <div className="absolute top-[-10px] left-[-10px] right-[-10px] h-[20px] bg-primary-container comic-border z-[-1]"></div>
            <div className="absolute bottom-[-10px] left-[-10px] right-[-10px] h-[20px] bg-primary-container comic-border z-[-1]"></div>
            <div className="absolute inset-0 speed-lines pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="inline-flex items-center gap-1.5 bg-primary-container text-on-background font-label-bold px-3 py-1 comic-border w-max uppercase transform -rotate-2 text-xs font-black">
                <span>⚡</span>
                Legendary Item
              </div>
              
              <h1 className="font-display-xl-mobile md:font-display-xl text-3xl md:text-5xl text-on-background uppercase italic leading-none font-black">
                {currentItem.name}
              </h1>
              
              <p className="font-body-lg text-sm text-on-surface-variant font-semibold border-l-4 border-on-background pl-3 leading-relaxed">
                {currentItem.desc}
              </p>
              
              <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
                <span className="font-headline-lg text-2xl md:text-3xl font-extrabold text-on-background">${totalPrice.toFixed(2)}</span>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-surface-container comic-border p-1 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="px-2 py-1.5 hover:bg-primary-container rounded transition-colors font-black text-sm"
                    >
                      —
                    </button>
                    <span className="font-label-bold px-3 text-sm">{quantity}</span>
                    <button 
                      type="button"
                      onClick={() => setQuantity(quantity + 1)} 
                      className="px-2 py-1.5 hover:bg-primary-container rounded transition-colors font-black text-sm"
                    >
                      ＋
                    </button>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handleAddCurrentToCart}
                    className="comic-button font-headline-md text-sm px-6 py-3 uppercase tracking-wider flex items-center font-black cursor-pointer active:scale-95"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Large Image with Talisman Stats Badges */}
          <div className="lg:col-span-7 relative flex justify-center items-center min-h-[400px]">
            {/* Main Item Image */}
            <img 
              alt={currentItem.name} 
              className="w-full max-w-[450px] object-contain drop-shadow-2xl z-20 transform hover:scale-105 transition-transform duration-300" 
              src={currentItem.image}
            />

            {/* Favorite toggle floating */}
            <button
              type="button"
              onClick={() => onToggleFavorite && onToggleFavorite(currentItem.id)}
              className="absolute top-4 left-4 z-30 w-12 h-12 bg-white border-3 border-black rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] cursor-pointer hover:scale-110 transition-transform"
            >
              <span 
                className={`material-symbols-outlined text-2xl ${isFav ? 'text-red-500' : 'text-black'}`} 
                style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
            </button>
            
            {/* Nutrition Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
              <div className="comic-border p-2 flex items-center justify-center font-label-bold flex-col w-20 h-20 wiggle-hover shadow-[4px_4px_0px_0px_#111111] rotate-6 bg-[#fff8e7] text-[#111111]">
                <span className="text-3xl mb-1">🔥</span>
                <span className="text-[10px] font-black uppercase">850 Cal</span>
              </div>
              <div className="comic-border p-2 flex items-center justify-center font-label-bold flex-col w-20 h-20 wiggle-hover shadow-[4px_4px_0px_0px_#111111] -rotate-3 bg-[#fff8e7] text-[#111111]">
                <span className="text-3xl mb-1">💪</span>
                <span className="text-[10px] font-black uppercase">42g Pro</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: The Shadowkhan Sides */}
        <section className="mt-4">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-headline-lg text-xl md:text-2xl font-black uppercase italic border-b-4 border-on-background pb-1 inline-block bg-white comic-border px-3 py-1.5 comic-shadow transform -rotate-1">
              The Shadowkhan Sides
            </h2>
            <div className="h-1 flex-grow bg-on-background"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sides.map((side) => {
              const isSelected = !!selectedOptions[side.name];
              return (
                <div 
                  key={side.id} 
                  onClick={() => handleToggleOption(side.name, side.price)}
                  className={`comic-panel p-4 flex flex-col md:flex-row gap-4 items-center group cursor-pointer transition-colors ${
                    isSelected ? 'bg-yellow-50' : 'hover:bg-surface-bright'
                  }`}
                >
                  <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center p-1 relative group-hover:rotate-6 transition-transform">
                    <img alt={side.name} className="w-full h-full object-contain drop-shadow-lg z-10" src={side.image} />
                  </div>
                  <div className="flex-grow flex flex-col gap-1 text-center md:text-left w-full">
                    <h3 className="font-headline-md text-base font-black uppercase">{side.name}</h3>
                    <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">{side.desc}</p>
                    <div className="mt-2 flex justify-between items-center w-full">
                      <span className="font-label-bold text-xs font-black bg-primary-container comic-border px-2 py-0.5 transform rotate-2">
                        +${side.price.toFixed(2)}
                      </span>
                      <button 
                        type="button"
                        className={`comic-button p-1 rounded-full flex items-center justify-center ${isSelected ? 'bg-green-400' : 'bg-[#ffd23f]'}`}
                      >
                        <span className="font-black text-xs">
                          {isSelected ? '✅' : '＋'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: The Nine Talisman Toppings */}
        <section className="mt-4">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-headline-lg text-xl md:text-2xl font-black uppercase italic border-b-4 border-on-background pb-1 inline-block bg-white comic-border px-3 py-1.5 comic-shadow transform rotate-1">
              The Nine Talisman Toppings
            </h2>
            <div className="h-1 flex-grow bg-on-background"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 gap-4">
            {talismanToppings.map((top, i) => {
              const isSelected = !!selectedOptions[top.name];
              return (
                <div 
                  key={i} 
                  onClick={() => handleToggleOption(top.name, top.price)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className={`w-28 h-28 flex items-center justify-center p-1 relative rounded-2xl group-hover:scale-110 transition-transform ${
                    isSelected ? 'ring-4 ring-green-400 ring-offset-2' : ''
                  }`}>
                    <img
                      alt={top.name}
                      className="relative block w-full h-full object-contain z-10 drop-shadow-lg"
                      src={top.image}
                    />
                  </div>
                  <span className="font-label-bold text-[10px] uppercase text-center bg-white comic-border px-2 py-0.5 w-full transform -rotate-2 mt-2 font-black">
                    {top.name} (+${top.price.toFixed(2)})
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Uncle's Secret Sauces */}
        <section className="mt-4">
          <div className="scroll-bg comic-border comic-shadow p-6 max-w-3xl mx-auto rounded-3xl">
            <h2 className="font-display-xl-mobile md:font-headline-lg text-center uppercase italic border-b-4 border-on-background pb-1 mb-4 font-black text-xl md:text-2xl">
              Uncle's Secret Sauces
            </h2>
            <p className="text-center font-label-bold mb-4 italic text-xs">"One MORE thing!" - Uncle</p>
            
            <ul className="flex flex-col gap-4">
              {secretSauces.map((sauce, idx) => {
                const isSelected = !!selectedOptions[sauce.name];
                return (
                  <li 
                    key={idx}
                    onClick={() => handleToggleOption(sauce.name, sauce.price)}
                    className={`flex items-center gap-3 bg-white p-3 comic-border rounded-2xl transform cursor-pointer transition-transform hover:scale-[1.01] ${
                      idx % 2 === 0 ? 'rotate-1' : '-rotate-1'
                    } ${isSelected ? 'bg-yellow-50 border-green-500' : ''}`}
                  >
                    <span className="text-sm font-black bg-primary-container px-2.5 py-1 comic-border rounded-xl uppercase shrink-0">
                      {sauce.icon}
                    </span>
                    <div>
                      <h4 className="font-headline-md text-sm font-black uppercase">{sauce.name}</h4>
                      <p className="font-body-md text-xs text-gray-500">{sauce.desc}</p>
                    </div>
                    <button 
                      type="button"
                      className={`comic-button ml-auto px-4 py-2 font-black uppercase text-xs rounded-xl ${
                        isSelected ? 'bg-green-400' : 'bg-[#ffd23f]'
                      }`}
                    >
                      {isSelected ? '✅ Added' : `+$${sauce.price.toFixed(2)}`}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Section: Adventurer's Combo Bundle */}
        <section className="mt-4 treasure-map p-6 md:p-8 comic-shadow relative overflow-hidden rounded-[2.5rem]">
          <div className="absolute top-0 right-0 p-2 text-3xl opacity-50 transform rotate-12">★</div>
          <div className="absolute bottom-0 left-0 p-2 text-3xl opacity-50 transform -rotate-12">★</div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-[#ba1a1a] text-white comic-border px-4 py-1 font-label-bold uppercase transform -rotate-3 mb-4 action-bubble text-sm font-black shadow-[2px_2px_0px_0px_#111111]">
                POW! BIG SAVINGS!
              </div>
              <h2 className="font-display-xl-mobile md:font-display-xl uppercase italic leading-none mb-3 text-[#111111] font-black text-3xl md:text-5xl drop-shadow-[2px_2px_0px_#ffffff]">
                Adventurer's Combo Bundle
              </h2>
              <p className="font-body-lg font-bold bg-white p-2.5 comic-border inline-block mb-4 transform rotate-1 text-xs md:text-sm">
                Get the Toon Boss Burger, Ninja Fries, and a Mystical Soda for one legendary price!
              </p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <span className="font-display-xl-mobile font-extrabold line-through opacity-50 text-xl">$22.99</span>
                <span className="font-display-xl font-extrabold text-[#ba1a1a] text-4xl md:text-5xl drop-shadow-[2px_2px_0px_#111111]">$18.99</span>
              </div>
              
              <button 
                type="button"
                onClick={handleAddComboToCart}
                className="mt-6 comic-button font-headline-lg text-base px-8 py-3.5 uppercase tracking-wider wiggle-hover flex items-center justify-center gap-1.5 w-full md:w-auto bg-[#ba1a1a] text-white hover:bg-[#93000a] font-black cursor-pointer shadow-[4px_4px_0px_0px_#111111]"
              >
                Claim Treasure!
              </button>
            </div>
            
            {/* Overlapping Combo Images */}
            <div className="flex-1 flex justify-center items-center relative h-64 w-full">
              <img 
                alt="Combo Drink" 
                className="absolute w-28 md:w-36 object-contain drop-shadow-xl z-10 right-4 bottom-0 transform rotate-6" 
                src="/foods/home/soft-drink.png"
              />
              <img 
                alt="Combo Burger" 
                className="absolute w-36 md:w-48 object-contain drop-shadow-xl z-30 bottom-4 hover:scale-110 transition-transform" 
                src="/foods/burger-boss.png"
              />
              <img 
                alt="Combo Fries" 
                className="absolute w-28 md:w-36 object-contain drop-shadow-xl z-20 left-4 bottom-2 transform -rotate-12" 
                src="/foods/home/fries.png"
              />
            </div>
          </div>
        </section>

        {/* Section: More to Love */}
        <section className="mt-8">
          <h2 className="mb-6 font-headline-lg text-2xl font-black uppercase text-[#1a1c1c]">More To Love</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {menuItems.filter(item => item.id !== currentItem.id && item.category === currentItem.category).slice(0, 4).map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onViewDetail={(id) => {
                  if (onViewDetail) {
                    onViewDetail(id);
                    window.scrollTo(0, 0);
                  }
                }}
              />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
