import type { Candidate } from '../types';

interface Props {
  candidate: Candidate;
  panel: 'boy' | 'girl';
  isSelected: boolean;
  onSelect: (id: number) => void;
  onVote: (id: number) => void;
}

const CandidateCard = ({ candidate, panel, isSelected, onSelect, onVote }: Props) => {
  const isBoy = panel === 'boy';

  const rowBg = isSelected
    ? isBoy ? 'rgba(0,80,180,0.35)' : 'rgba(180,0,80,0.35)'
    : isBoy  ? 'rgba(0,15,50,0.55)' : 'rgba(50,0,30,0.55)';

  const rowBorder = isSelected
    ? isBoy ? '2px solid rgba(0,200,255,0.8)' : '2px solid rgba(255,60,180,0.8)'
    : isBoy  ? '1px solid rgba(0,120,255,0.25)' : '1px solid rgba(255,60,180,0.25)';

  const rowShadow = isSelected
    ? isBoy
      ? '0 0 0 2px rgba(0,200,255,0.4), 0 0 30px rgba(0,150,255,0.35)'
      : '0 0 0 2px rgba(255,60,180,0.4), 0 0 30px rgba(200,0,120,0.35)'
    : 'none';

  return (
    <div
      className="candidate-row flex items-center gap-3 cursor-pointer select-none h-full"
      style={{
        background: rowBg,
        border: rowBorder,
        boxShadow: rowShadow,
        borderRadius: '12px',
        padding: '10px 14px',
        transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
      }}
      onClick={() => onSelect(candidate.id)}
    >
      {/* Serial Number Badge */}
      <div
        className={`flex-shrink-0 rounded-xl flex items-center justify-center text-white font-black ${isBoy ? 'num-badge-boy' : 'num-badge-girl'}`}
        style={{
          fontFamily: 'Orbitron',
          width: '42px',
          height: '42px',
          fontSize: '1.15rem',
        }}
      >
        {candidate.serialNo}
      </div>

      {/* Photo — bigger, taller */}
      <div
        className={`flex-shrink-0 overflow-hidden rounded-xl ${isBoy ? 'photo-frame-boy' : 'photo-frame-girl'}`}
        style={{ width: '80px', height: '92px' }}
      >
        <img
          src={candidate.photo}
          alt={candidate.name}
          className="w-full h-full object-cover object-top"
          style={{ filter: 'brightness(1.05) contrast(1.08)' }}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.style.background = isBoy
                ? 'linear-gradient(135deg, #001840, #003080)'
                : 'linear-gradient(135deg, #400010, #800030)';
              parent.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2.5rem;">${candidate.symbol}</div>`;
            }
          }}
        />
      </div>

      {/* Name — ONE LINE, BIG, BOLD */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div
          className={`font-black uppercase ${isBoy ? 'text-cyan-100' : 'text-pink-100'}`}
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(0.9rem, 1.6vw, 1.2rem)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '0.05em',
            textShadow: isBoy
              ? '0 0 14px rgba(0,200,255,0.8), 0 0 28px rgba(0,150,255,0.4)'
              : '0 0 14px rgba(255,80,200,0.8), 0 0 28px rgba(200,0,150,0.4)',
          }}
        >
          {candidate.name.toUpperCase()}
        </div>
      </div>

      {/* Election Symbol */}
      <div
        className="flex-shrink-0 flex flex-col items-center gap-0.5"
        style={{ minWidth: '84px' }}
      >
        {candidate.symbolImage ? (
          <img
            src={candidate.symbolImage}
            alt={candidate.symbolLabel}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2.5px solid rgba(255,200,0,0.8)',
              boxShadow: '0 0 16px rgba(255,180,0,0.7), 0 0 32px rgba(255,150,0,0.4)',
            }}
          />
        ) : (
          <span style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.1rem)', filter: 'drop-shadow(0 0 8px gold)' }}>
            {candidate.symbol}
          </span>
        )}
      </div>

      {/* Radio Button — bigger */}
      <input
        type="radio"
        name={`${panel}-vote`}
        value={candidate.id}
        checked={isSelected}
        onChange={() => onSelect(candidate.id)}
        onClick={(e) => e.stopPropagation()}
        className={isBoy ? 'custom-radio' : 'custom-radio-girl'}
        style={{ width: '30px', height: '30px', flexShrink: 0 }}
      />

      {/* Vote Button — bigger */}
      <button
        className={`flex-shrink-0 font-black text-white rounded-xl uppercase tracking-widest ${isBoy ? 'vote-btn-blue' : 'vote-btn-pink'}`}
        style={{
          fontFamily: 'Orbitron',
          fontSize: 'clamp(0.7rem, 1.2vw, 0.88rem)',
          minWidth: '88px',
          padding: '12px 16px',
          letterSpacing: '0.12em',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(candidate.id);
          onVote(candidate.id);
        }}
      >
        VOTE
      </button>
    </div>
  );
};

export default CandidateCard;
