import React from 'react';

export default function ConfirmationModal({ 
  isOpen, 
  onCancel, 
  onConfirm, 
  selectedPositions 
}) {
  if (!isOpen) return null;

  const getCandidateName = (candidate) => {
    if (!candidate) return '—';
    return candidate.full_name || candidate.name || 'Unnamed Candidate';
  };

  const getParty = (candidate) => {
    if (!candidate) return '';
    return candidate.party_name || candidate.party || '';
  };

  const getPhotoUrl = (candidate) => {
    if (!candidate) return null;
    const url = candidate.photo_url || candidate.image;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  const totalSelections = selectedPositions.reduce((total, pos) => {
    if (pos.candidate) return total + 1;
    if (pos.candidates) return total + pos.candidates.length;
    return total;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Ballot paper with texture */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border border-gray-300"
           style={{
             backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 8px)`,
             boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
           }}>
        {/* Ballot header */}
        <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4 z-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 tracking-wide">OFFICIAL BALLOT</h2>
            <p className="text-xs text-gray-500 mt-1 uppercase">Sample – Review your selections</p>
            <div className="mt-2 inline-block bg-gray-200 px-3 py-0.5 rounded-full text-xs text-gray-700">
              {totalSelections} candidate{totalSelections !== 1 ? 's' : ''} selected
            </div>
          </div>
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ballot content */}
        <div className="p-6 space-y-6">
          {selectedPositions.map((position, idx) => {
            const hasSelection = position.candidate || (position.candidates && position.candidates.length > 0);
            const candidateList = position.candidate ? [position.candidate] : (position.candidates || []);
            
            return (
              <div key={idx} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                <h3 className="text-md font-semibold text-gray-800 uppercase tracking-wide mb-2">
                  {position.title}
                </h3>
                
                {hasSelection ? (
                  <div className="space-y-2">
                    {candidateList.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 border-l-2 border-gray-400">
                        {/* Candidate photo  */}
                        {getPhotoUrl(c) && (
                          <img
                            src={getPhotoUrl(c)}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-gray-300 filter grayscale"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-800">
                            {getCandidateName(c)}
                          </div>
                          {getParty(c) && (
                            <div className="text-xs text-gray-500">{getParty(c)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No selection made</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Ballot footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-300 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-400 rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors shadow-sm"
          >
            Cast Vote
          </button>
        </div>

        {/* Subtle watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute -right-12 -bottom-12 opacity-10 rotate-12 text-8xl font-bold text-gray-800 select-none">
            BALLOT
          </div>
        </div>
      </div>
    </div>
  );
}