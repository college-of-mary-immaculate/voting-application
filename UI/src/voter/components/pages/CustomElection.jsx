import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getElections, 
  getCandidates, 
  isAuthenticated, 
  castVote 
} from '../../services/api';
import ElectionContainer from '../elections/ElectionContainer';

export default function CustomElection() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch elections - with axios, data is in response.data
        const electionsRes = await getElections();
        console.log('Elections response:', electionsRes);
        
        // Handle axios response structure
        const electionsData = electionsRes.data?.data || [];
        const elections = Array.isArray(electionsData) ? electionsData : [electionsData];

        // Find custom election (type_id = 4) that's not closed
        const customElection = elections.find(e => 
          e.election_type_id === 4 && e.status !== 'Closed'
        );
        
        console.log('Found custom election:', customElection);
        
        if (!customElection) {
          setError('No active custom election found.');
          setLoading(false);
          return;
        }

        setElection(customElection);

        // Fetch all candidates
        const candidatesRes = await getCandidates();
        console.log('Candidates response:', candidatesRes);
        
        // Handle axios response structure
        const allCandidates = candidatesRes.data?.data || [];

        // Filter candidates for this election
        const electionCandidates = allCandidates.filter(
          c => c.election_id === customElection.election_id
        );
        
        console.log('Election candidates:', electionCandidates);

        // Group candidates by position_id
        const positionsMap = new Map();
        
        electionCandidates.forEach(candidate => {
          const positionId = candidate.position_id;
          
          if (!positionsMap.has(positionId)) {
            positionsMap.set(positionId, {
              id: positionId,
              name: candidate.position_name || `Position ${positionId}`,
              max_vote: candidate.max_vote_allowed || 1,
              candidates: []
            });
          }
          
          const position = positionsMap.get(positionId);
          position.candidates.push({
            id: candidate.candidate_id,
            name: candidate.full_name,
            party: candidate.party_name,
            photo_url: candidate.photo_url,
            ballot_number: candidate.ballot_number,
            status: candidate.status
          });
        });

        // Convert map to array and sort candidates by ballot_number
        const positionsWithCandidates = Array.from(positionsMap.values()).map(pos => ({
          ...pos,
          candidates: pos.candidates.sort((a, b) => a.ballot_number - b.ballot_number)
        }));

        console.log('Final positions with candidates:', positionsWithCandidates);
        setPositions(positionsWithCandidates);

      } catch (err) {
        console.error('Failed to load election data:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to load election data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (voteData) => {
    try {
      console.log('Submitting vote data:', voteData);
      
      const votes = [];
      
      voteData.forEach(pos => {
        const position = positions.find(p => p.id === pos.positionId);
        
        if (Array.isArray(pos.selected)) {
          // Multiple votes allowed
          pos.selected.forEach(candidateId => {
            const candidate = position?.candidates.find(c => c.id === candidateId);
            if (candidate) {
              votes.push({ 
                position_id: pos.positionId, 
                candidate_id: candidateId,
                ballot_number: candidate.ballot_number 
              });
            }
          });
        } else if (pos.selected) {
          // Single vote
          const candidate = position?.candidates.find(c => c.id === pos.selected);
          if (candidate) {
            votes.push({ 
              position_id: pos.positionId, 
              candidate_id: pos.selected,
              ballot_number: candidate.ballot_number 
            });
          }
        }
      });

      console.log('Formatted votes:', votes);

      const result = await castVote({ 
        election_id: election.election_id, 
        votes: votes 
      });
      
      console.log('Vote cast result:', result);
      alert('Vote submitted successfully!');
      navigate(`/election/${CustomElection.election_id}/tally`);
    } catch (err) {
      console.error('Vote submission failed:', err);
      console.error('Error details:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to submit vote. Please try again.');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse text-2xl text-indigo-600">Loading Custom Election...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center text-red-600 text-xl p-8 bg-white rounded-2xl shadow-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!election) return null;

  // Check if there are any positions with candidates
  const hasVotablePositions = positions.some(p => p.candidates.length > 0);

  if (!hasVotablePositions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Candidates Available</h2>
          <p className="text-gray-600">This election doesn't have any candidates yet.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ElectionContainer
      electionName={election.election_name}
      electionTagline="Cast your votes for this election"
      positions={positions}
      onSubmitVotes={handleSubmit}
      endTime={election.end_at}
      serverTime={new Date().toISOString()}
    />
  );
}