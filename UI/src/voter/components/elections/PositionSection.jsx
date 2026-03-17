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
        {candidates.map((candidate) => {
          const isSelected = isMulti
            ? safeSelectedIds.includes(candidate.id)
            : safeSelectedIds === candidate.id;
          
          const isDisabled = disabled || (isMulti && !isSelected && safeSelectedIds.length >= maxVotes);
          
          return (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={isSelected}
              onToggle={() => handleToggle(candidate.id)}
              disabled={isDisabled}
            />
          );
        })}
      </div>
    </div>
  );
}