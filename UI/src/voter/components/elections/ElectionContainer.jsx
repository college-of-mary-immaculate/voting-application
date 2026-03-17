import { useState, useEffect } from 'react';
import PositionSection from './PositionSection';
import ConfirmationModal from './ConfirmationModal';
import SuccessToast from './SuccessToast';
import CountdownTimer from './CountdownTimer';

export default function ElectionContainer({
  electionName,
  electionTagline,
  positions,
  onSubmitVotes,
  endTime,
}) {
  const [votes, setVotes] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  // Check if election has ended
  useEffect(() => {
    if (!endTime) return;
    const checkExpiry = () => {
      setIsExpired(new Date() >= new Date(endTime));
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const handleSelect = (positionId, isMulti) => (value) => {
    if (isExpired) return;
    setVotes(prev => {
      if (typeof value === 'function') {
        return { ...prev, [positionId]: value(prev[positionId]) };
      } else {
        return { ...prev, [positionId]: value };
      }
    });
  };

  const handleSubmitClick = () => {
    if (isExpired) return;
    setShowConfirmModal(true);
  };

  const handleConfirmVote = async () => {
    if (isExpired) return;
    const total = Object.values(votes).reduce((acc, val) => {
      if (Array.isArray(val)) return acc + val.length;
      return acc + (val ? 1 : 0);
    }, 0);
    setVoteCount(total);

    const voteData = positions.map(pos => ({
      positionId: pos.id,
      selected: votes[pos.id] || (pos.maxVotes > 1 ? [] : null),
    }));

    try {
      await onSubmitVotes(voteData);
      setShowConfirmModal(false);
      setShowSuccessToast(true);
      setHasVoted(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (error) {
      alert('Failed to submit votes. Please try again.');
    }
  };

  const handleCancel = () => setShowConfirmModal(false);
  const handleEdit = () => setShowConfirmModal(false);

  const selectedPositions = positions.map(pos => {
    const selected = votes[pos.id];
    if (pos.maxVotes > 1) {
      const selectedArray = Array.isArray(selected) ? selected : [];
      const selectedCandidates = selectedArray
        .map(id => pos.candidates.find(c => c.id === id))
        .filter(Boolean);
      return {
        id: pos.id,
        title: pos.title,
        candidates: selectedCandidates,
      };
    } else {
      const candidate = selected ? pos.candidates.find(c => c.id === selected) : null;
      return {
        id: pos.id,
        title: pos.title,
        candidate,
      };
    }
  });

  const disabled = hasVoted || isExpired;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute inset-0 opacity-10 bg-repeat"
        style={{
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flag_of_the_Philippines.svg/1280px-Flag_of_the_Philippines.svg.png')",
          backgroundSize: '200px 100px',
          backgroundBlendMode: 'overlay',
        }}
      />

      {validationMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-slideDown text-sm sm:text-base">
          ⚠️ {validationMessage}
        </div>
      )}

      <div className="relative z-10 min-h-screen bg-gradient-to-br from-[#f8f9fa]/80 via-white/80 to-[#e9ecef]/80 backdrop-blur-sm py-6 sm:py-10 px-4">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#0f4c5c] opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f4a261] opacity-20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header - responsive stacking */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight drop-shadow-lg">
                {electionName}
              </h1>
              <p className="text-white/90 text-base sm:text-lg mt-2 drop-shadow">
                {electionTagline}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {endTime && <CountdownTimer endTime={endTime} />}
              <div className="bg-white/70 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-lg border border-white/50 w-full sm:w-auto overflow-x-auto">
                <div className="flex gap-4 sm:gap-8 min-w-max">
                  {positions.map(pos => (
                    <div key={pos.id} className="text-center">
                      <div className="text-xs uppercase tracking-wider text-[#5a6b7a]">
                        {pos.shortTitle || pos.title}
                      </div>
                      <div className="text-xl sm:text-2xl font-semibold text-[#0f4c5c] mt-1">
                        {pos.maxVotes > 1
                          ? `${votes[pos.id]?.length || 0}/${pos.maxVotes}`
                          : votes[pos.id] ? '✓' : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <SuccessToast show={showSuccessToast} voteCount={voteCount} />
          
          <ConfirmationModal
            isOpen={showConfirmModal}
            onCancel={handleCancel}
            onConfirm={handleConfirmVote}
            onEdit={handleEdit}
            selectedPositions={selectedPositions}
          />

          {positions.map(pos => (
            <PositionSection
              key={pos.id}
              id={pos.id}
              title={pos.title}
              candidates={pos.candidates}
              selectedIds={votes[pos.id] || (pos.maxVotes > 1 ? [] : null)}
              onSelect={handleSelect(pos.id, pos.maxVotes > 1)}
              maxVotes={pos.maxVotes}
              disabled={disabled}
              setValidationMessage={setValidationMessage}
            />
          ))}

          <div className="flex justify-center mt-10">
            <button
              onClick={handleSubmitClick}
              disabled={disabled}
              className={`group text-base sm:text-lg font-medium py-3 sm:py-4 px-10 sm:px-14 rounded-full transition-all duration-300 transform hover:scale-105 ${
                disabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#0f4c5c] text-white shadow-xl hover:shadow-2xl hover:bg-[#1a6b7f]'
              }`}
            >
              {disabled ? (isExpired ? 'Election Ended' : 'Vote Submitted') : 'Review & Submit'}
            </button>
          </div>

          {isExpired && (
            <p className="text-center text-red-500 mt-6 font-medium animate-pulse drop-shadow">
              Voting period has ended.
            </p>
          )}
          {hasVoted && !isExpired && (
            <p className="text-center text-[#2ecc71] mt-6 font-medium animate-pulse drop-shadow">
              Thank you for participating!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}