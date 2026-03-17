export default function CandidateCard({ candidate, isSelected, onToggle, disabled }) {
  return (
    <div
      className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 transition-all duration-300 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-[#f4a261] ring-offset-2 ring-offset-white' : ''
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#f4a261]/0 to-[#0f4c5c]/0 group-hover:from-[#f4a261]/10 group-hover:to-[#0f4c5c]/5 rounded-2xl transition-all duration-500"></div>
      <div className="relative flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md">
          <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
        </div>
        <h3 className="text-xl font-semibold text-[#2d3e50]">{candidate.name}</h3>
        <p className="text-sm text-[#5a6b7a] mb-5">{candidate.party}</p>
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${
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