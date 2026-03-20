import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getElectionResults, getImageUrl } from '../../services/api';
import socket from '../../utils/socket';
import CountdownTimer from '../elections/CountdownTimer';

const formatNumber = (num) => num?.toLocaleString() || '0';

const barGradients = [
  'from-indigo-400 via-indigo-500 to-indigo-600',
  'from-purple-400 via-purple-500 to-purple-600',
  'from-pink-400 via-pink-500 to-pink-600',
  'from-blue-400 via-blue-500 to-blue-600',
  'from-teal-400 via-teal-500 to-teal-600',
  'from-rose-400 via-rose-500 to-rose-600',
  'from-amber-400 via-amber-500 to-amber-600',
  'from-emerald-400 via-emerald-500 to-emerald-600',
];

const getBarGradient = (index) => barGradients[index % barGradients.length];

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Custom hook for count‑up animation
const useCountUp = (targetValue, duration = 800) => {
  const [current, setCurrent] = useState(0);
  const targetRef = useRef(targetValue);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);

  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(1, elapsed / duration);
    const newValue = startValueRef.current + (targetRef.current - startValueRef.current) * progress;
    setCurrent(Math.floor(newValue));
    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [duration]);

  useEffect(() => {
    // When target changes, start animation from current displayed value
    startValueRef.current = current;
    targetRef.current = targetValue;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetValue, animate, current]);

  // Set initial value to 0 when component mounts (but we'll start animation from 0)
  useEffect(() => {
    setCurrent(0);
    startValueRef.current = 0;
    targetRef.current = targetValue;
    startTimeRef.current = null;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return current;
};

// Small component to display a number with count‑up
const AnimatedVoteCount = ({ votes, isWinner }) => {
  const animatedValue = useCountUp(votes, 500);
  return (
    <span className={`text-sm sm:text-lg font-bold ${isWinner ? 'text-amber-500' : 'text-indigo-600'}`}>
      {formatNumber(animatedValue)}
    </span>
  );
};

export default function ElectionTally() {
  const { electionId } = useParams();
  const [results, setResults] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalVotes, setTotalVotes] = useState(0);
  const [prevResults, setPrevResults] = useState([]);
  const [pulsingCandidates, setPulsingCandidates] = useState({}); // { candidateId: true }

  const fetchResults = async () => {
    try {
      const res = await getElectionResults(electionId);
      const resultsData = res.data.results || [];
      setPrevResults(results); // store previous before updating
      setResults(resultsData);
      setElection(res.data.election);
      const total = resultsData.reduce((acc, pos) => 
        acc + pos.candidates.reduce((sum, c) => sum + (c.votes || 0), 0), 0
      );
      setTotalVotes(total);

      // Detect which candidates increased their votes
      const newPulses = {};
      if (prevResults.length > 0) {
        // Create a map of candidate votes from previous results
        const prevVotes = new Map();
        prevResults.forEach(pos => {
          pos.candidates.forEach(c => {
            prevVotes.set(c.candidate_id, c.votes || 0);
          });
        });
        resultsData.forEach(pos => {
          pos.candidates.forEach(c => {
            const prevVote = prevVotes.get(c.candidate_id) || 0;
            if (c.votes > prevVote) {
              newPulses[c.candidate_id] = true;
            }
          });
        });
      }
      if (Object.keys(newPulses).length > 0) {
        setPulsingCandidates(newPulses);
        // Clear pulsing after 500ms
        setTimeout(() => {
          setPulsingCandidates({});
        }, 500);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    socket.emit('joinElection', parseInt(electionId));
    socket.on('voteUpdate', fetchResults);
    return () => {
      socket.off('voteUpdate');
    };
  }, [electionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{ backgroundImage: "url('https://img.freepik.com/premium-vector/philippines-election-banner-background-template-your-design_97886-9564.jpg')" }}></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-white">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{ backgroundImage: "url('https://img.freepik.com/premium-vector/philippines-election-banner-background-template-your-design_97886-9564.jpg')" }}></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
          <div className="text-5xl mb-4 text-red-400">⚠️</div>
          <p className="text-xl text-red-600 font-medium mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{ backgroundImage: "url('https://img.freepik.com/premium-vector/philippines-election-banner-background-template-your-design_97886-9564.jpg')" }}></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
          <div className="text-7xl mb-4">📊</div>
          <p className="text-2xl font-medium text-gray-800 mb-2">No Results Yet</p>
          <p className="text-gray-500">Check back later when votes have been cast.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background image with subtle blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
        style={{ backgroundImage: "url('https://img.freepik.com/premium-vector/philippines-election-banner-background-template-your-design_97886-9564.jpg')" }}
      ></div>
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-3 drop-shadow-lg">
              {election?.election_name || `Election #${electionId}`}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <span className="text-white text-sm font-medium">Total votes: {totalVotes.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {election?.end_at && (
            <div className="bg-white/70 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg border border-white/50">
              <CountdownTimer endTime={election.end_at} serverTime={new Date().toISOString()} />
            </div>
          )}
        </div>

        {/* Results by position */}
        <div className="space-y-12">
          {results.map((position) => {
            const candidates = position.candidates || [];
            const maxVotes = Math.max(...candidates.map(c => c.votes || 0), 0);
            const isTie = candidates.filter(c => c.votes === maxVotes).length > 1;
            const positionTotal = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

            return (
              <div key={position.position_id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/50 transition-all duration-300 hover:shadow-3xl">
                  
                  {/* Position header */}
                  <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                        {position.position_name}
                        <span className="text-xs sm:text-sm bg-white/20 px-3 py-1 rounded-full font-normal">
                          {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                        </span>
                      </h2>
                      <div className="text-white/80 text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                        Total votes: {positionTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Scrollable bar chart container */}
                  <div className="p-6 sm:p-8 overflow-x-auto custom-scrollbar">
                    <div className="flex justify-start gap-6 sm:gap-8 md:gap-10 min-w-max">
                      {candidates.map((candidate, idx) => {
                        const votes = candidate.votes || 0;
                        const percentage = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
                        const isWinner = votes === maxVotes && maxVotes > 0;
                        const barGradient = getBarGradient(idx);
                        const photoUrl = candidate.photo_url;
                        const fullUrl = photoUrl ? getImageUrl(photoUrl) : null;
                        const initials = getInitials(candidate.full_name);
                        const isPulsing = pulsingCandidates[candidate.candidate_id];

                        return (
                          <div
                            key={candidate.candidate_id}
                            className="flex flex-col items-center text-center w-24 sm:w-28 flex-shrink-0"
                          >
                            {/* Vertical bar container */}
                            <div className="relative w-full h-36 sm:h-40 mb-3 flex flex-col justify-end overflow-visible">
                              <div
                                className={`w-full rounded-t-lg sm:rounded-t-xl bg-gradient-to-t ${barGradient} transition-all duration-700 ease-out shadow-inner ${
                                  isPulsing ? 'animate-pulse' : ''
                                }`}
                                style={{ height: `${percentage}%`, minHeight: votes > 0 ? '4px' : '0px' }}
                              />
                              {isWinner && (
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                                  <div className="text-2xl sm:text-3xl animate-bounce drop-shadow-lg">👑</div>
                                </div>
                              )}
                            </div>

                            {/* Candidate info card with photo */}
                            <div className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-2 sm:p-3 border border-indigo-100 transition-all hover:shadow-lg hover:bg-white">
                              {/* Photo */}
                              <div className="flex justify-center mb-1">
                                {fullUrl ? (
                                  <img
                                    src={fullUrl}
                                    alt={candidate.full_name}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-indigo-200 shadow-sm"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.full_name)}&background=6366f1&color=fff&bold=true&size=40`;
                                    }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm">
                                    {initials}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs font-bold text-indigo-600 mb-0.5">
                                #{candidate.ballot_number}
                              </div>
                              <div className="text-xs sm:text-sm font-semibold text-gray-800 truncate" title={candidate.full_name}>
                                {candidate.full_name}
                              </div>
                              {candidate.party_name && (
                                <div className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5" title={candidate.party_name}>
                                  {candidate.party_name}
                                </div>
                              )}
                              <div className="mt-1 sm:mt-2 flex items-baseline justify-center gap-0.5">
                                <AnimatedVoteCount votes={votes} isWinner={isWinner} />
                                <span className="text-[10px] text-gray-500">votes</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tie indicator */}
                  {isTie && maxVotes > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-2 text-center text-xs text-amber-800 border-t border-amber-200">
                      🏆 Tie for the lead! Multiple candidates share the highest votes.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-white/80 border-t border-white/20 pt-8">
          <p className="flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Live updates • Results as of {new Date().toLocaleString()}
          </p>
          <p className="text-xs mt-2">Election ID: {electionId} • Real-time via WebSocket</p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
        .animate-pulse {
          animation: pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1);
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5);
          }
        }
      `}</style>
    </div>
  );
}