export default function SuccessToast({ show, voteCount }) {
  if (!show) return null;

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-[#2ecc71] text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slideDown flex items-center gap-3 border border-white/30">
      <span className="text-2xl">🎉</span>
      <span className="font-semibold">You voted for {voteCount} candidate(s)!</span>
    </div>
  );
}