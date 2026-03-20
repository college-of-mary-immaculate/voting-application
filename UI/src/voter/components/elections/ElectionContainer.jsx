import { useState, useEffect } from "react";
import PositionSection from "./PositionSection";
import ConfirmationModal from "./ConfirmationModal";
import SuccessToast from "./SuccessToast";
import CountdownTimer from "./CountdownTimer";

// Background images per election type – no generic fallback
const backgroundImages = {
  1: "https://tse1.mm.bing.net/th/id/OIP.JQ4NpNKqdQvSOI2NjFc6BgHaFV?rs=1&pid=ImgDetMain&o=7&rm=3", // National
  2: "https://www.rappler.com/tachyon/2023/02/imho-community-governance.png",                     // Barangay
  3: "https://www.shutterstock.com/image-vector/students-who-vote-class-gain-260nw-2421182715.jpg", // Class
  4: "https://tse2.mm.bing.net/th/id/OIP.EGnBKA1h5l0Pxy1hq96fhwHaEJ?rs=1&pid=ImgDetMain&o=7&rm=3", // Custom
};

export default function ElectionContainer({
  electionName,
  electionTagline,
  positions,
  onSubmitVotes,
  endTime,
  serverTime,
  electionTypeId, // required – used to select the background image
}) {
  const [votes, setVotes] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  useEffect(() => {
    if (!endTime) return;
    const checkExpiry = () => {
      setIsExpired(new Date() >= new Date(endTime));
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const handleSelect = (positionId, isMulti) => (value) => {
    if (isExpired) return;
    setVotes((prev) => {
      if (typeof value === "function") {
        return { ...prev, [positionId]: value(prev[positionId]) };
      } else {
        return { ...prev, [positionId]: value };
      }
    });
  };

  const handleSubmitClick = () => {
    if (isExpired) return;
    setShowConfirmModal(true);
  };

  const handleConfirmVote = async () => {
    if (isExpired) return;
    const total = Object.values(votes).reduce((acc, val) => {
      if (Array.isArray(val)) return acc + val.length;
      return acc + (val ? 1 : 0);
    }, 0);
    setVoteCount(total);

    const voteData = positions.map((pos) => ({
      positionId: pos.id,
      selected: votes[pos.id] || (pos.maxVotes > 1 ? [] : null),
    }));

    try {
      await onSubmitVotes(voteData);
      setShowConfirmModal(false);
      setShowSuccessToast(true);
      setHasVoted(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (error) {
      alert("Failed to submit votes. Please try again.");
    }
  };

  const handleCancel = () => setShowConfirmModal(false);
  const handleEdit = () => setShowConfirmModal(false);

  const selectedPositions = positions.map((pos) => {
    const selected = votes[pos.id];
    if (pos.maxVotes > 1) {
      const selectedArray = Array.isArray(selected) ? selected : [];
      const selectedCandidates = selectedArray
        .map((id) => {
          const candidate = pos.candidates.find(
            (c) => c.candidate_id === id || c.id === id
          );
          if (candidate && candidate.status !== "Withdrawn" && candidate.status !== "withdrawn") {
            return {
              id: candidate.candidate_id || candidate.id,
              full_name: candidate.full_name || candidate.name,
              party_name: candidate.party_name || candidate.party,
              photo_url: candidate.photo_url || candidate.image,
            };
          }
          return null;
        })
        .filter(Boolean);
      return {
        id: pos.id,
        title: pos.title,
        candidates: selectedCandidates,
      };
    } else {
      const candidate = selected
        ? pos.candidates.find((c) => c.candidate_id === selected || c.id === selected)
        : null;
      const validCandidate =
        candidate &&
        candidate.status !== "Withdrawn" &&
        candidate.status !== "withdrawn"
          ? {
              id: candidate.candidate_id || candidate.id,
              full_name: candidate.full_name || candidate.name,
              party_name: candidate.party_name || candidate.party,
              photo_url: candidate.photo_url || candidate.image,
            }
          : null;
      return {
        id: pos.id,
        title: pos.title,
        candidate: validCandidate,
      };
    }
  });

  const disabled = hasVoted || isExpired;

  // Select background based on electionTypeId – if missing, no image is shown
  const backgroundUrl = electionTypeId && backgroundImages[electionTypeId]
    ? backgroundImages[electionTypeId]
    : null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image – only shown if a matching type exists */}
      {backgroundUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main content */}
      <div
        className={`relative z-10 min-h-screen py-6 sm:py-10 px-4 transition-opacity duration-700 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                {electionName}
              </h1>
              <p className="text-white/90 text-base sm:text-lg mt-2 drop-shadow">
                {electionTagline}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {endTime && (
                <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-white/30">
                  <CountdownTimer endTime={endTime} serverTime={serverTime} />
                </div>
              )}
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-white/30 w-full sm:w-auto overflow-x-auto">
                <div className="flex gap-4 sm:gap-8 min-w-max">
                  {positions.map((pos) => (
                    <div key={pos.id} className="text-center">
                      <div className="text-xs uppercase tracking-wider text-white/80">
                        {pos.shortTitle || pos.title}
                      </div>
                      <div className="text-xl sm:text-2xl font-semibold text-white mt-1">
                        {pos.maxVotes > 1
                          ? `${votes[pos.id]?.length || 0}/${pos.maxVotes}`
                          : votes[pos.id] ? "✓" : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <SuccessToast show={showSuccessToast} voteCount={voteCount} />
          <ConfirmationModal
            isOpen={showConfirmModal}
            onCancel={handleCancel}
            onConfirm={handleConfirmVote}
            onEdit={handleEdit}
            selectedPositions={selectedPositions}
          />

          {/* Position sections */}
          <div className="space-y-8 sm:space-y-10">
            {positions.map((pos, idx) => (
              <div
                key={pos.id}
                className="transform transition-all duration-500 hover:scale-[1.01]"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-white/50">
                  <PositionSection
                    id={pos.id}
                    title={pos.title}
                    candidates={pos.candidates.map((c) => ({
                      id: c.candidate_id || c.id,
                      name: c.full_name || c.name,
                      party: c.party_name || c.party,
                      photo_url: c.photo_url || c.image,
                      candidate_id: c.candidate_id,
                      full_name: c.full_name,
                      party_name: c.party_name,
                    }))}
                    selectedIds={votes[pos.id] || (pos.maxVotes > 1 ? [] : null)}
                    onSelect={handleSelect(pos.id, pos.maxVotes > 1)}
                    maxVotes={pos.maxVotes}
                    disabled={disabled}
                    setValidationMessage={setValidationMessage}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit button */}
          <div className="flex justify-center mt-12">
            <button
              onClick={handleSubmitClick}
              disabled={disabled}
              className={`group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="relative z-10">
                {disabled
                  ? isExpired
                    ? "Election Ended"
                    : "Vote Submitted"
                  : "Review & Submit"}
              </span>
              {!disabled && !isExpired && (
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          {isExpired && (
            <p className="text-center text-red-500 mt-6 font-medium animate-pulse drop-shadow">
              Voting period has ended.
            </p>
          )}
          {hasVoted && !isExpired && (
            <p className="text-center text-green-400 mt-6 font-medium animate-pulse drop-shadow">
              Thank you for participating!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}