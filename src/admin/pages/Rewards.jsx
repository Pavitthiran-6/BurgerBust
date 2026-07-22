import React from 'react';
import { useAdmin } from '../AdminContext';

export default function Rewards() {
  const { rewardStats, setRewardStats, customers } = useAdmin();

  // Sort customers to get loyalty leaderboard
  const loyaltyLeaderboard = [...customers].sort((a, b) => b.points - a.points).slice(0, 5);

  const handleUpdateReferralPoints = (e) => {
    const pts = parseInt(e.target.value) || 0;
    setRewardStats(prev => ({ ...prev, referralBonusPoints: pts }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      {/* Left: Settings & Stats */}
      <div className="lg:col-span-6 space-y-6">
        {/* Statistics card */}
        <div className="bg-white border-4 border-[#1a1c1c] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#111111] space-y-4">
          <h3 className="font-headline-md text-xl font-black uppercase text-[#1a1c1c] border-b-4 border-black pb-2 mb-4">
            REWARDS BALANCE SHEET
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-yellow-50 border-2 border-black p-4 rounded-2xl">
              <span className="text-[10px] font-black text-gray-400 block uppercase">POINTS ISSUED</span>
              <span className="text-xl font-black text-[#1a1c1c]">{rewardStats.pointsIssued} PTS</span>
            </div>
            <div className="bg-cyan-50 border-2 border-black p-4 rounded-2xl">
              <span className="text-[10px] font-black text-gray-400 block uppercase">POINTS REDEEMED</span>
              <span className="text-xl font-black text-[#FF0055]">{rewardStats.pointsRedeemed} PTS</span>
            </div>
          </div>
        </div>

        {/* Referrals config */}
        <div className="bg-white border-4 border-[#1a1c1c] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#111111] space-y-4">
          <h3 className="font-headline-md text-xl font-black uppercase text-[#1a1c1c] border-b-4 border-black pb-2 mb-4">
            REFERRAL SETTINGS
          </h3>
          <div className="flex justify-between items-center bg-[#FFF8E7] border-2 border-black p-4 rounded-2xl">
            <div>
              <span className="text-xs font-black uppercase block">REFERRAL BONUS</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Points issued to both friends upon registration</span>
            </div>
            <input
              type="number"
              value={rewardStats.referralBonusPoints}
              onChange={handleUpdateReferralPoints}
              className="w-20 p-2.5 border-2 border-black rounded-xl font-black text-center bg-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Right: Leaderboard */}
      <div className="lg:col-span-6 bg-white border-4 border-[#1a1c1c] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#111111]">
        <h3 className="font-headline-md text-xl font-black uppercase text-[#1a1c1c] border-b-4 border-black pb-2 mb-4">
          LOYALTY LEADERBOARD
        </h3>
        <ol className="flex flex-col gap-3">
          {loyaltyLeaderboard.map((user, idx) => (
            <li key={user.id} className="flex items-center justify-between p-3.5 bg-yellow-50/50 border-2 border-black rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-[#00F0FF] border-2 border-black rounded-full flex items-center justify-center font-black text-xs">
                  {idx + 1}
                </span>
                <span className="font-black text-xs uppercase">{user.name}</span>
              </div>
              <span className="font-black text-xs text-primary">{user.points} PTS</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
