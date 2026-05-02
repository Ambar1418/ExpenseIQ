import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../hooks/usePWA';

/**
 * PWAInstallBanner - Android-native-feel "Add to Home Screen" install prompt banner
 * Shows at the bottom of the screen on mobile Android Chrome
 */
export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, isOnline, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Check if user already dismissed (sessionStorage so it shows again next visit)
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await promptInstall();
    setInstalling(false);
    if (!accepted) setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const show = isInstallable && !isInstalled && !dismissed;

  return (
    <>
      {/* Offline Toast */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            key="offline-banner"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-3"
            style={{
              background: 'linear-gradient(135deg, #DC2626, #991B1B)',
              boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
              paddingTop: 'calc(12px + env(safe-area-inset-top))',
            }}
          >
            <span style={{ fontSize: 18 }}>📡</span>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: 'white',
            }}>
              You're offline — some features may be limited
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Banner */}
      <AnimatePresence>
        {show && (
          <motion.div
            key="install-banner"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9998,
              paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
              padding: '16px',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15,18,35,0.98) 0%, rgba(10,15,28,0.98) 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 20,
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                boxShadow: '0 -4px 40px rgba(99,102,241,0.2), 0 20px 60px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {/* App Icon */}
              <img
                src="/icon-96.png"
                alt="ExpenseIQ"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                }}
              />

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 15,
                  color: 'white',
                  marginBottom: 3,
                }}>
                  Install ExpenseIQ
                </div>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.4,
                }}>
                  Add to home screen for the full app experience
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
                aria-label="Dismiss install banner"
              >
                ✕
              </button>

              {/* Install Button */}
              <motion.button
                onClick={handleInstall}
                disabled={installing}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 18px',
                  color: 'white',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: installing ? 'wait' : 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                  whiteSpace: 'nowrap',
                }}
              >
                {installing ? '...' : 'Install'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
