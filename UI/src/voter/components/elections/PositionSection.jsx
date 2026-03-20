import { useState } from 'react';
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
  
  // Filter out withdrawn candidates based on status
  const activeCandidates = candidates.filter(candidate => {
    // Check if candidate has status field and it's not Withdrawn
    if (candidate.status) {
      return candidate.status !== 'Withdrawn' && candidate.status !== 'withdrawn';
    }
    // If no status field, assume active (but also check if it's the withdrawn candidate with name 's')
    if (candidate.name === 's' && candidate.party === 's') {
      return false; // Filter out the withdrawn test candidate
    }
    return true;
  });
  
  const safeSelectedIds = isMulti 
    ? (Array.isArray(selectedIds) ? selectedIds : [])
    : selectedIds;

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

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-light text-[#0f4c5c]">
          {title} {isMulti && <span className="text-xs sm:text-sm font-normal text-[#5a6b7a] ml-2">Choose up to {maxVotes}</span>}
        </h2>
        
        {isMulti && (
          <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-md ${
            safeSelectedIds.length === maxVotes
              ? 'bg-green-500 text-white'
              : 'bg-[#f4a261] text-white'
          }`}>
            {safeSelectedIds.length} / {maxVotes} selected
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {activeCandidates.map((candidate) => {
          // Get the correct ID field
          const candidateId = candidate.candidate_id || candidate.id;
          
          // Get the name (using 'name' field since that's what's in the logs)
          const candidateName = candidate.full_name || candidate.name || 'Unnamed Candidate';
          
          // Get the party (using 'party' field since that's what's in the logs)
          const candidateParty = candidate.party_name || candidate.party || 'Independent';
          
          // Get the photo URL
          const candidatePhoto = candidate.photo_url || candidate.image;
          
          // Check if selected using the correct ID
          const isSelected = isMulti
            ? safeSelectedIds.includes(candidateId)
            : safeSelectedIds === candidateId;
          
          const isDisabled = disabled || (isMulti && !isSelected && safeSelectedIds.length >= maxVotes);
          
          // Create formatted candidate for CandidateCard
          const formattedCandidate = {
            candidate_id: candidateId,
            full_name: candidateName,
            party_name: candidateParty,
            photo_url: candidatePhoto,
          };
          
          return (
            <CandidateCard
              key={candidateId}
              candidate={formattedCandidate}
              isSelected={isSelected}
              onToggle={() => handleToggle(candidateId)}
              disabled={isDisabled}
            />
          );
        })}
      </div>
    </div>
  );
}