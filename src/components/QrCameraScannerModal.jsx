import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Upload, 
  Zap, 
  ZapOff, 
  AlertCircle, 
  CheckCircle2, 
  FlipHorizontal,
  Sparkles
} from 'lucide-react';

// Play a pleasant validation beep using Web Audio API
const playScanSuccessSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Audio context may be restricted by browser policy
  }
};

export const QrCameraScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [scannerError, setScannerError] = useState('');
  const [isStarting, setIsStarting] = useState(true);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const readerElementId = 'messmates-qr-reader-viewfinder';

  // Parse voucher code from scanned raw text (supports "MM-89X2", JSON, or URLs)
  const extractVoucherCode = (decodedText) => {
    if (!decodedText) return '';
    const clean = decodedText.trim();
    
    // 1. Direct MM-XXXX format
    const mmMatch = clean.match(/MM-[A-Za-z0-9]+/i);
    if (mmMatch) return mmMatch[0].toUpperCase();

    // 2. Query param ?code=MM-XXXX or ?voucher=XXXX
    const paramMatch = clean.match(/[?&](?:code|voucher|claim)=([^&#]+)/i);
    if (paramMatch && paramMatch[1]) {
      const val = decodeURIComponent(paramMatch[1]).trim().toUpperCase();
      return val.startsWith('MM-') ? val : `MM-${val}`;
    }

    // 3. JSON format e.g. {"voucherCode":"MM-1234"}
    try {
      const parsed = JSON.parse(clean);
      const code = parsed.voucherCode || parsed.code || parsed.claimCode;
      if (code) return String(code).trim().toUpperCase();
    } catch (e) {}

    // Fallback: return raw uppercase string if alphanumeric
    return clean.toUpperCase();
  };

  const handleScanDone = (decodedText) => {
    const code = extractVoucherCode(decodedText);
    if (!code) return;

    setScannedCode(code);
    playScanSuccessSound();
    if (navigator.vibrate) {
      try { navigator.vibrate([60, 40, 60]); } catch (e) {}
    }

    // Stop camera before passing code
    stopScanner().finally(() => {
      setTimeout(() => {
        onScanSuccess(code);
        onClose();
      }, 350);
    });
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop error:', err);
      }
      scannerRef.current = null;
    }
  };

  const startScanner = async (cameraIdOrConfig) => {
    setScannerError('');
    setIsStarting(true);
    setIsTorchOn(false);

    try {
      await stopScanner();

      const html5QrCode = new Html5Qrcode(readerElementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });
      scannerRef.current = html5QrCode;

      // Available cameras enumeration
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
        }
      } catch (devErr) {
        console.warn('Could not enumerate cameras:', devErr);
      }

      const cameraConfig = cameraIdOrConfig || { facingMode: 'environment' };
      const qrConfig = {
        fps: 20,
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        cameraConfig,
        qrConfig,
        (decodedText) => {
          handleScanDone(decodedText);
        },
        () => {
          // Frame scan failure (normal during video continuous sweep)
        }
      );

      setIsStarting(false);

      // Check for torch capability
      try {
        const capabilities = html5QrCode.getRunningTrackCapabilities();
        if (capabilities && capabilities.torch) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      } catch (e) {
        setTorchSupported(false);
      }
    } catch (err) {
      console.error('Camera startup error:', err);
      setIsStarting(false);
      let msg = 'Could not access device camera. Please check your browser camera permissions.';
      if (err?.name === 'NotAllowedError' || String(err).includes('Permission')) {
        msg = 'Camera permission was denied. Please allow camera access in your browser settings to scan vouchers.';
      } else if (err?.name === 'NotFoundError') {
        msg = 'No camera device found on this system.';
      }
      setScannerError(msg);
    }
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!scannerRef.current || !torchSupported) return;
    try {
      const nextState = !isTorchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState }]
      });
      setIsTorchOn(nextState);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  // Switch between available cameras
  const handleSwitchCamera = () => {
    if (cameras.length < 2) return;
    const currentIdx = cameras.findIndex(c => c.id === selectedCameraId);
    const nextIdx = (currentIdx + 1) % cameras.length;
    const nextCam = cameras[nextIdx];
    setSelectedCameraId(nextCam.id);
    startScanner(nextCam.id);
  };

  // Upload and scan image file from device gallery
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScannerError('');
      let localScanner = scannerRef.current;
      if (!localScanner) {
        localScanner = new Html5Qrcode(readerElementId);
        scannerRef.current = localScanner;
      }
      const decodedText = await localScanner.scanFile(file, true);
      handleScanDone(decodedText);
    } catch (err) {
      setScannerError('Could not find or read a QR code in the uploaded image.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow modal DOM mounting
      const timer = setTimeout(() => {
        startScanner();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col relative text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Scan Reward Voucher QR</h3>
              <p className="text-[11px] text-slate-400">Position student QR code inside the frame</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="relative bg-black flex items-center justify-center min-h-[300px] overflow-hidden">
          
          {/* Suppress html5-qrcode default white box and styling */}
          <style>{`
            #messmates-qr-reader-viewfinder #qr-shaded-region {
              display: none !important;
            }
            #messmates-qr-reader-viewfinder video {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
            }
          `}</style>

          {/* HTML5 QR Code Mount Node */}
          <div 
            id={readerElementId} 
            className="w-full h-full max-h-[340px] overflow-hidden flex items-center justify-center"
          />

          {/* Targeted Scanner Frame Overlay */}
          {!scannerError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-60 h-60 relative rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                {/* Corner Targeting Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                {/* Animated Laser Scanning Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce duration-1000"></div>
              </div>
            </div>
          )}

          {/* Success Flash Overlay */}
          {scannedCode && (
            <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center space-y-2 z-20 animate-in fade-in duration-150">
              <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
              <p className="text-sm font-black text-white">Voucher Code Detected!</p>
              <p className="font-mono text-xl font-black tracking-widest text-emerald-100 bg-black/30 px-4 py-1.5 rounded-xl border border-white/20">
                {scannedCode}
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {isStarting && !scannerError && !scannedCode && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-3 z-10">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs font-bold text-slate-300">Initializing camera feed...</p>
            </div>
          )}

          {/* Error Message Screen */}
          {scannerError && (
            <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col items-center justify-center text-center space-y-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-white">Camera Access Required</h4>
              <p className="text-xs text-slate-300 max-w-xs">{scannerError}</p>
              
              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => startScanner()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Viewfinder Controls & Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
          
          <div className="flex items-center space-x-2">
            {/* Camera Switcher (Front/Back) */}
            {cameras.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center space-x-1.5"
                title="Switch Camera"
              >
                <FlipHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Switch</span>
              </button>
            )}

            {/* Torch / Flashlight Toggle */}
            {torchSupported && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2.5 rounded-xl transition-all text-xs font-semibold flex items-center space-x-1.5 ${
                  isTorchOn 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Toggle Torch"
              >
                {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                <span className="hidden sm:inline">Flash</span>
              </button>
            )}

            {/* Upload QR Image Fallback */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center space-x-1.5"
              title="Upload QR screenshot"
            >
              <Upload className="w-4 h-4" />
              <span className="text-[11px] sm:text-xs">Upload QR</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
