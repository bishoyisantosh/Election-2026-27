import type { Candidate } from '../types';
import CandidateCard from './CandidateCard';

interface Props {
  panel: 'boy' | 'girl';
  candidates: Candidate[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onVote: (id: number) => void;
}

const PanelSection = ({ panel, candidates, selectedId, onSelect, onVote }: Props) => {
  const isBoy = panel === 'boy';

  return (
    <div className="flex flex-col h-full" style={{ minWidth: 0 }}>
      {/* Panel Header */}
      <div
        className={`flex items-center justify-center gap-3 py-3 mb-2 rounded-xl relative flex-shrink-0 ${isBoy ? 'panel-header-boy' : 'panel-header-girl'}`}
        style={{
          border: isBoy
            ? '1px solid rgba(0,200,255,0.3)'
            : '1px solid rgba(255,60,180,0.3)',
        }}
      >
        {/* Decorative corner dots */}
        <div
          className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full"
          style={{ background: isBoy ? '#00d4ff' : '#ff3cba', boxShadow: isBoy ? '0 0 6px #00d4ff' : '0 0 6px #ff3cba' }}
        />
        <div
          className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full"
          style={{ background: isBoy ? '#00d4ff' : '#ff3cba', boxShadow: isBoy ? '0 0 6px #00d4ff' : '0 0 6px #ff3cba' }}
        />

        <span style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)' }}>
          {isBoy ? '👑' : '💎'}
        </span>
        <h2
          className={`font-black uppercase tracking-widest ${isBoy ? 'glow-text-blue text-cyan-300' : 'glow-text-pink text-pink-300'}`}
          style={{
            fontFamily: 'Orbitron',
            fontSize: 'clamp(1rem, 2vw, 1.5rem)',
            letterSpacing: '0.15em',
          }}
        >
          {isBoy ? 'HEAD BOY' : 'HEAD GIRL'}
        </h2>
        <span style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)' }}>
          {isBoy ? '👑' : '💎'}
        </span>
      </div>

      {/* HUD line */}
      <div className="hud-line mb-2 flex-shrink-0" style={{ opacity: 0.5 }} />

      {/* Candidate list — each card gets equal share of remaining height */}
      <div className="flex flex-col flex-1 gap-2" style={{ minHeight: 0 }}>
        {candidates.map((c) => (
          <div key={c.id} className="flex-1 min-h-0">
            <CandidateCard
              candidate={c}
              panel={panel}
              isSelected={selectedId === c.id}
              onSelect={onSelect}
              onVote={onVote}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelSection;
