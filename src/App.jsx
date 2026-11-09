import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { MessMatesLogo } from './components/MessMatesLogo';
import { Loader2 } from 'lucide-react';
import { CollegeSelectScreen } from './components/college/CollegeSelectScreen';
import { CollegePendingModal } from './components/college/CollegePendingModal';
import { getInstitutionById, isInstitutionActive, getDefaultInstitution } from './config/institutions';

// Lazy-loaded route pages (Code Splitting / On-Demand Loading)
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const MenuPage = lazy(() => import('./pages/MenuPage').then(m => ({ default: m.MenuPage })));
const MusclePassPage = lazy(() => import('./pages/MusclePassPage').then(m => ({ default: m.MusclePassPage })));
const HealthyRewardsPage = lazy(() => import('./pages/HealthyRewardsPage').then(m => ({ default: m.HealthyRewardsPage })));
const MessCommitteeDashboard = lazy(() => import('./pages/MessCommitteeDashboard').then(m => ({ default: m.MessCommitteeDashboard })));
const WardenDashboard = lazy(() => import('./pages/WardenDashboard').then(m => ({ default: m.WardenDashboard })));
const VotingPage = lazy(() => import('./pages/VotingPage').then(m => ({ default: m.VotingPage })));
const ActivityPage = lazy(() => import('./pages/ActivityPage').then(m => ({ default: m.ActivityPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const DailyPhotosPage = lazy(() => import('./pages/DailyPhotosPage').then(m => ({ default: m.DailyPhotosPage })));
const HygieneCheckPage = lazy(() => import('./pages/HygieneCheckPage').then(m => ({ default: m.HygieneCheckPage })));
const PhotoArchivePage = lazy(() => import('./pages/PhotoArchivePage').then(m => ({ default: m.PhotoArchivePage })));

// Lazy-loaded modals (Loaded strictly on-demand when activated)
const NotificationDrawer = lazy(() => import('./components/NotificationDrawer').then(m => ({ default: m.NotificationDrawer })));
const SearchModal = lazy(() => import('./components/SearchModal').then(m => ({ default: m.SearchModal })));
const MealDetailModal = lazy(() => import('./components/MealDetailModal').then(m => ({ default: m.MealDetailModal })));
const RewardClaimModal = lazy(() => import('./components/RewardClaimModal').then(m => ({ default: m.RewardClaimModal })));
const AddEditMealModal = lazy(() => import('./components/AddEditMealModal').then(m => ({ default: m.AddEditMealModal })));

const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 py-12">
    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    <p className="text-xs font-semibold text-slate-400">Loading...</p>
  </div>
);

const AppContent = () => {
  const { user, profile, role, isInitialAuthLoading, isProfileLoading } = useAuth();
  const { 
    currentPage, 
    setCurrentPage, 
    isAddMealModalOpen, 
    setIsAddMealModalOpen, 
    setEditingMeal, 
    selectedMeal, 
    setSelectedMeal, 
    isSearchOpen, 
    setIsSearchOpen, 
    isNotificationsOpen, 
    setIsNotificationsOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    claimedRewardModal,
    selectedMealModal
  } = useApp();

  // Role selection state for unauthenticated landing -> login flow
  const [selectedRole, setSelectedRole] = useState('student');
  const [isLoginFlow, setIsLoginFlow] = useState(false);

  // Universal Multi-College Institutional State
  const [selectedCollegeId, setSelectedCollegeId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('college');
      if (fromUrl && getInstitutionById(fromUrl)) return fromUrl;
      return localStorage.getItem('messmates_selected_college_id') || null;
    } catch (e) {
      return null;
    }
  });

  const activeInstitution = useMemo(() => {
    return getInstitutionById(selectedCollegeId);
  }, [selectedCollegeId]);

  // Android Capacitor Hardware Back Button Navigation Handler
  useEffect(() => {
    let listener = null;
    try {
      import('@capacitor/app').then(({ App: CapApp }) => {
        listener = CapApp.addListener('backButton', ({ canGoBack }) => {
          if (isAddMealModalOpen) {
            setIsAddMealModalOpen(false);
            setEditingMeal(null);
          } else if (selectedMeal) {
            setSelectedMeal(null);
          } else if (isSearchOpen) {
            setIsSearchOpen(false);
          } else if (isNotificationsOpen || isNotificationOpen) {
            setIsNotificationsOpen?.(false);
            setIsNotificationOpen?.(false);
          } else if (!user) {
            // Unauthenticated back navigation
            if (isLoginFlow) {
              setIsLoginFlow(false);
            } else if (selectedCollegeId) {
              setSelectedCollegeId(null);
              try { localStorage.removeItem('messmates_selected_college_id'); } catch (e) {}
            } else if (canGoBack) {
              window.history.back();
            } else {
              CapApp.exitApp();
            }
          } else if (currentPage !== 'dashboard') {
            setCurrentPage('dashboard');
          } else if (canGoBack) {
            window.history.back();
          } else {
            CapApp.exitApp();
          }
        });
      }).catch(() => {});
    } catch (e) {}

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, [
    isAddMealModalOpen, 
    selectedMeal, 
    isSearchOpen, 
    isNotificationsOpen,
    isNotificationOpen,
    currentPage, 
    setCurrentPage, 
    setIsAddMealModalOpen, 
    setEditingMeal, 
    setSelectedMeal, 
    setIsSearchOpen, 
    setIsNotificationsOpen,
    setIsNotificationOpen
  ]);

  // URL Path Synchronization & Strict Role Guarding
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();

    if (path.startsWith('/student')) {
      if (!user) {
        setSelectedRole('student');
        if (!selectedCollegeId) setSelectedCollegeId('abes_ec');
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
        if (!selectedCollegeId) setSelectedCollegeId('abes_ec');
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
        if (!selectedCollegeId) setSelectedCollegeId('abes_ec');
        setIsLoginFlow(true);
      } else if (role !== 'warden') {
        const target = role === 'mess_committee' ? '/committee' : '/student';
        window.history.replaceState(null, '', target);
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    } else if (user && role === 'student') {
      // Direct student route URL handling
      if (path === '/voting' || path.startsWith('/voting')) {
        setCurrentPage('voting');
      } else if (path === '/muscle-pass' || path.startsWith('/muscle-pass')) {
        setCurrentPage('muscle-pass');
      } else if (path === '/rewards' || path.startsWith('/rewards')) {
        setCurrentPage('rewards');
      } else if (path === '/complaints' || path.startsWith('/complaints') || path === '/activity' || path.startsWith('/activity')) {
        setCurrentPage('complaints');
      } else if (path === '/menu' || path.startsWith('/menu')) {
        setCurrentPage('menu');
      } else if (path === '/profile' || path.startsWith('/profile')) {
        setCurrentPage('profile');
      }
    }
  }, [user, role, setCurrentPage]);

  // Loading Screen — shown during initial Firebase auth resolution or profile fetch for active sessions
  if (isInitialAuthLoading || (user && !profile && isProfileLoading)) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4 text-white">
        <MessMatesLogo size="md" dark />
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading your session...</p>
      </div>
    );
  }

  // 1. PUBLIC LAYOUT: Universal Multi-College Entry
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <main className="flex-1 flex items-center justify-center p-4">
          <Suspense fallback={<PageLoadingFallback />}>
            {!selectedCollegeId ? (
              <CollegeSelectScreen
                initialSelectedId={null}
                onConfirmInstitution={(chosen) => {
                  setSelectedCollegeId(chosen.id);
                  try {
                    localStorage.setItem('messmates_selected_college_id', chosen.id);
                  } catch (e) {}
                }}
              />
            ) : !isInstitutionActive(activeInstitution) ? (
              <CollegePendingModal
                institution={activeInstitution}
                onBackToSearch={() => {
                  setSelectedCollegeId(null);
                  try {
                    localStorage.removeItem('messmates_selected_college_id');
                  } catch (e) {}
                }}
              />
            ) : isLoginFlow ? (
              <LoginPage 
                initialRole={selectedRole}
                institution={activeInstitution}
                onBackToRoles={() => setIsLoginFlow(false)}
                onChangeCollege={() => {
                  setSelectedCollegeId(null);
                  setIsLoginFlow(false);
                  try {
                    localStorage.removeItem('messmates_selected_college_id');
                  } catch (e) {}
                }}
              />
            ) : (
              <LandingPage 
                institution={activeInstitution}
                onSelectRole={(chosenRole) => {
                  setSelectedRole(chosenRole);
                  setIsLoginFlow(true);
                }}
                onChangeCollege={() => {
                  setSelectedCollegeId(null);
                  try {
                    localStorage.removeItem('messmates_selected_college_id');
                  } catch (e) {}
                }}
              />
            )}
          </Suspense>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Authenticated Flow with Strict Role Guarding
  const renderAuthenticatedPage = () => {
    // ── SHARED PAGES (all roles) ─────────────────────────────────────
    if (currentPage === 'profile') return <ProfilePage />;
    if (currentPage === 'menu') return <MenuPage />;
    if (currentPage === 'voting') return <VotingPage />;
    // 'activity' kept for backward compat, maps to complaints page
    if (currentPage === 'activity') return <ActivityPage />;
    if (currentPage === 'complaints') return <ActivityPage />;

    // ── STUDENT ONLY ─────────────────────────────────────────────────
    if (role === 'student') {
      if (currentPage === 'muscle-pass') return <MusclePassPage />;
      if (currentPage === 'rewards') return <HealthyRewardsPage />;
      return <StudentDashboard />;
    }

    // ── MESS COMMITTEE ONLY ──────────────────────────────────────────
    if (role === 'mess_committee') {
      if (currentPage === 'daily-photos') return <DailyPhotosPage />;
      if (currentPage === 'hygiene') return <HygieneCheckPage />;
      if (currentPage === 'ratings-view' || currentPage === 'ratings') return <MessCommitteeDashboard initialTab="ratings" />;
      if (currentPage === 'analytics') return <AnalyticsPage />;
      if (currentPage === 'reports') return <ReportsPage />;
      return <MessCommitteeDashboard />;
    }

    // ── WARDEN / ABES OFFICIALS ONLY ─────────────────────────────────
    if (role === 'warden') {
      if (currentPage === 'photo-archive') return <PhotoArchivePage />;
      if (currentPage === 'hygiene-archive') return <WardenDashboard initialTab="hygiene" />;
      if (currentPage === 'ratings' || currentPage === 'ratings-view') return <WardenDashboard initialTab="ratings" />;
      if (currentPage === 'analytics') return <AnalyticsPage />;
      if (currentPage === 'reports') return <ReportsPage />;
      return <WardenDashboard />;
    }

    return <StudentDashboard />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <Navbar />
      <main className="flex-1 transition-all duration-300">
        <Suspense fallback={<PageLoadingFallback />}>
          {renderAuthenticatedPage()}
        </Suspense>
      </main>

      <Footer />
      <BottomNav />

      {/* Global Modals (Loaded strictly on-demand when activated) */}
      <Suspense fallback={null}>
        {(isNotificationsOpen || isNotificationOpen) && <NotificationDrawer />}
        {isSearchOpen && <SearchModal />}
        {(selectedMeal || selectedMealModal) && <MealDetailModal />}
        {claimedRewardModal && <RewardClaimModal />}
        {isAddMealModalOpen && <AddEditMealModal />}
      </Suspense>
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
