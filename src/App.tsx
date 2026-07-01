import { useState } from 'react';
import { BOY_CANDIDATES, GIRL_CANDIDATES, SCHOOL_INFO } from './data';
import Clock from './components/Clock';
import PanelSection from './components/PanelSection';
import ConfirmModal from './components/ConfirmModal';
import SuccessOverlay from './components/SuccessOverlay';
import AdminDashboard from './components/AdminDashboard';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { Routes, Route } from 'react-router-dom';

function StudentVoting() {
  const [boyVote, setBoyVote] = useState<number | null>(null);
  const [girlVote, setGirlVote] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBoy = BOY_CANDIDATES.find((c) => c.id === boyVote) || null;
  const selectedGirl = GIRL_CANDIDATES.find((c) => c.id === girlVote) || null;

  const canConfirm = boyVote !== null && girlVote !== null;

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Helper to play short beep sound when candidate is selected (sine wave, 1000Hz, 0.1s)
  const playSelectionBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Web Audio selection beep blocked or not supported:", e);
    }
  };

  // Helper to play longer buzz beep sound when vote is submitted (sine wave, 850Hz, 1.2s)
  const playSubmitBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, ctx.currentTime); // Real EVM buzzer sound frequency

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + 1.1);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Web Audio submit beep blocked or not supported:", e);
    }
  };

  const handleBoyVote = (id: number) => {
    setBoyVote(id);
    playSelectionBeep();
    const c = BOY_CANDIDATES.find((x) => x.id === id);
    if (c) showNotif(`✅ Head Boy: ${c.name} selected`);
  };

  const handleGirlVote = (id: number) => {
    setGirlVote(id);
    playSelectionBeep();
    const c = GIRL_CANDIDATES.find((x) => x.id === id);
    if (c) showNotif(`✅ Head Girl: ${c.name} selected`);
  };

  const handleConfirmClick = () => {
    if (!canConfirm) {
      showNotif('⚠️ Please select ONE Head Boy and ONE Head Girl');
      return;
    }
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting || !selectedBoy || !selectedGirl) return;
    setIsSubmitting(true);

    try {
      const now = new Date();
      // Generate a unique 8-character vote ID
      const voteId = 'VOTE-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const dateStr = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      // Save to Cloud Firestore collection 'votes' using Modular SDK
      await addDoc(collection(db, 'votes'), {
        voteId,
        headBoy: selectedBoy.name,
        headGirl: selectedGirl.name,
        date: dateStr,
        time: timeStr,
        timestamp: serverTimestamp(),
      });

      playSubmitBeep();
      setShowModal(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Firestore submit error: ", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      showNotif(`❌ Submit failed: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    setBoyVote(null);
    setGirlVote(null);
  };

  return (
    <div
      className="main-bg grid-overlay relative flex flex-col"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      {/* Scanline */}
      <div className="scanline-overlay" />

      {/* Floating notification */}
      {notification && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-white font-bold text-sm"
          style={{
            fontFamily: 'Rajdhani',
            background: 'rgba(0,20,60,0.95)',
            border: '1px solid rgba(0,200,255,0.5)',
            boxShadow: '0 0 30px rgba(0,150,255,0.4)',
            backdropFilter: 'blur(10px)',
            animation: 'slideUp 0.3s ease',
          }}
        >
          {notification}
        </div>
      )}

      {/* ── HEADER ── */}
      <header
        className="relative flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,10,40,0.98) 0%, rgba(0,15,50,0.95) 100%)',
          borderBottom: '1px solid rgba(0,180,255,0.25)',
          boxShadow: '0 4px 30px rgba(0,50,200,0.15), 0 0 0 1px rgba(0,100,255,0.08)',
          padding: '8px 20px',
        }}
      >
        {/* Top HUD line */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.6) 20%, rgba(255,255,255,0.8) 50%, rgba(255,60,180,0.6) 80%, transparent)' }}
        />

        <div className="flex items-center justify-between">
          {/* Left: Logo + School Info */}
          <div className="flex items-center gap-4">
            {/* Gajera School Logo */}
            <div
              className="flex-shrink-0 rounded-2xl overflow-hidden"
              style={{
                width: '80px',
                height: '80px',
                background: 'white',
                border: '2.5px solid rgba(0,180,255,0.6)',
                boxShadow: '0 0 25px rgba(0,120,255,0.5), 0 0 50px rgba(0,80,200,0.2)',
                padding: '4px',
              }}
            >
              <img
                src="/images/gajera_logo.png"
                alt="Gajera School Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1
                className="font-black uppercase text-white leading-tight"
                style={{
                  fontFamily: 'Orbitron',
                  fontSize: 'clamp(1rem, 1.8vw, 1.4rem)',
                  letterSpacing: '0.05em',
                  textShadow: '0 0 20px rgba(0,200,255,0.7), 0 0 40px rgba(0,150,255,0.4)',
                }}
              >
                {SCHOOL_INFO.name}
              </h1>
              <p
                className="text-cyan-300 font-bold uppercase tracking-widest mt-0.5"
                style={{
                  fontFamily: 'Rajdhani',
                  fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
                  letterSpacing: '0.12em',
                  textShadow: '0 0 10px rgba(0,200,255,0.5)',
                }}
              >
                {SCHOOL_INFO.subtitle}
              </p>
            </div>
          </div>

          {/* Center: Election Title */}
          <div className="text-center flex-1 px-4">
            <div
              className="font-black uppercase tracking-widest"
              style={{
                fontFamily: 'Orbitron',
                fontSize: 'clamp(0.85rem, 1.8vw, 1.3rem)',
                background: 'linear-gradient(90deg, #00d4ff, #ffffff, #ff3cba)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
                letterSpacing: '0.12em',
              }}
            >
              {SCHOOL_INFO.electionTitle}
            </div>
            <div
              className="text-yellow-400 font-bold uppercase tracking-widest mt-0.5"
              style={{
                fontFamily: 'Rajdhani',
                fontSize: 'clamp(0.6rem, 1vw, 0.78rem)',
                textShadow: '0 0 12px rgba(255,200,0,0.6)',
              }}
            >
              ⚡ ELECTRONIC VOTING MACHINE ⚡
            </div>
          </div>

          {/* Right: Clock */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Clock />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex relative min-h-0" style={{ padding: '12px 16px 10px' }}>
        {/* Left Panel: Head Boy */}
        <div
          className="flex-1 glass-card rounded-2xl relative overflow-hidden"
          style={{
            border: '1px solid rgba(0,150,255,0.3)',
            boxShadow: '0 0 40px rgba(0,80,200,0.15), inset 0 0 30px rgba(0,50,150,0.1)',
            padding: '14px 14px 10px',
            marginRight: '8px',
          }}
        >
          {/* Inner glow top */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.5), transparent)' }}
          />
          <PanelSection
            panel="boy"
            candidates={BOY_CANDIDATES}
            selectedId={boyVote}
            onSelect={setBoyVote}
            onVote={handleBoyVote}
          />
        </div>

        {/* Center Divider */}
        <div className="center-divider" style={{ margin: '0 2px' }} />

        {/* Right Panel: Head Girl */}
        <div
          className="flex-1 glass-card-girl rounded-2xl relative overflow-hidden"
          style={{
            border: '1px solid rgba(255,60,180,0.3)',
            boxShadow: '0 0 40px rgba(200,0,100,0.15), inset 0 0 30px rgba(150,0,80,0.1)',
            padding: '14px 14px 10px',
            marginLeft: '8px',
          }}
        >
          {/* Inner glow top */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,60,180,0.5), transparent)' }}
          />
          <PanelSection
            panel="girl"
            candidates={GIRL_CANDIDATES}
            selectedId={girlVote}
            onSelect={setGirlVote}
            onVote={handleGirlVote}
          />
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="flex-shrink-0 relative"
        style={{
          background: 'linear-gradient(180deg, rgba(0,8,30,0.98), rgba(0,5,20,0.99))',
          borderTop: '1px solid rgba(0,150,255,0.2)',
          padding: '8px 20px',
        }}
      >
        {/* Top line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,180,255,0.4) 30%, rgba(255,215,0,0.4) 50%, rgba(255,60,180,0.4) 70%, transparent)' }}
        />

        <div className="flex items-center justify-between gap-4">
          {/* Left Spacer to keep layout centered */}
          <div className="flex-shrink-0" style={{ minWidth: '180px' }} />

          {/* Center: CONFIRM VOTE button */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <button
              id="confirm-vote-btn"
              onClick={handleConfirmClick}
              disabled={!canConfirm}
              className="confirm-btn rounded-2xl relative transition-all"
              style={{
                fontFamily: 'Orbitron',
                fontWeight: 900,
                fontSize: 'clamp(0.9rem, 2vw, 1.3rem)',
                letterSpacing: '0.18em',
                padding: '14px 48px',
                color: '#1a0a00',
                borderRadius: '16px',
                opacity: canConfirm ? 1 : 0.5,
                cursor: canConfirm ? 'pointer' : 'not-allowed',
                filter: canConfirm ? 'none' : 'grayscale(0.5)',
              }}
            >
              <span className="relative z-10">CONFIRM VOTE »</span>
            </button>

            {/* Selection indicators */}
            <div className="flex gap-4">
              <div
                className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: 'Rajdhani',
                  background: boyVote ? 'rgba(0,100,200,0.3)' : 'rgba(255,255,255,0.05)',
                  border: boyVote ? '1px solid rgba(0,200,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: boyVote ? '#00d4ff' : '#666',
                }}
              >
                {boyVote ? '✓' : '○'} Head Boy {boyVote ? `— ${selectedBoy?.name}` : 'Not Selected'}
              </div>
              <div
                className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: 'Rajdhani',
                  background: girlVote ? 'rgba(200,0,100,0.3)' : 'rgba(255,255,255,0.05)',
                  border: girlVote ? '1px solid rgba(255,60,180,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: girlVote ? '#ff3cba' : '#666',
                }}
              >
                {girlVote ? '✓' : '○'} Head Girl {girlVote ? `— ${selectedGirl?.name}` : 'Not Selected'}
              </div>
            </div>
          </div>

          {/* Right: Secure badge */}
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-xl flex-shrink-0"
            style={{
              background: 'rgba(0,20,60,0.8)',
              border: '1px solid rgba(0,150,255,0.3)',
              boxShadow: '0 0 15px rgba(0,80,200,0.2)',
              minWidth: '180px',
            }}
          >
            <div className="text-3xl" style={{ filter: 'drop-shadow(0 0 8px rgba(0,200,255,0.5))' }}>
              🔒
            </div>
            <div>
              <div className="text-cyan-300 font-bold uppercase tracking-wide" style={{ fontFamily: 'Orbitron', fontSize: '0.6rem' }}>
                Secure Voting System
              </div>
              <div className="text-gray-400 text-xs" style={{ fontFamily: 'Rajdhani', fontSize: '0.7rem' }}>
                Your Vote, Your Voice
              </div>
            </div>
          </div>
        </div>

        {/* Bottom ticker */}
        <div
          className="mt-2 overflow-hidden"
          style={{
            borderTop: '1px solid rgba(0,100,255,0.15)',
            paddingTop: '5px',
          }}
        >
          <div
            className="ticker-text text-gray-500 uppercase tracking-widest"
            style={{ fontFamily: 'Orbitron', fontSize: '0.55rem' }}
          >
            ✦ Please select ONE Head Boy and ONE Head Girl before confirming your vote &nbsp;&nbsp;&nbsp;
            ✦ Your vote is confidential and secure &nbsp;&nbsp;&nbsp;
            ✦ After selection, click CONFIRM VOTE to submit &nbsp;&nbsp;&nbsp;
            ✦ Each student may vote only once &nbsp;&nbsp;&nbsp;
            ✦ School Council Election 2026-27 &nbsp;&nbsp;&nbsp;
            ✦ Shree H.J. Gajera English Medium School &nbsp;&nbsp;&nbsp;
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      {showModal && selectedBoy && selectedGirl && (
        <ConfirmModal
          boyName={selectedBoy.name}
          girlName={selectedGirl.name}
          boySymbol={selectedBoy.symbol}
          girlSymbol={selectedGirl.symbol}
          onConfirm={handleFinalSubmit}
          onCancel={() => setShowModal(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {showSuccess && selectedBoy && selectedGirl && (
        <SuccessOverlay
          boyName={selectedBoy.name}
          girlName={selectedGirl.name}
          onDismiss={handleSuccessDismiss}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<StudentVoting />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
