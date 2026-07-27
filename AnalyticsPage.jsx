import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, Users, Flame, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export const AnalyticsPage = () => {
  const { wardenAnalytics, meals } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Mess Quality & Nutrition Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive data metrics across ratings, food waste, attendance & macronutrient compliance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Meal Ratings Summary</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={meals}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="rating" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rating Distribution (% Share)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardenAnalytics.ratingDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="rating" width={80} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
