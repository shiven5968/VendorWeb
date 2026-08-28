import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db as firestoreDb, isFirebaseConfigured } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  signUpStudent, 
  signInUser, 
  signOutUser, 
  sendPasswordResetForIdentifier, 
  getUserProfile, 
  updateUserProfileDoc,
  sendRegistrationOTP,
  verifyRegistrationOTP,
  formatAuthError 
} from '../services/auth';
import { db as localDb } from '../services/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  // Normalize role string (supports both 'committee' and 'mess_committee')
  const normalizeRole = (rawRole) => {
    if (!rawRole) return 'student';
    const lower = rawRole.toLowerCase();
    if (lower === 'mess_committee' || lower === 'committee') return 'mess_committee';
    if (lower === 'warden') return 'warden';
    return 'student';
  };

  // Listen to Firebase Auth State changes for true cloud session persistence
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            let userProfile = await getUserProfile(firebaseUser.uid);
            if (!userProfile) {
              const email = firebaseUser.email || '';
              const role = email.includes('warden') ? 'warden' : email.includes('committee') ? 'mess_committee' : 'student';
              userProfile = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || email.split('@')[0] || 'Student',
                email: email,
                role: role,
                gender: 'Male',
                hostelBlock: 'DNB Block',
                dietPreference: 'High Protein / Eggetarian',
                proteinTarget: 120,
                rewardPoints: 0,
                emailVerified: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              try {
                await setDoc(doc(firestoreDb, 'users', firebaseUser.uid), userProfile, { merge: true });
              } catch (writeErr) {
                console.error('Error auto-creating Firestore profile:', writeErr);
              }
            }
            setProfile(userProfile);
            localStorage.setItem('messmate_session_uid', firebaseUser.uid);
          } catch (e) {
            console.error('Error fetching user profile in auth state change:', e);
          }
        } else {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('messmate_session_uid');
        }
        setIsInitialLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Local session restoration fallback
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
        console.error('Local session restoration error:', e);
      }
      setIsInitialLoading(false);
    }
  }, []);

  // LOGIN METHOD (Admission Number + Password for Student, Email + Password for Staff)
  const login = async (identifier, password) => {
    setIsAuthenticating(true);
    setAuthError('');
    try {
      const { user: authUser, profile: userProfile } = await signInUser(identifier, password);
      setUser(authUser);
      setProfile(userProfile);
      localStorage.setItem('messmate_session_uid', authUser.uid);
      setIsAuthenticating(false);
      return { user: authUser, profile: userProfile };
    } catch (err) {
      setIsAuthenticating(false);
      const msg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // SEND OTP METHOD
  const sendOTP = async (details) => {
    setAuthError('');
    try {
      return await sendRegistrationOTP(details);
    } catch (err) {
      const msg = err.message || 'Failed to dispatch verification code.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // VERIFY OTP METHOD
  const verifyOTP = async (details) => {
    setAuthError('');
    try {
      return await verifyRegistrationOTP(details);
    } catch (err) {
      const msg = err.message || 'Verification failed.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // REGISTER STUDENT METHOD (Executed ONLY after verified OTP)
  const register = async ({ name, admissionNumber, email, password, gender, hostelBlock, isOtpVerified = true }) => {
    setIsAuthenticating(true);
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
      localStorage.setItem('messmate_session_uid', authUser.uid);
      setIsAuthenticating(false);
      return { user: authUser, profile: userProfile };
    } catch (err) {
      setIsAuthenticating(false);
      const msg = err.message || 'Registration failed.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // LOGOUT METHOD
  const logout = async () => {
    setIsAuthenticating(true);
    try {
      await signOutUser();
      setUser(null);
      setProfile(null);
      localStorage.removeItem('messmate_session_uid');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // PASSWORD RESET METHOD (Supports Admission Number or Email)
  const resetPassword = async (identifier) => {
    try {
      return await sendPasswordResetForIdentifier(identifier);
    } catch (err) {
      throw new Error(err.message || 'Failed to send password reset email.');
    }
  };

  // UPDATE PROFILE METHOD
  const updateProfile = async (updates) => {
    if (!profile?.uid) return;
    try {
      const updated = await updateUserProfileDoc(profile.uid, updates);
      setProfile(prev => ({ ...prev, ...updates }));
      return updated;
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  };

  const role = normalizeRole(profile?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading: isInitialLoading,
        isAuthenticating,
        authError,
        login,
        register,
        sendOTP,
        verifyOTP,
        logout,
        resetPassword,
        updateProfile,
        isAuthenticated: Boolean(user && profile)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
