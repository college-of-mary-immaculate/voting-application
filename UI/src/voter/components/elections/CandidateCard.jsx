import API from '../../../admin/utils/api'; // Adjust path as needed

export default function CandidateCard({ candidate, isSelected, onToggle, disabled }) {
  
  // Helper function to safely get candidate data with fallbacks
  const getCandidateName = () => {
    const name = candidate.full_name || candidate.name || candidate.FullName || 'Unnamed Candidate';
    return name;
  };

  const getPartyName = () => {
    const party = candidate.party_name || candidate.party || 'Independent';
    return party;
  };

  const getPhotoUrl = () => {
    const photoUrl = candidate.photo_url || candidate.image || candidate.photo;
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    return `http://localhost:3000${photoUrl}`;
  };

  return (
    <div
      className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 transition-all duration-300 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-[#f4a261] ring-offset-2 ring-offset-white' : ''
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#f4a261]/0 to-[#0f4c5c]/0 group-hover:from-[#f4a261]/10 group-hover:to-[#0f4c5c]/5 rounded-2xl transition-all duration-500"></div>
      <div className="relative flex flex-col items-center text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-3 sm:mb-4 border-4 border-white shadow-md bg-gray-100">
          {getPhotoUrl() ? (
            <img 
              src={getPhotoUrl()} 
              alt={getCandidateName()} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f4a261]/20 to-[#0f4c5c]/20">
              <span className="text-3xl">👤</span>
            </div>
          )}
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#2d3e50] line-clamp-2">
          {getCandidateName()}
        </h3>
        <p className="text-xs sm:text-sm text-[#5a6b7a] mb-4 sm:mb-5 line-clamp-1">
          {getPartyName()}
        </p>
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`w-full py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${
            isSelected
              ? 'bg-[#2ecc71] text-white shadow-inner'
              : disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-[#0f4c5c] border border-[#0f4c5c] hover:bg-[#0f4c5c] hover:text-white'
          }`}
        >
          {isSelected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
}