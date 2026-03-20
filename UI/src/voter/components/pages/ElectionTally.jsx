import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getElectionResults } from '../../services/api';
import socket from '../../utils/socket';
import CountdownTimer from '../elections/CountdownTimer';

export default function ElectionTally() {
  const { electionId } = useParams();
  const [results, setResults] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    try {
      const res = await getElectionResults(electionId);
      setResults(res.data.results || []);
      setElection(res.data.election);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 text-red-500">❌</div>
          <p className="text-lg text-red-600 font-medium mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg text-gray-600 font-medium mb-2">No Results Yet</p>
          <p className="text-gray-500">Check back later when votes have been cast.</p>
        </div>
      </div>
    );
  }

  const totalVotes = results.reduce((total, position) => {
    return total + position.candidates.reduce((posTotal, c) => posTotal + (c.votes || 0), 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {election?.election_name || `Election #${electionId}`}
            </h1>
            <p className="text-gray-600">
              Final tally of votes • Total votes cast: {totalVotes}
            </p>
          </div>
          {election?.end_at && (
            <CountdownTimer endTime={election.end_at} serverTime={new Date().toISOString()} />
          )}
        </div>

        <div className="space-y-6">
          {results.map((position) => {
            const votesArray = position.candidates.map(c => c.votes || 0);
            const maxVotes = Math.max(...votesArray, 0);
            const isMultiWinner = votesArray.filter(v => v === maxVotes).length > 1;

            return (
              <div key={position.position_id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-indigo-900">
                      {position.position_name}
                    </h2>
                    <span className="text-sm text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                      {position.candidates.length} candidate{position.candidates.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {position.candidates.map((candidate) => {
                      const votes = candidate.votes || 0;
                      const isWinner = votes === maxVotes && maxVotes > 0;
                      const votePercentage = maxVotes > 0 ? ((votes / maxVotes) * 100).toFixed(1) : 0;

                      return (
                        <div
                          key={candidate.candidate_id}
                          className={`flex items-center p-4 rounded-lg transition-colors ${
                            isWinner ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="text-indigo-800 font-bold text-lg">
                              #{candidate.ballot_number}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className={`font-semibold text-lg ${isWinner ? 'text-green-800' : 'text-gray-900'}`}>
                                {candidate.full_name}
                              </span>
                              {isWinner && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  {isMultiWinner ? 'Tied' : 'Winner'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right ml-4 min-w-[140px]">
                            <div className="flex items-baseline justify-end">
                              <span className={`font-bold text-2xl ${isWinner ? 'text-green-600' : 'text-gray-700'}`}>
                                {votes}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">votes</span>
                            </div>

                            {maxVotes > 0 && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      isWinner ? 'bg-green-500' : 'bg-indigo-500'
                                    }`}
                                    style={{ width: `${votePercentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 text-right">
                                  {votePercentage}% of leader
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-6">
          <p>Results as of {new Date().toLocaleString()}</p>
          <p className="text-xs mt-1">Election ID: {electionId}</p>
        </div>
      </div>
    </div>
  );
}