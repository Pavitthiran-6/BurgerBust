import React from 'react';

export default function CategoriesView({
  categories: categoryData = [],
  menuItems = [],
  loading = false,
  error = null,
  setActiveCategory,
  setCurrentPage,
}) {
  const styles = [
    { color: "bg-[#FFD23F]", icon: "lunch_dining" },
    { color: "bg-[#FF0055]", textColor: "text-white", icon: "local_pizza" },
    { color: "bg-[#34C759]", textColor: "text-white", icon: "kebab_dining" },
    { color: "bg-[#00F0FF]", icon: "fastfood" },
    { color: "bg-[#70D6FF]", icon: "local_bar" },
    { color: "bg-[#FF70A6]", textColor: "text-white", icon: "ramen_dining" },
  ];
  const categories = categoryData.map((category, index) => ({
    ...category,
    label: category.name.toUpperCase(),
    count: `${menuItems.filter(item => item.categoryUuid === category.uuid).length} Items`,
    ...styles[index % styles.length],
  }));

  const handleSelect = (catName) => {
    if (setActiveCategory) setActiveCategory(catName);
    if (setCurrentPage) setCurrentPage('menu');
  };

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-6xl mx-auto px-4">
      {/* Header Banner */}
      <div className="w-full bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 text-center mb-8">
        <span className="bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-2 rotate-[-2deg]">
          CARTOON FLAVORS ENGINE
        </span>
        <h1 className="font-display-xl text-3xl md:text-5xl font-black uppercase tracking-tight">
          MULTIVERSE FLAVORS HUB
        </h1>
        <p className="text-xs font-bold mt-1">CHOOSE YOUR CARTOON FOOD DIMENSION!</p>
      </div>

      {loading && categories.length === 0 && (
        <div className="w-full rounded-3xl border-4 border-[#1a1c1c] bg-white p-10 text-center font-black uppercase">
          Loading categories…
        </div>
      )}
      {error && (
        <div className="mb-6 w-full rounded-3xl border-4 border-[#1a1c1c] bg-red-100 p-5 text-center font-black text-red-700">
          {error}
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {categories.map((c, i) => (
          <div
            key={c.uuid || i}
            onClick={() => handleSelect(c.name)}
            className={`${c.color} border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-8 flex flex-col justify-between items-start min-h-[200px] cursor-pointer hover:scale-105 transition-transform ${c.textColor || 'text-[#1a1c1c]'}`}
          >
            <div className="w-14 h-14 bg-white text-[#1a1c1c] border-3 border-[#1a1c1c] rounded-2xl flex items-center justify-center text-3xl font-black shadow-[3px_3px_0px_0px_#111111]">
              <span className="material-symbols-outlined text-3xl">{c.icon}</span>
            </div>

            <div>
              <h3 className="font-display-xl text-2xl font-black uppercase mb-1">{c.label}</h3>
              <span className="text-xs font-bold opacity-90 block">{c.count} • EXPLORE CATEGORY </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
