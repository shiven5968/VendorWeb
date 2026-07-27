import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
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
import { MusclePassPage } from './pages/MusclePassPage';
import { HealthyRewardsPage } from './pages/HealthyRewardsPage';
import { MessCommitteeDashboard } from './pages/MessCommitteeDashboard';
import { WardenDashboard } from './pages/WardenDashboard';
import { VotingPage } from './pages/VotingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

const AppContent = () => {
  const { currentRole, currentPage } = useApp();

  const renderMainView = () => {
    // Specific navigation pages
    if (currentPage === 'about') return <AboutPage />;
    if (currentPage === 'contact') return <ContactPage />;
    if (currentPage === 'login') return <LoginPage />;
    if (currentPage === 'voting') return <VotingPage />;
    if (currentPage === 'analytics') return <AnalyticsPage />;
    if (currentPage === 'reports') return <ReportsPage />;
    if (currentPage === 'muscle-pass') return <MusclePassPage />;
    if (currentPage === 'rewards') return <HealthyRewardsPage />;

    if (currentPage === 'features' || currentPage === 'how-it-works' || currentPage === 'home') {
      if (currentRole === 'landing') return <LandingPage />;
    }

    // Role dashboards
    if (currentRole === 'student') return <StudentDashboard />;
    if (currentRole === 'committee') return <MessCommitteeDashboard />;
    if (currentRole === 'warden') return <WardenDashboard />;

    return <LandingPage />;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      <div>
        <RoleSwitcherBar />
        <Navbar />
        <main className="transition-all duration-300">
          {renderMainView()}
        </main>
      </div>

      <Footer />

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
