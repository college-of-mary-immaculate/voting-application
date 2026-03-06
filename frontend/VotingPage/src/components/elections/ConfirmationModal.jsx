export default function ConfirmationModal({
  isOpen,
  onCancel,
  onConfirm,
  onEdit,
  selectedPositions,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-white/40">
        <h2 className="text-3xl font-light text-[#0f4c5c] mb-6">Review Your Vote</h2>
        <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
          {selectedPositions.map((pos, idx) => (
            <div key={idx} className="bg-[#f8f9fa] rounded-xl p-5 relative group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-[#0f4c5c]">{pos.title}</h3>
                <button
                  onClick={() => {
                    onEdit();
                  }}
                  className="text-sm bg-white px-3 py-1 rounded-full border border-[#0f4c5c] text-[#0f4c5c] hover:bg-[#0f4c5c] hover:text-white transition-all duration-200"
                >
                  Edit
                </button>
              </div>
              
              {pos.candidate ? (
                <div className="flex items-center gap-4">
                  <img src={pos.candidate.image} alt="" className="w-12 h-12 rounded-full border-2 border-[#f4a261]" />
                  <div>
                    <p className="font-semibold text-[#2d3e50]">{pos.candidate.name}</p>
                    <p className="text-sm text-[#5a6b7a]">{pos.candidate.party}</p>
                  </div>
                </div>
              ) : pos.candidates && pos.candidates.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {pos.candidates.map(c => (
                    <div key={c.id} className="flex items-center gap-3 bg-white rounded-lg p-2">
                      <img src={c.image} alt="" className="w-8 h-8 rounded-full border border-[#f4a261]" />
                      <div className="truncate">
                        <p className="text-sm font-medium text-[#2d3e50] truncate">{c.name}</p>
                        <p className="text-xs text-[#5a6b7a]">{c.party}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#5a6b7a] italic">None selected</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-white text-[#2d3e50] rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-[#0f4c5c] text-white rounded-xl font-medium hover:bg-[#1a6b7f] transition shadow-md"
          >
            Confirm Votes
          </button>
        </div>
      </div>
    </div>
  );
}