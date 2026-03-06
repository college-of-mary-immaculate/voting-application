import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNationalCandidates, isAuthenticated } from '../../services/api';
import ElectionContainer from '../elections/ElectionContainer';

export default function NationalElection() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    getNationalCandidates().then(data => {
      setPositions([
        { id: 'president', title: 'President', shortTitle: 'Pres', maxVotes: 1, candidates: data.president },
        { id: 'vp', title: 'Vice President', shortTitle: 'VP', maxVotes: 1, candidates: data.vicePresident },
        { id: 'senators', title: 'Senators', shortTitle: 'Sen', maxVotes: 12, candidates: data.senators },
      ]);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (voteData) => {
    console.log('Submitting national votes:', voteData);
    return Promise.resolve();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
        <div className="animate-pulse text-2xl text-[#0f4c5c]">Loading National Election...</div>
      </div>
    );
  }

  return (
    <ElectionContainer
      electionName="National Election"
      electionTagline="Choose the next leaders of the country"
      positions={positions}
      onSubmitVotes={handleSubmit}
    />
  );
}