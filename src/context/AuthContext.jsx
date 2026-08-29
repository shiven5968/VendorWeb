import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import {
  signUpStudent,
  signInUser,
  signOutUser,
  sendPasswordResetForIdentifier,
  getUserProfile,
  updateUserProfileDoc,
  sendRegistrationOTP,
  verifyRegistrationOTP
} from '../services/auth';
import { db as localDb } from '../services/db';

const AuthContext = createContext();

// ─────────────────────────────────────────────────────────────────────────────
// Separate loading states (never collapse into one global "loading"):
//   isInitialAuthLoading  → Firebase onAuthStateChanged has not yet fired
//   isProfileLoading      → profile document fetch in progress after auth
//   isLoginSubmitting     → login form submission in progress
//   isRegisterSubmitting  → registration form submission in progress
//   isLogoutLoading       → logout in progress
// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser]                         = useState(null);
  const [profile, setProfile]                   = useState(null);

  // Granular loading states
  const [isInitialAuthLoading, setIsInitialAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading]         = useState(false);
  const [isLoginSubmitting, setIsLoginSubmitting]       = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading]           = useState(false);

  // Auth errors (cleared on every new attempt)
  const [authError, setAuthError] = useState('');
  const [profileError, setProfileError] = useState('');

  // ── Role normalization ──────────────────────────────────────────────────
  const normalizeRole = (rawRole) => {
    if (!rawRole) return 'student';
    const lower = rawRole.toLowerCase();
    if (lower === 'mess_committee' || lower === 'committee') return 'mess_committee';
    if (lower === 'warden') return 'warden';
    return 'student';
  };

  // ── Firebase Auth State Listener ────────────────────────────────────────
  // This is the ONLY place we determine the initial auth state.
  // We do NOT interpret Firestore/network errors as "user logged out."
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Local-first session restoration fallback
      try {
        const sessionUid = localStorage.getItem('messmate_session_uid');
        if (sessionUid) {
          const localUser = localDb.getUserById(sessionUid);
          if (localUser) {
            setUser({ uid: localUser.id, email: localUser.email, displayName: localUser.name });
            setProfile(localUser);
          }
        }
      } catch (e) {
        console.error('[AuthContext] Local session restore error:', e);
      }
      setIsInitialAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsProfileLoading(true);
        setProfileError('');

        try {
          const userProfile = await getUserProfile(firebaseUser.uid);

          if (userProfile) {
            setProfile(userProfile);
          } else {
            // Auth user exists but Firestore profile is missing.
            // This can happen for staff accounts or partial registrations.
            // We build a minimal profile WITHOUT silently logging them out.
            const email = firebaseUser.email || '';
            const role = email.includes('warden')
              ? 'warden'
              : email.includes('committee')
              ? 'mess_committee'
              : 'student';

            const fallbackProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || email.split('@')[0] || 'Student',
              email,
              role,
              hostelBlock: 'DNB Block',
              emailVerified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setProfile(fallbackProfile);
          }
        } catch (e) {
          // Network / Firestore error — user IS authenticated, we just can't load profile yet.
          // DO NOT set user to null. Show profile error instead.
          console.error('[AuthContext] Profile fetch error:', e);
          setProfileError(
            'Your profile could not be loaded. Please check your internet connection and refresh.'
          );
          // Keep a minimal profile so the app doesn't crash
          setProfile({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            role: 'student',
            _profileLoadFailed: true
          });
        } finally {
          setIsProfileLoading(false);
        }
      } else {
        // Genuinely signed out
        setUser(null);
        setProfile(null);
        setProfileError('');
        try { localStorage.removeItem('messmate_session_uid'); } catch (e) {}
      }

      setIsInitialAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── LOGIN ──────────────────────────────────────────────────────────────
  const login = useCallback(async (identifier, password) => {
    setIsLoginSubmitting(true);
    setAuthError('');

    try {
      const { user: authUser, profile: userProfile } = await signInUser(identifier, password);
      setUser(authUser);
      setProfile(userProfile);
      try { localStorage.setItem('messmate_session_uid', authUser.uid); } catch (e) {}
      return { user: authUser, profile: userProfile };
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoginSubmitting(false);
    }
  }, []);

  // ── SEND OTP ───────────────────────────────────────────────────────────
  const sendOTP = useCallback(async (details) => {
    setAuthError('');
    try {
      return await sendRegistrationOTP(details);
    } catch (err) {
      const msg = err.message || 'Failed to send verification code.';
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── VERIFY OTP ─────────────────────────────────────────────────────────
  const verifyOTP = useCallback(async (details) => {
    setAuthError('');
    try {
      return await verifyRegistrationOTP(details);
    } catch (err) {
      const msg = err.message || 'Verification failed.';
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── REGISTER ───────────────────────────────────────────────────────────
  const register = useCallback(async ({
    name, admissionNumber, email, password, gender, hostelBlock, isOtpVerified = true
  }) => {
    setIsRegisterSubmitting(true);
    setAuthError('');

    try {
      const { user: authUser, profile: userProfile } = await signUpStudent({
        name,
        admissionNumber,
        email,
        password,
        gender,
        hostelBlock,
        isOtpVerified
      });
      setUser(authUser);
      setProfile(userProfile);
      try { localStorage.setItem('messmate_session_uid', authUser.uid); } catch (e) {}
      return { user: authUser, profile: userProfile };
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsRegisterSubmitting(false);
    }
  }, []);

  // ── LOGOUT ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setIsLogoutLoading(true);
    setAuthError('');
    setProfileError('');

    try {
      await signOutUser();
      // Explicitly clear all user-scoped state
      setUser(null);
      setProfile(null);
    } catch (e) {
      console.error('[AuthContext] Logout error:', e);
    } finally {
      setIsLogoutLoading(false);
    }
  }, []);

  // ── PASSWORD RESET ─────────────────────────────────────────────────────
  const resetPassword = useCallback(async (identifier) => {
    try {
      return await sendPasswordResetForIdentifier(identifier);
    } catch (err) {
      throw new Error(err.message || 'Failed to send password reset email.');
    }
  }, []);

  // ── UPDATE PROFILE ─────────────────────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    if (!profile?.uid) return;
    try {
      await updateUserProfileDoc(profile.uid, updates);
      // Apply update locally (optimistic — keep role/uid from existing profile)
      setProfile(prev => ({
        ...prev,
        ...updates,
        role: prev.role,           // never allow client to change role via this path
        uid: prev.uid
      }));
    } catch (e) {
      console.error('[AuthContext] updateProfile error:', e);
      throw new Error('Profile update failed. Please try again.');
    }
  }, [profile]);

  const role = normalizeRole(profile?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,

        // Granular loading states
        loading: isInitialAuthLoading,            // kept for backward compat
        isInitialAuthLoading,
        isProfileLoading,
        isLoginSubmitting,
        isRegisterSubmitting,
        isLogoutLoading,
        isAuthenticating: isLoginSubmitting || isRegisterSubmitting,

        // Errors
        authError,
        profileError,

        // Auth actions
        login,
        register,
        sendOTP,
        verifyOTP,
        logout,
        resetPassword,
        updateProfile,

        isAuthenticated: Boolean(user && profile && !profile._profileLoadFailed)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
