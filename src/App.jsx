import React from 'react';
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

const AppContent = () => {
  const { currentUser, currentRole, currentPage } = useApp();

  const renderMainView = () => {
    // Unauthenticated or login
    if (!currentUser || currentPage === 'login') return <LoginPage />;
    if (currentPage === 'home' && currentRole === 'landing') return <LandingPage />;
    if (currentPage === 'about') return <AboutPage />;
    if (currentPage === 'contact') return <ContactPage />;

    // Common pages
    if (currentPage === 'activity') return <ActivityPage />;
    if (currentPage === 'profile') return <ProfilePage />;
    if (currentPage === 'menu') return <MenuPage />;
    if (currentPage === 'voting') return <VotingPage />;

    // Student Only Pages
    if (currentUser.role === 'student') {
      if (currentPage === 'muscle-pass') return <MusclePassPage />;
      if (currentPage === 'rewards') return <HealthyRewardsPage />;
      return <StudentDashboard />;
    }

    // Mess Committee Only Pages
    if (currentUser.role === 'committee') {
      if (currentPage === 'analytics') return <AnalyticsPage />;
      if (currentPage === 'reports') return <ReportsPage />;
      return <MessCommitteeDashboard />;
    }

    // Warden Only Pages
    if (currentUser.role === 'warden') {
      if (currentPage === 'analytics') return <AnalyticsPage />;
      if (currentPage === 'reports') return <ReportsPage />;
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
