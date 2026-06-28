import { useEffect } from 'react';

interface Props {
  boyName: string;
  girlName: string;
  onDismiss: () => void;
}

const SuccessOverlay = ({ boyName, girlName, onDismiss }: Props) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="success-overlay">
      <div className="success-card px-8 py-12 max-w-lg w-full text-center">
        {/* Animated checkmark ring */}
        <div className="flex justify-center mb-6">
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,80,0,0.4), rgba(0,150,0,0.3))',
              border: '3px solid rgba(0,255,100,0.7)',
              boxShadow: '0 0 40px rgba(0,255,100,0.5), 0 0 80px rgba(0,200,80,0.3)',
              animation: 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
            }}
          >
            <span style={{ fontSize: '3.5rem' }}>✅</span>
          </div>
        </div>

        <h1
          className="font-black uppercase mb-2"
          style={{
            fontFamily: 'Orbitron',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.1em',
          }}
        >
          Vote Cast Successfully!
        </h1>

        <p
          className="text-green-300 text-base mb-8"
          style={{ fontFamily: 'Rajdhani', letterSpacing: '0.05em' }}
        >
          Your vote has been recorded securely
        </p>

        {/* Vote summary */}
        <div
          className="rounded-2xl p-5 mb-8"
          style={{
            background: 'rgba(0,20,60,0.8)',
            border: '1px solid rgba(0,200,255,0.3)',
            boxShadow: '0 0 30px rgba(0,100,255,0.2)',
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-cyan-400 uppercase tracking-widest mb-1" style={{ fontFamily: 'Orbitron' }}>
                Head Boy
              </div>
              <div className="text-cyan-100 font-bold text-lg" style={{ fontFamily: 'Rajdhani' }}>
                {boyName}
              </div>
            </div>
            <div>
              <div className="text-xs text-pink-400 uppercase tracking-widest mb-1" style={{ fontFamily: 'Orbitron' }}>
                Head Girl
              </div>
              <div className="text-pink-100 font-bold text-lg" style={{ fontFamily: 'Rajdhani' }}>
                {girlName}
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'Rajdhani' }}>
          Thank you for participating in the democratic process!
        </p>

        <div
          className="text-gray-600 text-xs"
          style={{ fontFamily: 'Orbitron' }}
        >
          Auto-closing in 2 seconds...
        </div>
      </div>
    </div>
  );
};

export default SuccessOverlay;
