import React from 'react';
import { useApp } from '../context/AppContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AnalyticsPage = () => {
  const { wardenAnalytics, meals = [] } = useApp();
  const ratedMeals = meals.filter(m => m.rating !== null && m.rating !== undefined);
  const ratingDist = wardenAnalytics?.ratingDistribution || [];
  const hasRatings = ratingDist.some(d => d.percentage > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Mess Quality & Nutrition Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Live ratings & student satisfaction indices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-400">Meal Ratings</h3>
          {ratedMeals.length > 0 ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratedMeals}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-16 text-center text-xs font-bold text-slate-400">
              No rating analytics available yet.
            </div>
          )}
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-400">Rating Distribution (% Share)</h3>
          {hasRatings ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="rating" width={60} tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-16 text-center text-xs font-bold text-slate-400">
              No reviews recorded yet to calculate rating distribution.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
