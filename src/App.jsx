import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SearchModal } from './components/SearchModal';
import { MealDetailModal } from './components/MealDetailModal';
import { RewardClaimModal } from './components/RewardClaimModal';
import { AddEditMealModal } from './components/AddEditMealModal';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { MenuPage } from './pages/MenuPage';
import { MusclePassPage } from './pages/MusclePassPage';
import { HealthyRewardsPage } from './pages/HealthyRewardsPage';
import { MessCommitteeDashboard } from './pages/MessCommitteeDashboard';
import { WardenDashboard } from './pages/WardenDashboard';
import { VotingPage } from './pages/VotingPage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { Loader2 } from 'lucide-react';

const AppContent = () => {
  const { user, profile, role, loading: authLoading } = useAuth();
  const { currentPage, setCurrentPage } = useApp();

  // Role selection state for unauthenticated landing -> login flow
  const [selectedRole, setSelectedRole] = useState('student');
  const [isLoginFlow, setIsLoginFlow] = useState(false);

  // URL Path Synchronization & Strict Role Guarding
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();

    if (path.startsWith('/student')) {
      if (!user) {
        setSelectedRole('student');
        setIsLoginFlow(true);
      } else if (role !== 'student') {
        const target = role === 'warden' ? '/warden' : '/committee';
        window.history.replaceState(null, '', target);
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    } else if (path.startsWith('/committee')) {
      if (!user) {
        setSelectedRole('committee');
        setIsLoginFlow(true);
      } else if (role !== 'mess_committee') {
        const target = role === 'warden' ? '/warden' : '/student';
        window.history.replaceState(null, '', target);
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    } else if (path.startsWith('/warden')) {
      if (!user) {
        setSelectedRole('warden');
        setIsLoginFlow(true);
      } else if (role !== 'warden') {
        const target = role === 'mess_committee' ? '/committee' : '/student';
        window.history.replaceState(null, '', target);
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    }
  }, [user, role, setCurrentPage]);

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-3 text-white">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading MessMates...</p>
      </div>
    );
  }

  // 1. Unauthenticated Flow: Landing (Role Selection) -> Login
  if (!user) {
    if (isLoginFlow) {
      return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <LoginPage 
              initialRole={selectedRole} 
              onBackToRoles={() => setIsLoginFlow(false)} 
            />
          </main>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="flex-1">
          <LandingPage 
            onSelectRole={(chosenRole) => {
              setSelectedRole(chosenRole);
              setIsLoginFlow(true);
            }} 
          />
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Authenticated Flow with Strict Role Guarding
  const renderAuthenticatedPage = () => {
    // Common Authenticated Pages
    if (currentPage === 'activity') return <ActivityPage />;
    if (currentPage === 'profile') return <ProfilePage />;
    if (currentPage === 'menu') return <MenuPage />;
    if (currentPage === 'voting') return <VotingPage />;

    // STUDENT ONLY
    if (role === 'student') {
      if (currentPage === 'muscle-pass') return <MusclePassPage />;
      if (currentPage === 'rewards') return <HealthyRewardsPage />;
      return <StudentDashboard />;
    }

    // MESS COMMITTEE ONLY
    if (role === 'mess_committee') {
      if (currentPage === 'analytics') return <AnalyticsPage />;
      if (currentPage === 'reports') return <ReportsPage />;
      return <MessCommitteeDashboard />;
    }

    // WARDEN ONLY
    if (role === 'warden') {
      if (currentPage === 'analytics') return <AnalyticsPage />;
      if (currentPage === 'reports') return <ReportsPage />;
      return <WardenDashboard />;
    }

    return <StudentDashboard />;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <div>
        <Navbar />
        <main className="transition-all duration-300">
          {renderAuthenticatedPage()}
        </main>
      </div>

      <Footer />
      <BottomNav />

      {/* Global Modals */}
      <NotificationDrawer />
      <SearchModal />
      <MealDetailModal />
      <RewardClaimModal />
      <AddEditMealModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
