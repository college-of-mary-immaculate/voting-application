import { useState } from 'react';
import { getImageUrl } from '../../services/api';

export default function CandidateCard({ candidate, isSelected, onToggle, disabled }) {
  const [imageError, setImageError] = useState(false);
  
  const getCandidateName = () => candidate.full_name || candidate.name || 'Unnamed Candidate';
  const getPartyName = () => candidate.party_name || candidate.party || 'Independent';
  
  const photoUrl = candidate.photo_url || candidate.image;
  const imageSrc = photoUrl ? getImageUrl(photoUrl) : null;
  
  // Fallback avatar using initials
  const initials = getCandidateName()
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`
        relative group transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}
      `}
    >
      {/* Glass card */}
      <div
        className={`
          relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden
          border transition-all duration-300
          ${isSelected 
            ? 'border-indigo-500 shadow-lg shadow-indigo-200/50 ring-2 ring-indigo-500/30' 
            : 'border-indigo-100 hover:shadow-xl hover:border-indigo-300'
          }
        `}
      >
        {/* Selected badge (top right corner) */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-10 bg-indigo-600 text-white rounded-full p-1 shadow-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Photo area */}
        <div className="relative pt-4 pb-2 px-4 flex justify-center">
          <div className="relative">
            {imageSrc && !imageError ? (
              <img
                src={imageSrc}
                alt={getCandidateName()}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-2xl font-bold text-indigo-600">{initials}</span>
              </div>
            )}
          </div>
        </div>

        {/* Candidate info */}
        <div className="px-4 pb-4 text-center">
          <h3 className="font-semibold text-gray-800 text-base sm:text-lg line-clamp-2">
            {getCandidateName()}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1">
            {getPartyName()}
          </p>
        </div>

        {/* Action button */}
        <div className="px-4 pb-4">
          <button
            onClick={onToggle}
            disabled={disabled}
            className={`
              w-full py-2 rounded-xl font-medium text-sm sm:text-base transition-all duration-200
              ${isSelected
                ? 'bg-indigo-600 text-white shadow-inner hover:bg-indigo-700'
                : disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50 hover:border-indigo-500'
              }
            `}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}