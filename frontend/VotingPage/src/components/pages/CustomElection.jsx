import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomCandidates, isAuthenticated } from '../../services/api';
import ElectionContainer from '../elections/ElectionContainer';

export default function CustomElection() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    getCustomCandidates().then(data => {
      setPositions([
        { id: 'chair', title: 'Chairperson', shortTitle: 'Chair', maxVotes: 1, candidates: data.chairperson },
        { id: 'members', title: 'Committee Members', shortTitle: 'Members', maxVotes: 2, candidates: data.members },
      ]);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (voteData) => {
    console.log('Submitting custom votes:', voteData);
    return Promise.resolve();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
        <div className="animate-pulse text-2xl text-[#0f4c5c]">Loading Custom Election...</div>
      </div>
    );
  }

  return (
    <ElectionContainer
      electionName="Custom Election"
      electionTagline="Vote for your preferred candidates"
      positions={positions}
      onSubmitVotes={handleSubmit}
    />
  );
}