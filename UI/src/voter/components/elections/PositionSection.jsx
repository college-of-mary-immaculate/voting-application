import { useState, useEffect, useRef } from 'react';
import CandidateCard from './CandidateCard';

export default function PositionSection({
  id,
  title,
  candidates = [],
  selectedIds,
  onSelect,
  maxVotes = 1,
  disabled,
  setValidationMessage,
}) {
  const isMulti = maxVotes > 1;
  const safeSelectedIds = isMulti 
    ? (Array.isArray(selectedIds) ? selectedIds : [])
    : selectedIds;

  // Animation: fade‑in when section enters viewport
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleToggle = (candidateId) => {
    if (disabled) return;
    if (isMulti) {
      onSelect((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        if (current.includes(candidateId)) {
          return current.filter(id => id !== candidateId);
        } else {
          if (current.length < maxVotes) {
            setValidationMessage('');
            return [...current, candidateId];
          } else {
            setValidationMessage(`You can only vote for up to ${maxVotes} ${title}.`);
            setTimeout(() => setValidationMessage(''), 3000);
            return current;
          }
        }
      });
    } else {
      onSelect(selectedIds === candidateId ? null : candidateId);
    }
  };

  // Filter out withdrawn candidates
  const activeCandidates = candidates.filter(candidate => {
    if (candidate.status) {
      return candidate.status !== 'Withdrawn' && candidate.status !== 'withdrawn';
    }
    // Remove any test candidate named 's'
    if (candidate.name === 's' && candidate.party === 's') {
      return false;
    }
    return true;
  });

  return (
    <div ref={sectionRef} className="mb-10 sm:mb-12">
      {/* Header with modern title and accent */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 sm:mb-6 gap-3">
        <div className="flex items-center gap-2">
          {/* Decorative accent line */}
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {title}
          </h2>
          {isMulti && (
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
              Choose up to {maxVotes}
            </span>
          )}
        </div>
        
        {isMulti && (
          <div className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-md transition-all ${
            safeSelectedIds.length === maxVotes
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              : 'bg-gradient-to-r from-[#f4a261] to-[#e76f51] text-white'
          }`}>
            {safeSelectedIds.length} / {maxVotes} selected
          </div>
        )}
      </div>

      {/* Candidate grid – responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {activeCandidates.map((candidate, idx) => {
          const candidateId = candidate.candidate_id || candidate.id;
          const candidateName = candidate.full_name || candidate.name || 'Unnamed Candidate';
          const candidateParty = candidate.party_name || candidate.party || 'Independent';
          const candidatePhoto = candidate.photo_url || candidate.image;
          
          const isSelected = isMulti
            ? safeSelectedIds.includes(candidateId)
            : safeSelectedIds === candidateId;
          
          const isDisabled = disabled || (isMulti && !isSelected && safeSelectedIds.length >= maxVotes);
          
          const formattedCandidate = {
            candidate_id: candidateId,
            full_name: candidateName,
            party_name: candidateParty,
            photo_url: candidatePhoto,
          };
          
          // Staggered animation delay
          const animationDelay = `${idx * 50}ms`;
          
          return (
            <div
              key={candidateId}
              className={`transform transition-all duration-500 ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: animationDelay }}
            >
              <CandidateCard
                candidate={formattedCandidate}
                isSelected={isSelected}
                onToggle={() => handleToggle(candidateId)}
                disabled={isDisabled}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}