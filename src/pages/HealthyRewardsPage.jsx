import React from 'react';
import { useApp } from '../context/AppContext';
import { Gift, Award, Check } from 'lucide-react';

export const HealthyRewardsPage = () => {
  const { rewardPoints, redeemReward } = useApp();

  const healthyItems = [
    {
      id: 'r_fruit',
      name: 'Fresh Fruit Bowl',
      points: 150,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
      category: 'Fruit',
    },
    {
      id: 'r_milk',
      name: 'Extra Fresh Milk Pack',
      points: 100,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
      category: 'Dairy',
    },
    {
      id: 'r_curd',
      name: 'Chilled Fresh Curd Bowl',
      points: 80,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
      category: 'Probiotic',
    },
    {
      id: 'r_sprouts',
      name: 'High-Protein Sprouts Box',
      points: 120,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400',
      category: 'Protein',
    },
    {
      id: 'r_snack',
      name: 'Healthy Roasted Nut Box',
      points: 200,
      image: 'https://images.unsplash.com/photo-1622484210800-c0953a559d24?auto=format&fit=crop&q=80&w=400',
      category: 'Nutrition',
    },
    {
      id: 'r_gym',
      name: 'Campus Gym / Wellness Pass',
      points: 300,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
      category: 'Fitness',
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Health Points</h1>
          <p className="text-xs text-slate-500 font-semibold">Earn by rating meals & voting</p>
        </div>

        <div className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white border border-emerald-500/30 text-center">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">Balance</span>
          <p className="text-xl font-black text-white">{rewardPoints} Pts</p>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthyItems.map(item => {
          const canRedeem = rewardPoints >= item.points;

          return (
            <div
              key={item.id}
              className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold">
                    {item.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{item.name}</h3>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {item.points} Points
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => redeemReward({ id: item.id, title: item.name, points: item.points, restaurantName: 'MessMate Healthy Store', code: 'HEALTHY' + item.points })}
                  disabled={!canRedeem}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                    canRedeem
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {canRedeem ? 'Redeem Item' : 'Need Points'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
