import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
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
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { Loader2 } from 'lucide-react';

const AppContent = () => {
  const { user, profile, role, loading: authLoading } = useAuth();
  const { currentPage, setCurrentPage } = useApp();

  // URL Path Synchronization & Strict Role Guarding
  useEffect(() => {
    const syncRouteFromPath = () => {
      const path = window.location.pathname.toLowerCase();

      if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/register') {
        setCurrentPage('login');
      } else if (path.startsWith('/student')) {
        if (!user) {
          window.history.replaceState(null, '', '/login');
          setCurrentPage('login');
        } else if (role !== 'student') {
          // Redirect unauthorized roles to their own dashboard
          const target = role === 'warden' ? '/warden' : '/committee';
          window.history.replaceState(null, '', target);
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('dashboard');
        }
      } else if (path.startsWith('/committee')) {
        if (!user) {
          window.history.replaceState(null, '', '/login');
          setCurrentPage('login');
        } else if (role !== 'mess_committee') {
          const target = role === 'warden' ? '/warden' : '/student';
          window.history.replaceState(null, '', target);
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('dashboard');
        }
      } else if (path.startsWith('/warden')) {
        if (!user) {
          window.history.replaceState(null, '', '/login');
          setCurrentPage('login');
        } else if (role !== 'warden') {
          const target = role === 'mess_committee' ? '/committee' : '/student';
          window.history.replaceState(null, '', target);
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('dashboard');
        }
      }
    };

    if (!authLoading) {
      syncRouteFromPath();
    }
  }, [user, role, authLoading, setCurrentPage]);

  // Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-3 text-white">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading MessMate Cloud Session...</p>
      </div>
    );
  }

  const renderMainView = () => {
    // 1. Unauthenticated or explicit login/landing
    if (!user || currentPage === 'login') return <LoginPage />;
    if (currentPage === 'home' && !user) return <LandingPage />;
    if (currentPage === 'about') return <AboutPage />;
    if (currentPage === 'contact') return <ContactPage />;

    // 2. Common authenticated pages
    if (currentPage === 'activity') return <ActivityPage />;
    if (currentPage === 'profile') return <ProfilePage />;
    if (currentPage === 'menu') return <MenuPage />;
    if (currentPage === 'voting') return <VotingPage />;

    // 3. STUDENT ONLY ROUTES
    if (role === 'student') {
      if (currentPage === 'muscle-pass') return <MusclePassPage />;
      if (currentPage === 'rewards') return <HealthyRewardsPage />;
      
      // If student tries to access admin tools, redirect to StudentDashboard
      if (currentPage === 'analytics' || currentPage === 'reports' || currentPage === 'warden' || currentPage === 'committee') {
        return <StudentDashboard />;
      }
      return <StudentDashboard />;
    }

    // 4. MESS COMMITTEE ONLY ROUTES
    if (role === 'mess_committee') {
      if (currentPage === 'analytics') return <AnalyticsPage />;
      if (currentPage === 'reports') return <ReportsPage />;
      
      // If committee tries to access student muscle pass, return Committee Dashboard
      if (currentPage === 'muscle-pass' || currentPage === 'rewards' || currentPage === 'warden') {
        return <MessCommitteeDashboard />;
      }
      return <MessCommitteeDashboard />;
    }

    // 5. WARDEN ONLY ROUTES
    if (role === 'warden') {
      if (currentPage === 'analytics') return <AnalyticsPage />;
      if (currentPage === 'reports') return <ReportsPage />;
      
      // If warden tries to access student muscle pass, return Warden Dashboard
      if (currentPage === 'muscle-pass' || currentPage === 'rewards' || currentPage === 'committee') {
        return <WardenDashboard />;
      }
      return <WardenDashboard />;
    }

    return <StudentDashboard />;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-300 relative">
      <div>
        <RoleSwitcherBar />
        <Navbar />
        <main className="transition-all duration-300">
          {renderMainView()}
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
