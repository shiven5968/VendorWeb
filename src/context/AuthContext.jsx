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
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Normalize role string (supports 'student', 'mess_committee', 'warden', and 'partner')
  const normalizeRole = (rawRole) => {
    if (!rawRole) return 'student';
    const lower = rawRole.toLowerCase();
    if (lower === 'partner' || lower === 'vendor') return 'partner';
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
              const isPartner = email.includes('partner') || email.includes('vendor') || email.includes('pvr') || email.includes('burger') || email.includes('fitgym') || email.includes('campusmart');
              const role = isPartner ? 'partner' : email.includes('warden') ? 'warden' : email.includes('committee') ? 'mess_committee' : 'student';
              const vendorId = email.includes('burger') ? 'vendor_burger_club' : email.includes('pvr') ? 'vendor_pvr_grand' : email.includes('fitgym') ? 'vendor_fitgym' : email.includes('campusmart') ? 'vendor_campus_mart' : (isPartner ? 'vendor_partner' : undefined);
              const vendorName = email.includes('burger') ? 'The Burger Club' : email.includes('pvr') ? 'PVR Grand' : email.includes('fitgym') ? 'FitGym ABES' : email.includes('campusmart') ? 'Campus Mart' : (isPartner ? 'Partner Merchant' : undefined);
              userProfile = {
                uid: firebaseUser.uid,
                name: vendorName || firebaseUser.displayName || email.split('@')[0] || 'Partner Merchant',
                email: email,
                role: role,
                vendorId: vendorId,
                vendorName: vendorName,
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

  // LOGIN METHOD (Admission Number + Password for Student, Email + Password for Staff)
  const login = async (identifier, password) => {
    setLoading(true);
    setAuthError('');
    try {
      const { user: authUser, profile: userProfile } = await signInUser(identifier, password);
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
    setLoading(true);
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
        loading,
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
