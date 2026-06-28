import { useEffect, useState } from 'react';

const Clock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update every 10ms so milliseconds are visible
    const timer = setInterval(() => setNow(new Date()), 10);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number, len = 2) => String(n).padStart(len, '0');

  const dateStr = now
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    .toUpperCase();

  const hh  = pad(now.getHours());
  const mm  = pad(now.getMinutes());
  const ss  = pad(now.getSeconds());
  const ms  = pad(Math.floor(now.getMilliseconds() / 10)); // 2-digit centiseconds

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(0,20,60,0.92), rgba(0,30,80,0.88))',
        border: '1px solid rgba(0,200,255,0.35)',
        boxShadow: '0 0 18px rgba(0,120,255,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
        minWidth: '230px',
      }}
    >
      {/* Clock icon */}
      <svg
        className="flex-shrink-0"
        style={{ width: '20px', height: '20px', color: '#00d4ff', filter: 'drop-shadow(0 0 4px #00d4ff)' }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <div className="flex flex-col gap-0.5">
        {/* Date */}
        <div
          className="text-cyan-400 font-bold tracking-wide"
          style={{ fontFamily: 'Orbitron', fontSize: '0.6rem', lineHeight: 1, letterSpacing: '0.08em' }}
        >
          {dateStr}
        </div>

        {/* HH : MM : SS . ms */}
        <div className="flex items-end gap-0.5" style={{ fontFamily: 'Orbitron' }}>
          {/* Hours */}
          <div className="flex flex-col items-center">
            <span className="text-white font-black" style={{ fontSize: '1.05rem', lineHeight: 1, textShadow: '0 0 8px rgba(0,200,255,0.6)' }}>
              {hh}
            </span>
            <span className="text-cyan-500 uppercase" style={{ fontSize: '0.38rem', letterSpacing: '0.05em' }}>HR</span>
          </div>

          <span className="text-cyan-400 font-black pb-3" style={{ fontSize: '0.95rem', lineHeight: 1, animation: 'hudPulse 1s ease-in-out infinite' }}>:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className="text-white font-black" style={{ fontSize: '1.05rem', lineHeight: 1, textShadow: '0 0 8px rgba(0,200,255,0.6)' }}>
              {mm}
            </span>
            <span className="text-cyan-500 uppercase" style={{ fontSize: '0.38rem', letterSpacing: '0.05em' }}>MIN</span>
          </div>

          <span className="text-cyan-400 font-black pb-3" style={{ fontSize: '0.95rem', lineHeight: 1 }}>:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span className="text-yellow-300 font-black" style={{ fontSize: '1.05rem', lineHeight: 1, textShadow: '0 0 8px rgba(255,220,0,0.6)' }}>
              {ss}
            </span>
            <span className="text-yellow-500 uppercase" style={{ fontSize: '0.38rem', letterSpacing: '0.05em' }}>SEC</span>
          </div>

          <span className="text-gray-500 font-black pb-3" style={{ fontSize: '0.75rem', lineHeight: 1 }}>.</span>

          {/* Milliseconds (centiseconds) */}
          <div className="flex flex-col items-center">
            <span className="text-green-400 font-black" style={{ fontSize: '1.05rem', lineHeight: 1, textShadow: '0 0 8px rgba(0,255,120,0.5)' }}>
              {ms}
            </span>
            <span className="text-green-600 uppercase" style={{ fontSize: '0.38rem', letterSpacing: '0.05em' }}>MS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clock;
