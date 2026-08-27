import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db as firestoreDb, isFirebaseConfigured } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  signUpStudent, 
  signInUser, 
  signOutUser, 
  sendPasswordReset, 
  getUserProfile, 
  updateUserProfileDoc,
  formatAuthError 
} from '../services/auth';
import { db as localDb } from '../services/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
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
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              try {
                await setDoc(doc(firestoreDb, 'users', firebaseUser.uid), userProfile);
              } catch (writeErr) {
                console.error('Error auto-creating Firestore profile:', writeErr);
              }
            }
            setProfile(userProfile);
            localStorage.setItem('messmate_session_uid', firebaseUser.uid);
          } catch (e) {
            console.error('Error fetching user profile:', e);
          }
        } else {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('messmate_session_uid');
        }
        setLoading(false);
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
      setLoading(false);
    }
  }, []);

  // LOGIN METHOD
  const login = async (email, password) => {
    setLoading(true);
    setAuthError('');
    try {
      const { user: authUser, profile: userProfile } = await signInUser(email, password);
      setUser(authUser);
      setProfile(userProfile);
      localStorage.setItem('messmate_session_uid', authUser.uid);
      setLoading(false);
      return { user: authUser, profile: userProfile };
    } catch (err) {
      setLoading(false);
      const msg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // REGISTER STUDENT METHOD
  const register = async ({ name, admissionNumber, email, password, gender, hostelBlock }) => {
    setLoading(true);
    setAuthError('');
    try {
      const { user: authUser, profile: userProfile } = await signUpStudent({
        name,
        admissionNumber,
        email,
        password,
        gender,
        hostelBlock
      });
      setUser(authUser);
      setProfile(userProfile);
      localStorage.setItem('messmate_session_uid', authUser.uid);
      setLoading(false);
      return { user: authUser, profile: userProfile };
    } catch (err) {
      setLoading(false);
      const msg = err.message || 'Registration failed.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // LOGOUT METHOD
  const logout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
      setProfile(null);
      localStorage.removeItem('messmate_session_uid');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setLoading(false);
    }
  };

  // PASSWORD RESET METHOD
  const resetPassword = async (email) => {
    try {
      await sendPasswordReset(email);
      return true;
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
        loading,
        authError,
        login,
        register,
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
