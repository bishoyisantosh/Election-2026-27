import { useState, useEffect } from 'react';
import { BOY_CANDIDATES, GIRL_CANDIDATES, SCHOOL_INFO } from '../data';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface SortedCandidate {
  id: number;
  name: string;
  symbol: string;
  symbolLabel: string;
  symbolImage?: string;
  photo: string;
  serialNo: number;
  votes: number;
}

export default function MobileResults() {
  const [sortedBoys, setSortedBoys] = useState<SortedCandidate[]>([]);
  const [sortedGirls, setSortedGirls] = useState<SortedCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const votesColRef = collection(db, 'votes');

    // Live subscription to votes collection
    const unsubscribe = onSnapshot(votesColRef, (snapshot) => {
      const hbCounts: { [name: string]: number } = {};
      const hgCounts: { [name: string]: number } = {};

      // Seed all candidates with 0 votes initially
      BOY_CANDIDATES.forEach((c) => { hbCounts[c.name] = 0; });
      GIRL_CANDIDATES.forEach((c) => { hgCounts[c.name] = 0; });

      // Count votes
      snapshot.forEach((doc) => {
        const data = doc.data();
        const hbName = data.headBoy;
        const hgName = data.headGirl;

        if (hbCounts[hbName] !== undefined) hbCounts[hbName]++;
        if (hgCounts[hgName] !== undefined) hgCounts[hgName]++;
      });

      // Map and sort boys
      const mappedBoys = BOY_CANDIDATES.map((cand) => ({
        ...cand,
        votes: hbCounts[cand.name] || 0,
      })).sort((a, b) => b.votes - a.votes);

      // Map and sort girls
      const mappedGirls = GIRL_CANDIDATES.map((cand) => ({
        ...cand,
        votes: hgCounts[cand.name] || 0,
      })).sort((a, b) => b.votes - a.votes);

      setSortedBoys(mappedBoys);
      setSortedGirls(mappedGirls);
      setLoading(false);
    }, (error) => {
      console.error("Firestore live result tracking failed:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Add scrollable helper classes when entering /mobile route
    document.documentElement.classList.add('scrollable-page');
    document.body.classList.add('scrollable-page');

    return () => {
      // Remove scrollable helper classes when leaving /mobile route
      document.documentElement.classList.remove('scrollable-page');
      document.body.classList.remove('scrollable-page');
    };
  }, []);

  const leadBoy = sortedBoys[0] || null;
  const leadGirl = sortedGirls[0] || null;

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 font-inter">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-4"></div>
        <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest font-orbitron animate-pulse">
          Loading Live Results...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex justify-center font-inter antialiased select-none overflow-y-visible">
      
      {/* Dynamic inline styles for smooth absolute list transitions and crown glows */}
      <style>{`
        .mobile-container {
          width: 100%;
          max-width: 480px;
          min-width: 320px;
          min-height: 100vh;
          background: linear-gradient(180deg, #020813 0%, #030f25 100%);
          border-left: 1px solid rgba(0, 150, 255, 0.15);
          border-right: 1px solid rgba(0, 150, 255, 0.15);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-y: visible;
          overflow-x: hidden;
        }
        
        /* Absolute positioned card wrapper for smooth sliding list animations */
        .list-container {
          position: relative;
          height: ${BOY_CANDIDATES.length * 106}px;
          margin-top: 10px;
        }

        .animated-card {
          position: absolute;
          left: 0;
          right: 0;
          height: 94px;
          transition: transform 0.45s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.45s ease, box-shadow 0.45s ease;
        }

        /* Leader badge animations */
        .leader-glow {
          border: 2px solid rgba(234, 179, 8, 0.9) !important;
          box-shadow: 0 0 20px rgba(234, 179, 8, 0.25), inset 0 0 15px rgba(234, 179, 8, 0.1) !important;
          animation: leaderPulse 2.5s infinite ease-in-out;
        }

        @keyframes leaderPulse {
          0%, 100% {
            box-shadow: 0 0 16px rgba(234, 179, 8, 0.25), inset 0 0 12px rgba(234, 179, 8, 0.05);
            border-color: rgba(234, 179, 8, 0.7);
          }
          50% {
            box-shadow: 0 0 28px rgba(234, 179, 8, 0.45), inset 0 0 20px rgba(234, 179, 8, 0.15);
            border-color: rgba(234, 179, 8, 1);
          }
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background-color: #f43f5e;
          border-radius: 50%;
          position: relative;
          display: inline-block;
          flex-shrink: 0;
        }

        .live-dot::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: #f43f5e;
          animation: livePing 1.6s infinite ease-in-out;
        }

        @keyframes livePing {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>

      <div className="mobile-container flex flex-col pb-[120px]">
        {/* ================= HEADER ================= */}
        <header className="px-5 pt-6 pb-4 border-b border-cyan-950/40 bg-black/30 text-center relative flex flex-col items-center">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          {/* School Logo */}
          <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden p-1.5 border border-cyan-500/20 mb-3 shadow-[0_0_20px_rgba(0,150,255,0.15)] flex items-center justify-center flex-shrink-0">
            <img src="/images/gajera_logo.png" alt="School Logo" className="w-full h-full object-contain" />
          </div>

          <h1 className="font-extrabold uppercase text-xs tracking-wider text-gray-400 font-orbitron leading-tight text-center">
            {SCHOOL_INFO.name}
          </h1>
          <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-0.5 font-rajdhani">
            {SCHOOL_INFO.subtitle}
          </p>
          <div className="h-px w-20 bg-cyan-950/60 mx-auto my-2" />
          <h2 className="font-black text-sm uppercase tracking-wide text-white font-orbitron">
            {SCHOOL_INFO.electionTitle}
          </h2>
          
          {/* Pulsing Live indicator */}
          <div className="flex items-center justify-center gap-2 mt-2 bg-rose-950/50 border border-rose-500/20 px-3 py-1 rounded-full w-fit mx-auto">
            <span className="live-dot"></span>
            <span className="text-[10px] font-black tracking-widest text-rose-300 font-orbitron uppercase">
              LIVE RESULTS
            </span>
          </div>
        </header>

        {/* ================= SECTIONS ================= */}
        <main className="flex-1 px-4 py-4 space-y-6">
          
          {/* HEAD BOY SECTION */}
          <section>
            <h3 className="font-black uppercase tracking-wider text-xs font-orbitron text-cyan-400 flex items-center gap-1.5 mb-2 border-b border-cyan-950/40 pb-1.5">
              <span>👑</span> HEAD BOY
            </h3>
            
            <div className="list-container">
              {sortedBoys.map((cand, idx) => {
                const isLeader = idx === 0;
                // Calculate correct card index in the rendered array matching ID
                const cardIndex = sortedBoys.findIndex((x) => x.id === cand.id);

                return (
                  <div
                    key={cand.id}
                    className="animated-card"
                    style={{ transform: `translateY(${cardIndex * 104}px)` }}
                  >
                    <div
                      className={`h-full bg-slate-900/60 border rounded-2xl p-3.5 flex items-center justify-between gap-3 ${
                        isLeader ? 'leader-glow border-yellow-500/50' : 'border-cyan-500/10'
                      }`}
                    >
                      {/* Left: Rank Badge */}
                      <div className="flex flex-col items-center justify-center flex-shrink-0">
                        {isLeader ? (
                          <span className="text-yellow-400 text-lg animate-bounce" title="Leader">👑</span>
                        ) : null}
                        <span
                          className={`font-black font-orbitron text-sm ${
                            isLeader ? 'text-yellow-400' : 'text-gray-500'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Photo */}
                      <div className="w-12 h-14 rounded-xl overflow-hidden border border-cyan-500/20 bg-slate-950/80 flex-shrink-0 relative">
                        <img
                          src={cand.photo}
                          alt={cand.name}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xl bg-cyan-950/30">${cand.symbol}</div>`;
                            }
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm uppercase tracking-wide truncate text-gray-100 font-orbitron">
                          {cand.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {cand.symbolImage ? (
                            <img
                              src={cand.symbolImage}
                              alt={cand.symbolLabel}
                              className="w-5 h-5 rounded-full border border-cyan-500/40 object-cover"
                            />
                          ) : (
                            <span className="text-xs">{cand.symbol}</span>
                          )}
                          <span className="text-[10px] font-bold text-cyan-400 font-rajdhani uppercase tracking-wider">
                            {cand.symbolLabel}
                          </span>
                        </div>
                      </div>

                      {/* Right: Votes Counter */}
                      <div className="text-right flex-shrink-0 pl-1">
                        <div className={`font-black font-orbitron text-2xl ${
                          isLeader ? 'text-yellow-400' : 'text-cyan-400'
                        }`}>
                          {cand.votes}
                        </div>
                        <div className="text-[8px] font-bold text-gray-500 font-orbitron uppercase tracking-wider">
                          votes
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* HEAD GIRL SECTION */}
          <section>
            <h3 className="font-black uppercase tracking-wider text-xs font-orbitron text-pink-400 flex items-center gap-1.5 mb-2 border-b border-pink-950/40 pb-1.5">
              <span>💖</span> HEAD GIRL
            </h3>
            
            <div className="list-container">
              {sortedGirls.map((cand, idx) => {
                const isLeader = idx === 0;
                const cardIndex = sortedGirls.findIndex((x) => x.id === cand.id);

                return (
                  <div
                    key={cand.id}
                    className="animated-card"
                    style={{ transform: `translateY(${cardIndex * 104}px)` }}
                  >
                    <div
                      className={`h-full bg-slate-900/60 border rounded-2xl p-3.5 flex items-center justify-between gap-3 ${
                        isLeader ? 'leader-glow border-yellow-500/50' : 'border-pink-500/10'
                      }`}
                    >
                      {/* Left: Rank Badge */}
                      <div className="flex flex-col items-center justify-center flex-shrink-0">
                        {isLeader ? (
                          <span className="text-yellow-400 text-lg animate-bounce" title="Leader">👑</span>
                        ) : null}
                        <span
                          className={`font-black font-orbitron text-sm ${
                            isLeader ? 'text-yellow-400' : 'text-gray-500'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Photo */}
                      <div className="w-12 h-14 rounded-xl overflow-hidden border border-pink-500/20 bg-slate-950/80 flex-shrink-0 relative">
                        <img
                          src={cand.photo}
                          alt={cand.name}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xl bg-pink-950/30">${cand.symbol}</div>`;
                            }
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm uppercase tracking-wide truncate text-gray-100 font-orbitron">
                          {cand.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {cand.symbolImage ? (
                            <img
                              src={cand.symbolImage}
                              alt={cand.symbolLabel}
                              className="w-5 h-5 rounded-full border border-pink-500/40 object-cover"
                            />
                          ) : (
                            <span className="text-xs">{cand.symbol}</span>
                          )}
                          <span className="text-[10px] font-bold text-pink-400 font-rajdhani uppercase tracking-wider">
                            {cand.symbolLabel}
                          </span>
                        </div>
                      </div>

                      {/* Right: Votes Counter */}
                      <div className="text-right flex-shrink-0 pl-1">
                        <div className={`font-black font-orbitron text-2xl ${
                          isLeader ? 'text-yellow-400' : 'text-pink-400'
                        }`}>
                          {cand.votes}
                        </div>
                        <div className="text-[8px] font-bold text-gray-500 font-orbitron uppercase tracking-wider">
                          votes
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </main>

        {/* ================= FOOTER ================= */}
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#030917]/95 border-t border-cyan-900/40 backdrop-blur-md px-6 py-4 flex flex-col gap-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] z-40">
          <div className="text-center font-black uppercase text-[10px] tracking-widest text-yellow-400 font-orbitron mb-1 flex items-center justify-center gap-1">
            <span>🏆</span> CURRENT LEADERS <span>🏆</span>
          </div>
          
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1.5 truncate pr-2 max-w-[50%]">
              <span className="text-cyan-400 text-sm">👑</span>
              <span className="text-gray-400 text-[10px] font-orbitron uppercase mr-1 flex-shrink-0">HB:</span>
              <span className="font-extrabold text-white truncate uppercase font-orbitron tracking-wide">
                {leadBoy ? leadBoy.name.split(' ')[0] : 'NO LEADER'}
              </span>
            </div>

            <div className="h-4 w-px bg-cyan-900/40" />

            <div className="flex items-center gap-1.5 truncate pl-2 max-w-[50%] justify-end">
              <span className="text-pink-400 text-sm">👑</span>
              <span className="text-gray-400 text-[10px] font-orbitron uppercase mr-1 flex-shrink-0">HG:</span>
              <span className="font-extrabold text-white truncate uppercase font-orbitron tracking-wide">
                {leadGirl ? leadGirl.name.split(' ')[0] : 'NO LEADER'}
              </span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
