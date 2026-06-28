interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  boyName: string;
  girlName: string;
  boySymbol: string;
  girlSymbol: string;
  isSubmitting?: boolean;
}

const ConfirmModal = ({ onConfirm, onCancel, boyName, girlName, boySymbol, girlSymbol, isSubmitting = false }: Props) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card rounded-2xl p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glow bar */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)' }}
        />

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{
              background: 'linear-gradient(135deg, #001840, #003080)',
              border: '2px solid rgba(0,200,255,0.5)',
              boxShadow: '0 0 30px rgba(0,150,255,0.4)',
            }}
          >
            🗳️
          </div>
        </div>

        <h2
          className="text-center text-white font-black uppercase tracking-widest mb-2"
          style={{ fontFamily: 'Orbitron', fontSize: '1.3rem' }}
        >
          Confirm Your Vote
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6" style={{ fontFamily: 'Rajdhani' }}>
          Please review your selections before submitting
        </p>

        {/* Vote Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Boy */}
          <div
            className="rounded-xl p-4 text-center"
            style={{
              background: 'rgba(0,50,150,0.3)',
              border: '1px solid rgba(0,200,255,0.4)',
              boxShadow: '0 0 20px rgba(0,100,255,0.2)',
            }}
          >
            <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Orbitron' }}>
              Head Boy
            </div>
            <div className="text-2xl mb-2">{boySymbol}</div>
            <div className="text-cyan-100 font-bold text-sm" style={{ fontFamily: 'Rajdhani' }}>
              {boyName}
            </div>
          </div>

          {/* Girl */}
          <div
            className="rounded-xl p-4 text-center"
            style={{
              background: 'rgba(150,0,80,0.3)',
              border: '1px solid rgba(255,60,180,0.4)',
              boxShadow: '0 0 20px rgba(200,0,120,0.2)',
            }}
          >
            <div className="text-xs text-pink-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'Orbitron' }}>
              Head Girl
            </div>
            <div className="text-2xl mb-2">{girlSymbol}</div>
            <div className="text-pink-100 font-bold text-sm" style={{ fontFamily: 'Rajdhani' }}>
              {girlName}
            </div>
          </div>
        </div>

        {/* Warning */}
        <div
          className="rounded-lg p-3 mb-6 flex items-start gap-2"
          style={{ background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.3)' }}
        >
          <span className="text-lg flex-shrink-0">⚠️</span>
          <p className="text-yellow-200 text-xs" style={{ fontFamily: 'Rajdhani' }}>
            Once submitted, your vote cannot be changed. This action is irreversible and your vote is
            kept strictly confidential.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl text-gray-300 font-bold uppercase tracking-widest text-sm transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'Orbitron',
              fontSize: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            ← Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-sm confirm-btn disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'Orbitron',
              fontSize: '0.75rem',
              borderRadius: '12px',
              color: '#1a0a00',
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Vote ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
