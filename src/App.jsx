import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { VendorNavbar } from './components/VendorNavbar';
import { VendorFooter } from './components/VendorFooter';
import { VendorLandingPage } from './pages/VendorLandingPage';
import { VendorDashboard } from './pages/VendorDashboard';
import { Loader2, Ticket, Check, Copy, X, QrCode } from 'lucide-react';
import { db } from './services/db';

const AppContent = () => {
  const { user, profile, loading: authLoading } = useAuth();
  
  // Test Voucher Generator Modal State (for counter scanner testing)
  const [testModalVoucher, setTestModalVoucher] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [generatingTestCode, setGeneratingTestCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (testModalVoucher?.voucherCode) {
      setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(testModalVoucher.voucherCode)}`);
    } else {
      setQrDataUrl('');
    }
  }, [testModalVoucher]);

  // Quick Test Voucher Simulator for Vendors
  const handleGenerateTestVoucher = async () => {
    setGeneratingTestCode(true);
    setCopiedCode(false);
    try {
      const activeVendorId = profile?.vendorId || 'vendor_burger_club';
      const allRewards = db.getPartnerRewards(activeVendorId);
      const targetReward = allRewards.find(r => r.isActive) || allRewards[0] || {
        rewardId: 'rew_burger_club_1',
        title: '20% OFF on Weekend Buffet & Combo',
        vendorId: activeVendorId,
        vendorName: profile?.vendorName || 'The Burger Club',
        pointsRequired: 150
      };

      const testStudent = {
        id: 'usr_parth',
        uid: 'usr_parth',
        name: 'Parth Sharma',
        email: 'parth.sharma@abes.ac.in',
        rewardPoints: 500
      };

      const redemption = await db.claimPartnerReward(testStudent, targetReward);
      setTestModalVoucher({
        ...redemption,
        rewardTitle: targetReward.title,
        vendorName: targetReward.vendorName
      });
    } catch (err) {
      console.error('Error generating test voucher:', err);
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let rnd = '';
      for (let i = 0; i < 4; i++) rnd += chars.charAt(Math.floor(Math.random() * chars.length));
      setTestModalVoucher({
        voucherCode: `MM-${rnd}`,
        rewardTitle: '20% OFF Weekend Combo',
        studentName: 'Parth Sharma',
        studentEmail: 'parth.sharma@abes.ac.in'
      });
    } finally {
      setGeneratingTestCode(false);
    }
  };

  const handleCopyAndFill = () => {
    if (!testModalVoucher?.voucherCode) return;
    navigator.clipboard.writeText(testModalVoucher.voucherCode);
    setCopiedCode(true);
    
    // Auto-populate the counter validator input if present
    const inputEl = document.getElementById('cashier-voucher-input') || document.querySelector('input[placeholder*="MM-"]');
    if (inputEl) {
      inputEl.value = testModalVoucher.voucherCode;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputEl.focus();
    }
    setTimeout(() => {
      setTestModalVoucher(null);
    }, 1200);
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-3 text-white">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading MessMates Partner Hub...</p>
      </div>
    );
  }

  // 1. Unauthenticated: Dedicated Vendor Landing & Partner Sign-In
  if (!user) {
    return <VendorLandingPage />;
  }

  // 2. Authenticated: Dedicated Vendor Portal
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <VendorNavbar onGenerateTestVoucher={handleGenerateTestVoucher} />
      
      <main className="flex-1">
        <VendorDashboard />
      </main>

      <VendorFooter />

      {/* Test Voucher Simulator Modal */}
      {testModalVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <Ticket className="w-5 h-5" />
                <span className="text-sm font-black">Test Voucher Generated</span>
              </div>
              <button 
                onClick={() => setTestModalVoucher(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <p className="text-xs text-slate-500 font-semibold">
                Valid Voucher Code for Counter:
              </p>
              <div className="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-widest bg-emerald-50 dark:bg-emerald-950/50 py-2.5 rounded-xl border border-emerald-500/30">
                {testModalVoucher.voucherCode}
              </div>

              {/* Real Scannable QR Code Image */}
              {qrDataUrl && (
                <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
                  <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                    <img 
                      src={qrDataUrl} 
                      alt={`QR code for ${testModalVoucher.voucherCode}`} 
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Point phone camera at this QR code to scan!</span>
                  </span>
                </div>
              )}

              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {testModalVoucher.rewardTitle}
              </p>
              <p className="text-[11px] text-slate-400">
                Issued for: <span className="font-semibold text-slate-600 dark:text-slate-300">{testModalVoucher.studentName}</span> ({testModalVoucher.studentEmail})
              </p>
            </div>

            <button
              onClick={handleCopyAndFill}
              className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 transition-all shadow-md flex items-center justify-center space-x-2"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied & Applied to Counter Terminal!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code & Test Counter Validator</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
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
