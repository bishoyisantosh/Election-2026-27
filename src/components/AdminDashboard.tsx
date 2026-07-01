import { useState, useEffect } from 'react';
import { BOY_CANDIDATES, GIRL_CANDIDATES, SCHOOL_INFO } from '../data';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface VoteDoc {
  voteId: string;
  headBoy: string;
  headGirl: string;
  date: string;
  time: string;
  timestamp: any;
}

const AdminDashboard = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [votes, setVotes] = useState<VoteDoc[]>([]);
  const [lastVote, setLastVote] = useState<VoteDoc | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');

  // Password submission handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('❌ Invalid Admin Password');
    }
  };

  // Listen to Firestore votes collection in real-time
  useEffect(() => {
    if (!isAuthenticated) return;

    const votesColRef = collection(db, 'votes');
    // Listen to all votes for statistics
    const unsubscribeAll = onSnapshot(votesColRef, (snapshot) => {
      const votesList: VoteDoc[] = [];
      snapshot.forEach((doc) => {
        votesList.push(doc.data() as VoteDoc);
      });
      setVotes(votesList);
    });

    // Listen to the latest vote for "Last Vote Time"
    const latestQuery = query(votesColRef, orderBy('timestamp', 'desc'), limit(1));
    const unsubscribeLatest = onSnapshot(latestQuery, (snapshot) => {
      if (!snapshot.empty) {
        const latestDoc = snapshot.docs[0].data() as VoteDoc;
        setLastVote(latestDoc);
      }
    });

    return () => {
      unsubscribeAll();
      unsubscribeLatest();
    };
  }, [isAuthenticated]);

  // Statistics calculation
  const totalVotesCast = votes.length;
  const remainingVotes = Math.max(0, SCHOOL_INFO.totalStudents - totalVotesCast);
  const votingPercentage = ((totalVotesCast / SCHOOL_INFO.totalStudents) * 100).toFixed(1);

  // Export to Excel function
  const exportToExcel = () => {
    if (votes.length === 0) {
      alert("No votes cast yet to export.");
      return;
    }

    // Format fields exactly as requested
    const formattedData = votes.map((v) => ({
      "Vote ID": v.voteId,
      "Head Boy": v.headBoy,
      "Head Girl": v.headGirl,
      "Date": v.date,
      "Time": v.time,
    }));

    // Create workbook and sheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Votes Report");

    // Auto-fit column widths
    worksheet["!cols"] = [
      { wch: 18 }, // Vote ID
      { wch: 25 }, // Head Boy
      { wch: 25 }, // Head Girl
      { wch: 15 }, // Date
      { wch: 15 }, // Time
    ];

    // Download spreadsheet
    XLSX.writeFile(workbook, `Gajera_School_Election_Votes_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Reset Election function
  const triggerResetClick = () => {
    setResetPassword('');
    setResetError('');
    setShowResetModal(true);
  };

  const handleResetElection = async () => {
    if (resetPassword !== '8200653866') {
      setResetError('❌ Incorrect password. Access Denied!');
      return;
    }

    const confirmWipe = window.confirm("⚠️ WARNING: This will permanently delete ALL recorded votes from Firestore and reset all statistics to zero. This action CANNOT be undone!\n\nAre you sure you want to proceed?");
    if (!confirmWipe) return;

    try {
      const votesColRef = collection(db, 'votes');
      const querySnapshot = await getDocs(votesColRef);
      
      if (querySnapshot.empty) {
        alert("ℹ️ Information: No votes found to delete.");
        setShowResetModal(false);
        return;
      }

      // Delete all documents concurrently using explicit doc reference to avoid scopes issue
      const deletePromises = querySnapshot.docs.map(item => deleteDoc(doc(db, 'votes', item.id)));
      await Promise.all(deletePromises);
      
      alert("✅ Success: The election has been reset successfully! All votes have been cleared.");
      // Force reload page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error("Error resetting election: ", error);
      alert(`❌ Failed to reset election: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setShowResetModal(false);
    }
  };

  // Candidate vote mapping
  const getBoyVotes = (name: string) => votes.filter((v) => v.headBoy === name).length;
  const getGirlVotes = (name: string) => votes.filter((v) => v.headGirl === name).length;

  // Map and sort Boy candidates by vote count
  const sortedBoyCandidates = BOY_CANDIDATES.map((cand) => ({
    ...cand,
    votes: getBoyVotes(cand.name),
  })).sort((a, b) => b.votes - a.votes);

  // Map and sort Girl candidates by vote count
  const sortedGirlCandidates = GIRL_CANDIDATES.map((cand) => ({
    ...cand,
    votes: getGirlVotes(cand.name),
  })).sort((a, b) => b.votes - a.votes);

  // Render Login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="main-bg grid-overlay min-h-screen flex items-center justify-center p-6">
        <div
          className="glass-card rounded-3xl p-10 max-w-md w-full text-center relative border border-cyan-500/30"
          style={{
            boxShadow: '0 0 50px rgba(0,180,255,0.15), inset 0 0 30px rgba(0,100,255,0.05)',
          }}
        >
          {/* Neon line */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg, #00b4ff, #ff007f)' }}
          />

          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: 'linear-gradient(135deg, #001a40, #002b66)',
                border: '2px solid rgba(0,180,255,0.5)',
                boxShadow: '0 0 25px rgba(0,150,255,0.4)',
              }}
            >
              🔒
            </div>
          </div>

          <h2 className="text-white font-black uppercase tracking-widest text-xl mb-2 font-orbitron">
            Admin Console
          </h2>
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-8 font-rajdhani">
            Authorization Required
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                placeholder="ENTER ADMIN PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl text-center text-white tracking-widest font-bold placeholder-gray-500 transition-all border border-cyan-500/30 bg-black/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,180,255,0.3)]"
                style={{ fontFamily: 'Orbitron', fontSize: '0.85rem' }}
                autoFocus
              />
            </div>

            {errorMsg && (
              <div
                className="text-xs font-bold font-rajdhani py-2 px-4 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400"
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs confirm-btn hover:scale-[1.02] active:scale-[0.98] transition-all"
              style={{
                fontFamily: 'Orbitron',
                background: 'linear-gradient(135deg, #0088ff, #00b4ff)',
                color: '#fff',
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
              }}
            >
              Access Dashboard »
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Helper to render rank badges
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return { label: '1ST', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/40 shadow-yellow-500/20' };
      case 1:
        return { label: '2ND', color: 'text-slate-300', bg: 'bg-slate-500/20 border-slate-500/40 shadow-slate-500/20' };
      case 2:
        return { label: '3RD', color: 'text-amber-600', bg: 'bg-amber-700/20 border-amber-700/40 shadow-amber-700/20' };
      default:
        return { label: '4TH', color: 'text-gray-500', bg: 'bg-gray-800/30 border-gray-700/20 shadow-transparent' };
    }
  };

  return (
    <div className="main-bg grid-overlay min-h-screen text-white flex flex-col font-inter">
      {/* ── HEADER ── */}
      <header
        className="px-6 py-4 flex-shrink-0 relative"
        style={{
          background: 'rgba(0,10,30,0.85)',
          borderBottom: '2.5px solid rgba(0,150,255,0.4)',
          boxShadow: '0 4px 30px rgba(0,80,200,0.3)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex-shrink-0 rounded-2xl overflow-hidden"
              style={{
                width: '64px',
                height: '64px',
                background: 'white',
                border: '2px solid rgba(0,180,255,0.6)',
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
                className="font-black uppercase leading-tight font-orbitron"
                style={{
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)',
                  letterSpacing: '0.05em',
                  textShadow: '0 0 15px rgba(0,200,255,0.7)',
                }}
              >
                {SCHOOL_INFO.name}
              </h1>
              <p
                className="text-cyan-300 font-bold uppercase tracking-widest text-xs font-rajdhani mt-0.5"
                style={{ letterSpacing: '0.12em' }}
              >
                {SCHOOL_INFO.subtitle}
              </p>
            </div>
          </div>

          <div className="text-center px-4">
            <div
              className="text-xs uppercase tracking-widest font-black font-orbitron py-1 px-4 rounded-full border bg-cyan-950/40"
              style={{
                borderColor: 'rgba(0,200,255,0.5)',
                color: '#00d4ff',
                boxShadow: '0 0 15px rgba(0,150,255,0.2)',
              }}
            >
              ADMIN LIVE STATISTICS PANEL
            </div>
          </div>

          <div className="flex items-center gap-3 font-orbitron">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 border bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-1.5 cursor-pointer"
            >
              📊 Export to Excel
            </button>
            <button
              onClick={triggerResetClick}
              className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 border bg-rose-950/40 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)] flex items-center gap-1.5 cursor-pointer mr-2"
            >
              🗑️ Reset Election
            </button>
            <button
              onClick={() => window.location.pathname = '/'}
              className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 border bg-red-950/40 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(200,0,0,0.2)] cursor-pointer"
            >
              Logout Console
            </button>
          </div>
        </div>
      </header>

      {/* ── STATS CARDS ROW ── */}
      <div className="px-6 py-6 grid grid-cols-3 gap-6 flex-shrink-0">
        {/* Card 1: Total Votes */}
        <div
          className="glass-card rounded-2xl p-5 border border-cyan-500/30 flex items-center justify-between"
          style={{ boxShadow: '0 0 25px rgba(0,120,255,0.1)' }}
        >
          <div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1 font-orbitron">
              Total Votes Cast
            </div>
            <div
              className="text-4xl font-black font-orbitron text-cyan-400 animate-pulse"
              style={{ textShadow: '0 0 15px rgba(0,200,255,0.5)' }}
            >
              {totalVotesCast.toString().padStart(4, '0')}
            </div>
          </div>
          <div className="text-4xl">🗳️</div>
        </div>

        {/* Card 2: Remaining Votes */}
        <div
          className="glass-card rounded-2xl p-5 border border-pink-500/30 flex items-center justify-between"
          style={{ boxShadow: '0 0 25px rgba(255,0,120,0.1)' }}
        >
          <div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1 font-orbitron">
              Remaining Votes
            </div>
            <div
              className="text-4xl font-black font-orbitron text-pink-400"
              style={{ textShadow: '0 0 15px rgba(255,60,180,0.5)' }}
            >
              {remainingVotes.toString().padStart(4, '0')}
            </div>
          </div>
          <div className="text-4xl">👥</div>
        </div>

        {/* Card 3: Voting Percentage */}
        <div
          className="glass-card rounded-2xl p-5 border border-yellow-500/30 flex items-center justify-between"
          style={{ boxShadow: '0 0 25px rgba(255,200,0,0.1)' }}
        >
          <div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1 font-orbitron">
              Voting Percentage
            </div>
            <div
              className="text-4xl font-black font-orbitron text-yellow-400"
              style={{ textShadow: '0 0 15px rgba(255,180,0,0.5)' }}
            >
              {votingPercentage}%
            </div>
          </div>
          <div className="text-4xl">📈</div>
        </div>
      </div>

      {/* ── CANDIDATE STANDINGS ROW ── */}
      <div className="px-6 flex-1 grid grid-cols-2 gap-6 min-h-0 pb-6">
        {/* Left: Head Boy Rankings */}
        <div
          className="glass-card rounded-3xl p-6 border border-cyan-500/30 flex flex-col min-h-0"
          style={{ boxShadow: '0 0 30px rgba(0,80,200,0.1)' }}
        >
          <h2 className="text-lg font-black uppercase tracking-wider mb-4 font-orbitron text-cyan-400 flex items-center gap-2">
            <span>👑</span> Head Boy Standings
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {sortedBoyCandidates.map((cand, index) => {
              const badge = getRankBadge(index);
              const percentageOfVotes = totalVotesCast > 0 ? ((cand.votes / totalVotesCast) * 100).toFixed(1) : '0.0';
              return (
                <div
                  key={cand.id}
                  className="rounded-2xl p-4 flex items-center justify-between gap-4 border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
                  style={{ background: 'rgba(0,10,30,0.5)' }}
                >
                  {/* Rank Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border font-black font-orbitron text-center text-xs w-14 ${badge.bg} ${badge.color}`}
                  >
                    {badge.label}
                  </div>

                  {/* Photo */}
                  <div
                    className="w-14 h-16 rounded-lg overflow-hidden border border-cyan-500/30 flex-shrink-0"
                  >
                    <img
                      src={cand.photo}
                      alt={cand.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name & Progress bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-lg uppercase tracking-wider truncate font-orbitron text-cyan-100">
                        {cand.name}
                      </span>
                      {cand.symbolImage ? (
                        <img
                          src={cand.symbolImage}
                          alt={cand.symbolLabel}
                          className="w-12 h-12 rounded-full border-2 border-cyan-500/40 object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{cand.symbol}</span>
                      )}
                    </div>
                    {/* Progress bar container */}
                    <div className="w-full h-2.5 rounded-full bg-cyan-950/40 overflow-hidden border border-cyan-500/10">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,180,255,0.7)]"
                        style={{ width: `${percentageOfVotes}%`, transition: 'width 0.8s ease-out' }}
                      />
                    </div>
                  </div>

                  {/* Votes Count */}
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-cyan-400 font-black text-3xl font-orbitron">
                      {cand.votes}
                    </div>
                    <div className="text-gray-500 text-[0.7rem] uppercase tracking-wider font-orbitron mt-0.5">
                      {percentageOfVotes}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Head Girl Rankings */}
        <div
          className="glass-card rounded-3xl p-6 border border-pink-500/30 flex flex-col min-h-0"
          style={{ boxShadow: '0 0 30px rgba(200,0,120,0.1)' }}
        >
          <h2 className="text-lg font-black uppercase tracking-wider mb-4 font-orbitron text-pink-400 flex items-center gap-2">
            <span>💖</span> Head Girl Standings
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {sortedGirlCandidates.map((cand, index) => {
              const badge = getRankBadge(index);
              const percentageOfVotes = totalVotesCast > 0 ? ((cand.votes / totalVotesCast) * 100).toFixed(1) : '0.0';
              return (
                <div
                  key={cand.id}
                  className="rounded-2xl p-4 flex items-center justify-between gap-4 border border-pink-500/10 hover:border-pink-500/30 transition-all"
                  style={{ background: 'rgba(20,0,15,0.4)' }}
                >
                  {/* Rank Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border font-black font-orbitron text-center text-xs w-14 ${badge.bg} ${badge.color}`}
                  >
                    {badge.label}
                  </div>

                  {/* Photo */}
                  <div
                    className="w-14 h-16 rounded-lg overflow-hidden border border-pink-500/30 flex-shrink-0"
                  >
                    <img
                      src={cand.photo}
                      alt={cand.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name & Progress bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-lg uppercase tracking-wider truncate font-orbitron text-pink-100">
                        {cand.name}
                      </span>
                      {cand.symbolImage ? (
                        <img
                          src={cand.symbolImage}
                          alt={cand.symbolLabel}
                          className="w-12 h-12 rounded-full border-2 border-pink-500/40 object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{cand.symbol}</span>
                      )}
                    </div>
                    {/* Progress bar container */}
                    <div className="w-full h-2.5 rounded-full bg-pink-950/40 overflow-hidden border border-pink-500/10">
                      <div
                        className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full shadow-[0_0_8px_rgba(255,60,180,0.7)]"
                        style={{ width: `${percentageOfVotes}%`, transition: 'width 0.8s ease-out' }}
                      />
                    </div>
                  </div>

                  {/* Votes Count */}
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-pink-400 font-black text-3xl font-orbitron">
                      {cand.votes}
                    </div>
                    <div className="text-gray-500 text-[0.7rem] uppercase tracking-wider font-orbitron mt-0.5">
                      {percentageOfVotes}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── LAST VOTE DETAILS FOOTER TICKER ── */}
      <footer
        className="px-6 py-4 flex-shrink-0 border-t border-cyan-500/20"
        style={{ background: 'rgba(0,10,25,0.9)' }}
      >
        <div className="flex items-center justify-between text-xs font-rajdhani">
          <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider">
            <span className="animate-ping w-2 h-2 rounded-full bg-green-400" />
            <span>Real-time Status: Connected to Cloud Firestore</span>
          </div>

          <div className="text-gray-400 uppercase tracking-widest font-orbitron text-[0.7rem]">
            {lastVote ? (
              <span>
                Last Vote Recorded: ID <strong className="text-cyan-400">{lastVote.voteId}</strong> (HB:{' '}
                <strong className="text-cyan-300">{lastVote.headBoy}</strong> | HG:{' '}
                <strong className="text-pink-300">{lastVote.headGirl}</strong>) at{' '}
                <strong className="text-yellow-400">{lastVote.time}</strong> on{' '}
                <strong className="text-yellow-400">{lastVote.date}</strong>
              </span>
            ) : (
              <span>No votes recorded yet. Real-time updates active.</span>
            )}
          </div>
        </div>
      </footer>

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(244,63,94,0.25)] relative text-center">
            {/* Neon line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 to-rose-400 rounded-t-3xl" />
            
            <div className="w-14 h-14 rounded-2xl bg-rose-950/50 border border-rose-500/50 flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>

            <h3 className="text-white font-black uppercase tracking-widest text-lg mb-2 font-orbitron">
              Reset Verification
            </h3>
            
            <p className="text-gray-400 text-xs font-medium font-inter mb-6">
              Enter safety password to authorize wiping all recorded votes.
            </p>

            <div className="space-y-4">
              <input
                type="password"
                placeholder="••••••••"
                value={resetPassword}
                onChange={(e) => {
                  setResetPassword(e.target.value);
                  setResetError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleResetElection();
                }}
                className="w-full px-4 py-3 rounded-xl text-center text-white tracking-widest font-bold placeholder-gray-600 border border-rose-500/30 bg-black/40 focus:outline-none focus:border-rose-400 focus:shadow-[0_0_15px_rgba(244,63,94,0.3)] font-orbitron text-sm"
                autoFocus
              />
              
              {resetError && (
                <div className="text-xs font-bold font-inter text-rose-400">
                  {resetError}
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-700 bg-gray-800/40 hover:bg-gray-800 text-gray-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-orbitron"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetElection}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.3)] font-orbitron"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
