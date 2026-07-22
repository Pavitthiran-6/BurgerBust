import React, { useState } from 'react';

export default function RewardsView({ rewardPoints = 0, showToast, setCurrentPage }) {
  const points = rewardPoints;
  const [streakDays] = useState(() => parseInt(localStorage.getItem('burger_streak_days') || '5'));
  const [spinning, setSpinning] = useState(false);
  const [spinPrize, setSpinPrize] = useState(null);
  const [lastDailyClaim, setLastDailyClaim] = useState(() => localStorage.getItem('burger_last_daily_claim') || null);
  const [spinCooldown, setSpinCooldown] = useState(() => !!localStorage.getItem('burger_spin_cooldown'));

  const canClaimDaily = !lastDailyClaim || (Date.now() - parseInt(lastDailyClaim)) > 24 * 60 * 60 * 1000;

  const handleDailyClaim = () => {
    if (!canClaimDaily) { if (showToast) showToast('Daily reward already claimed! Come back tomorrow.', 'warning'); return; }
    const now = Date.now().toString();
    setLastDailyClaim(now);
    localStorage.setItem('burger_last_daily_claim', now);
    if (showToast) showToast('Daily activity recorded. Reward points are earned from delivered orders.', 'success');
  };

  const prizes = [
    { code: "TITANS50", text: "50% OFF DESSERTS" },
    { code: "FREEFRIES", text: "FREE SIDEKICK FRIES" },
    { code: "CYBORG100", text: "ZERO DELIVERY FEE" },
    { code: "BEASTBOY10", text: "$10 INSTANT VOUCHER" }
  ];

  const quests = [
    { title: "ORDER 3 MONSTER PIZZAS", reward: "+300 PTS", progress: "2/3 COMPLETED", done: false },
    { title: "TRY DRAGON BREATH SAUCE", reward: "+150 PTS", progress: "1/1 COMPLETED", done: true },
    { title: "MAINTAIN 7-DAY STREAK", reward: "+500 PTS", progress: "5/7 DAYS", done: false }
  ];

  const badges = [
    { name: "BOULDER BADGE", requirement: "Order 5 Monster Burgers", icon: "shield", unlocked: true },
    { name: "CASCADE BADGE", requirement: "Order 10 Soft Drinks", icon: "water_drop", unlocked: true },
    { name: "THUNDER BADGE", requirement: "Order 3 Adventurer Bundles", icon: "bolt", unlocked: true },
    { name: "RAINBOW BADGE", requirement: "Try All Toon Sauces", icon: "palette", unlocked: false },
    { name: "SOUL BADGE", requirement: "Maintain 7-Day Order Streak", icon: "local_fire_department", unlocked: false },
    { name: "VOLCANO BADGE", requirement: "Review 10 Tasty Bites", icon: "whatshot", unlocked: false }
  ];

  const redeemableItems = [
    { title: "FREE SIDEKICK FRIES", cost: 500, icon: "fastfood" },
    { title: "DRAGON BREATH SAUCE", cost: 350, icon: "local_fire_department" },
    { title: "$10 VOUCHER CARD", cost: 1000, icon: "card_giftcard" },
    { title: "LEGENDARY BURGER BOX", cost: 1400, icon: "restaurant" }
  ];

  const leaderboard = [
    { rank: "1ST", name: "ROBIN THE LEADER", score: "99,999 PTS", badge: "bg-[#FF0055] text-white" },
    { rank: "2ND", name: "CYBORG BOOM", score: "88,500 PTS", badge: "bg-[#00F0FF] text-[#1a1c1c]" },
    { rank: "3RD", name: "BEAST BOY WAFFLE", score: "77,200 PTS", badge: "bg-[#34C759] text-white" },
    { rank: "4TH", name: "YOU (HERO TRAINEE)", score: `${points.toLocaleString()} PTS`, badge: "bg-[#FFD23F] text-[#1a1c1c]" }
  ];

  const handleSpin = () => {
    if (spinning || spinCooldown) { if (showToast) showToast('Lucky Spin is on cooldown! Come back in 24 hours.', 'warning'); return; }
    setSpinning(true);
    setSpinPrize(null);

    setTimeout(() => {
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      setSpinPrize(randomPrize);
      setSpinning(false);
      setSpinCooldown(true);
      localStorage.setItem('burger_spin_cooldown', '1');
      if (showToast) showToast(`BOOM! Won ${randomPrize.text}! Code: ${randomPrize.code}`, 'success');
    }, 1800);
  };

  const handleRedeem = (item) => {
    if (points >= item.cost) {
      if (showToast) showToast('Apply reward points during checkout to keep totals server-verified.', "info");
      if (setCurrentPage) setCurrentPage('checkout');
    } else {
      if (showToast) showToast("Not enough Pokeball Points!", "error");
    }
  };

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-6xl mx-auto px-4">
      {/* Pokemon Header & Trainer Card */}
      <div className="w-full bg-[#CC0000] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 relative overflow-hidden mb-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5 z-10">
          <div className="w-20 h-20 bg-white text-[#CC0000] border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] rounded-full flex items-center justify-center font-black text-3xl shrink-0">
            <span className="material-symbols-outlined text-4xl">military_tech</span>
          </div>
          <div>
            <div className="bg-[#FFCC00] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-1">
              HERO ACADEMY CADET
            </div>
            <h1 className="font-display-xl text-3xl md:text-5xl uppercase font-black tracking-tight text-white drop-shadow-[2px_2px_0px_#1a1c1c]">
              REWARDS CENTER
            </h1>
            <p className="text-xs font-black uppercase tracking-wider text-yellow-200">
              POKÉMON POINTS, DAILY STREAKS, QUESTS & GYM BADGES!
            </p>
          </div>
        </div>

        <div className="bg-white text-[#1a1c1c] border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] p-4 rounded-2xl w-full md:w-72 shrink-0 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-black">
            <span>POKÉBALL POINTS</span>
            <span className="text-[#CC0000] font-black text-lg">{points.toLocaleString()} PTS</span>
          </div>
          <div className="w-full h-3 bg-gray-200 border-2 border-[#1a1c1c] rounded-full overflow-hidden">
            <div className="h-full bg-[#FFCC00] border-r-2 border-[#1a1c1c] transition-all duration-700" style={{ width: `${Math.min(100, (points / 2000) * 100)}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-500">
            <span>LVL {Math.floor(points / 500) + 1} HERO</span>
            <span>{points % 500}/{500} XP to next level</span>
          </div>
          <button type="button" onClick={handleDailyClaim}
            className={`mt-1 py-2 border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer ${canClaimDaily ? 'bg-[#FFCC00] text-[#1a1c1c]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            {canClaimDaily ? ' CLAIM DAILY REWARD (+50 PTS)' : ' DAILY REWARD CLAIMED'}
          </button>
        </div>
      </div>

      {/* Daily Streak & Quest Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mb-10 items-start">
        <div className="lg:col-span-6 bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] p-6 rounded-3xl flex flex-col justify-between gap-4">
          <div>
            <span className="bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-2">
               DAILY LOGIN STREAK
            </span>
            <h3 className="font-black text-xl uppercase text-[#1a1c1c]">
              STREAK: {streakDays}/7 DAYS ACTIVE!
            </h3>
          </div>

          <div className="flex gap-2 items-center justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div 
                key={day}
                className={`w-9 h-9 border-2 border-[#1a1c1c] rounded-xl flex items-center justify-center font-black text-xs ${
                  day <= streakDays ? 'bg-[#34C759] text-white' : 'bg-white text-gray-400'
                }`}
              >
                D{day}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDailyClaim}
            className="w-full py-3 bg-[#00F0FF] text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] font-black text-xs uppercase rounded-xl hover:bg-cyan-300 cursor-pointer"
          >
            CHECK DAILY ACTIVITY
          </button>
        </div>

        {/* Quest Challenges */}
        <div className="lg:col-span-6 bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] p-6 rounded-3xl space-y-4">
          <h3 className="font-black text-lg uppercase border-b-3 border-[#1a1c1c] pb-2 text-[#1a1c1c]">
            WEEKLY QUEST CHALLENGES
          </h3>

          <div className="space-y-3">
            {quests.map((q, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[#fcfbf7] border-2 border-[#1a1c1c] p-3 rounded-2xl">
                <div>
                  <h4 className="font-black text-xs uppercase text-[#1a1c1c]">{q.title}</h4>
                  <span className="text-[10px] font-bold text-gray-600">{q.progress}</span>
                </div>
                <span className={`px-3 py-1 rounded-xl font-black text-xs border ${
                  q.done ? 'bg-green-100 text-green-800 border-green-700' : 'bg-yellow-100 text-yellow-800 border-yellow-700'
                }`}>
                  {q.done ? 'COMPLETED' : q.reward}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Spin & Win Wheel + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mb-10 items-start">
        {/* Cyborg's Lucky Spin & Win Wheel */}
        <div className="lg:col-span-7 bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 rounded-3xl flex flex-col items-center gap-5 text-center">
          <div className="border-b-4 border-[#1a1c1c] pb-3 w-full flex justify-between items-center">
            <h2 className="font-headline-md text-xl font-black uppercase text-[#1a1c1c] flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#FF0055]">casino</span>
              CYBORG'S SPIN & WIN WHEEL
            </h2>
          </div>

          <div className={`w-44 h-44 bg-[#FF0055] border-6 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] rounded-full flex items-center justify-center relative ${
            spinning ? 'animate-spin' : ''
          }`}>
            <div className="w-32 h-32 bg-[#FFD23F] border-4 border-[#1a1c1c] rounded-full flex items-center justify-center font-black text-2xl text-[#1a1c1c]">
              <span className="material-symbols-outlined text-5xl">stars</span>
            </div>
          </div>

          {spinPrize && (
            <div className="bg-[#34C759] text-white border-3 border-[#1a1c1c] p-3 rounded-2xl w-full font-black text-xs uppercase animate-bounce">
               WON: {spinPrize.text}! CODE: <span className="underline">{spinPrize.code}</span> (+100 PTS)
            </div>
          )}

          <button
            type="button"
            onClick={handleSpin}
            disabled={spinning}
            className="w-full py-3.5 bg-[#FFD23F] text-[#1a1c1c] border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-base uppercase rounded-2xl hover:bg-yellow-400 cursor-pointer"
          >
            {spinning ? 'SPINNING WHEEL...' : 'SPIN FOR BONUS POINTS!'}
          </button>
        </div>

        {/* Titans Leaderboard */}
        <div className="lg:col-span-5 bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 rounded-3xl flex flex-col justify-between gap-4">
          <div className="border-b-4 border-[#1a1c1c] pb-3">
            <h2 className="font-headline-md text-xl font-black uppercase text-[#1a1c1c] flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#CC0000]">leaderboard</span>
              HERO LEADERBOARD
            </h2>
          </div>

          <div className="space-y-3">
            {leaderboard.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[#fcfbf7] border-2 border-[#1a1c1c] p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-black text-xs border border-[#1a1c1c] ${item.badge}`}>
                    {item.rank}
                  </span>
                  <span className="font-black text-xs uppercase text-[#1a1c1c]">{item.name}</span>
                </div>
                <span className="font-black text-xs text-[#CC0000]">{item.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gym Badges Grid */}
      <div className="w-full mb-10">
        <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-[#CC0000] font-black">military_tech</span>
          GYM BADGE COLLECTION
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((b, i) => (
            <div
              key={i}
              className={`border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] p-4 rounded-2xl flex flex-col items-center text-center gap-2 ${
                b.unlocked ? 'bg-white' : 'bg-gray-200 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-full border-3 border-[#1a1c1c] flex items-center justify-center text-xl font-black ${
                b.unlocked ? 'bg-[#FFCC00] text-[#1a1c1c]' : 'bg-gray-400 text-gray-700'
              }`}>
                <span className="material-symbols-outlined text-2xl">{b.icon}</span>
              </div>
              <span className="font-black text-xs uppercase text-[#1a1c1c]">{b.name}</span>
              <span className="text-[10px] font-bold text-gray-700">{b.requirement}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Redeemable Rewards */}
      <div className="w-full">
        <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-[#CC0000] font-black">redeem</span>
          REDEEM POKÉBALL TREATS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {redeemableItems.map((item, idx) => (
            <div key={idx} className="bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] rounded-3xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#FFCC00] border-3 border-[#1a1c1c] rounded-2xl flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl font-black text-[#1a1c1c]">{item.icon}</span>
                </div>
                <h3 className="font-black text-base uppercase text-[#1a1c1c] mb-1">{item.title}</h3>
                <span className="text-xs font-black text-[#CC0000] block mb-4">{item.cost} PTS REQUIRED</span>
              </div>

              <button
                type="button"
                onClick={() => handleRedeem(item)}
                disabled={points < item.cost}
                className={`w-full py-2.5 border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] font-black text-xs uppercase rounded-xl cursor-pointer ${
                  points >= item.cost ? 'bg-[#CC0000] text-white hover:bg-red-700' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {points >= item.cost ? 'REDEEM NOW' : 'NOT ENOUGH PTS'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
