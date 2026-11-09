# MESSMATES — Main Website Baseline & Restoration Guide

**Baseline Commit:** `487e7bea3bdb99224c3a01693008a81aed27c86e`  
**Baseline Git Tag:** `messmates-main-website-baseline`  
**Active Working Branch:** `feature/multi-college-experience`  
**Timestamp:** November 9, 2026 (IST)  
**Verification Status:** Verified Clean Build & Headless Visual Screenshots Captured  

---

## 1. Baseline Inventory & Architecture Snapshot

This baseline represents the exact, fully-functional MESSMATES production website prior to the multi-college login architecture upgrade.

### Core Assets & Pages
- **Public Entry & Role Selector:** [`src/pages/LandingPage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/LandingPage.jsx)
- **Authentication Console:** [`src/pages/LoginPage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/LoginPage.jsx) (Student, Mess Committee, Chief Warden login with Brevo OTP)
- **Student Dashboard:** [`src/pages/StudentDashboard.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/StudentDashboard.jsx)
- **Mess Menu:** [`src/pages/MenuPage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/MenuPage.jsx) with multi-mess routing for Junior Boys (Naina Caters), Senior Boys (Star Caterers), and Girls (ABES EC & ABES BS)
- **Muscle Pass (Pro):** [`src/pages/MusclePassPage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/MusclePassPage.jsx) with 7-day free trial, macro tracker, and 4 Razorpay plans (₹69, ₹149, ₹249, ₹449)
- **Student Profile & About Us:** [`src/pages/ProfilePage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/ProfilePage.jsx) & [`src/components/AboutUsSection.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/components/AboutUsSection.jsx) (Founders: Parth Sharma & Shivendra Pratap Singh)
- **Complaints & Grievances:** [`src/pages/ActivityPage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/ActivityPage.jsx)
- **Weekly Dish Voting:** [`src/pages/VotingPage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/VotingPage.jsx)
- **Healthy Rewards:** [`src/pages/HealthyRewardsPage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/HealthyRewardsPage.jsx)
- **Mess Committee Console:** [`src/pages/MessCommitteeDashboard.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/MessCommitteeDashboard.jsx), [`src/pages/DailyPhotosPage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/DailyPhotosPage.jsx), [`src/pages/HygieneCheckPage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/HygieneCheckPage.jsx)
- **Warden Oversight Portal:** [`src/pages/WardenDashboard.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/WardenDashboard.jsx) & [`src/pages/PhotoArchivePage.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/pages/PhotoArchivePage.jsx)

### Design System & Branding
- **Color Palette:** Forest green (`#059669`, `#065f46`), Emerald green (`#10b981`), Slate dark background (`#020617`, `#0f172a`), Clean white card backgrounds (`#ffffff`, `#f8fafc`).
- **Typography:** Modern sans-serif system stack (Inter / Apple System / Segoe UI).
- **Logos & Wordmarks:** [`src/components/MessMatesLogo.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/components/MessMatesLogo.jsx), [`src/assets/branding/`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/assets/branding/).
- **Navigation:** Header Navbar ([`src/components/Navbar.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/components/Navbar.jsx)), Mobile Bottom Nav with 6 items ([`src/components/BottomNav.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/components/BottomNav.jsx)), and Institutional Footer ([`src/components/Footer.jsx`](file:///C:/Users/Parth%20Sharma/.gemini/antigravity/scratch/messmates_repo/src/components/Footer.jsx)).

### Saved Baseline Screenshots
Captured via Chromium headless on localhost:4173 and archived in `baseline_screenshots/`:
1. `baseline-desktop-landing.png` (Desktop 1280x900)
2. `baseline-mobile-landing.png` (Mobile 390x844)
3. `baseline-desktop-student-login.png` (Desktop 1280x900)
4. `baseline-mobile-student-login.png` (Mobile 390x844)
5. `baseline-desktop-warden-login.png` (Desktop 1280x900)
6. `baseline-mobile-warden-login.png` (Mobile 390x844)
7. `baseline-desktop-committee-login.png` (Desktop 1280x900)

---

## 2. VERY IMPORTANT RESTORATION PROCEDURE

Whenever the project owner says:

> **"BACK TO THE MAIN WEBSITE"**

Execute this exact restoration protocol immediately:

```bash
# 1. Stash any uncommitted work safely
git stash push -m "Work in progress before restoring main website baseline"

# 2. Check out the baseline Git tag
git checkout messmates-main-website-baseline

# 3. Alternatively, hard reset feature/multi-college-experience or main to the baseline tag:
git checkout main
git reset --hard messmates-main-website-baseline

# 4. Re-verify production build
npm run build

# 5. Run test suite to verify baseline integrity
node test_pricing_and_contacts.mjs
node test_about_us.mjs
node test_auth_persistence_and_login.mjs
node test_dynamic_profile.mjs
```

### Safety Guarantees During Rollback
1. **Zero Database Loss:** Rollback only changes frontend and serverless code. Cloud Firestore data, user profiles, meal ratings, complaints, and subscriptions are **never deleted**.
2. **Environment Isolation:** Local and Vercel `.env` configurations are preserved.
3. **No Unapproved Pushes:** Never push a rollback or modification to `origin main` or live production without explicit user confirmation.
