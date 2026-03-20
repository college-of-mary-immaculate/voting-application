import React from 'react';

export default function ConfirmationModal({ 
  isOpen, 
  onCancel, 
  onConfirm, 
  onEdit, 
  selectedPositions 
}) {
  if (!isOpen) return null;

  // Helper function to get candidate name
  const getCandidateName = (candidate) => {
    if (!candidate) return 'None selected';
    return candidate.full_name || candidate.name || candidate.FullName || 'Unnamed Candidate';
  };

  // Helper function to get party name
  const getPartyName = (candidate) => {
    if (!candidate) return '';
    return candidate.party_name || candidate.party || '';
  };

  // Helper function to get photo URL
  const getPhotoUrl = (candidate) => {
    if (!candidate) return null;
    const photoUrl = candidate.photo_url || candidate.image || candidate.photo;
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    return `http://localhost:3000${photoUrl}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-[#0f4c5c]">Review Your Vote</h2>
          <p className="text-gray-600 mt-1">Please review your selections before submitting</p>
        </div>
        
        <div className="p-6 space-y-6">
          {selectedPositions.map((position) => (
            <div key={position.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-[#0f4c5c]">{position.title}</h3>
                <button
                  onClick={() => onEdit(position.id)}
                  className="text-sm text-[#f4a261] hover:text-[#e76f51] font-medium transition-colors"
                >
                  Edit
                </button>
              </div>
              
              {position.candidate ? (
                // Single candidate selection
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {getPhotoUrl(position.candidate) && (
                    <img
                      src={getPhotoUrl(position.candidate)}
                      alt={getCandidateName(position.candidate)}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                      }}
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {getCandidateName(position.candidate)}
                    </p>
                    {getPartyName(position.candidate) && (
                      <p className="text-sm text-gray-600">
                        {getPartyName(position.candidate)}
                      </p>
                    )}
                  </div>
                </div>
              ) : position.candidates && position.candidates.length > 0 ? (
                // Multiple candidates selection
                <div className="space-y-2">
                  {position.candidates.map((candidate, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      {getPhotoUrl(candidate) && (
                        <img
                          src={getPhotoUrl(candidate)}
                          alt={getCandidateName(candidate)}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                          }}
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {getCandidateName(candidate)}
                        </p>
                        {getPartyName(candidate) && (
                          <p className="text-sm text-gray-600">
                            {getPartyName(candidate)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">None selected</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] transition-colors"
          >
            Confirm Vote
          </button>
        </div>
      </div>
    </div>
  );
}