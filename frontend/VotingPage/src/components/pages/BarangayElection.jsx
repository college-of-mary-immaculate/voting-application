import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBarangayCandidates, isAuthenticated } from '../../services/api';
import ElectionContainer from '../elections/ElectionContainer';

export default function BarangayElection() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    getBarangayCandidates().then(data => {
      setPositions([
        { id: 'captain', title: 'Barangay Captain', shortTitle: 'Capt', maxVotes: 1, candidates: data.captain },
        { id: 'councilors', title: 'Barangay Councilors', shortTitle: 'Council', maxVotes: 8, candidates: data.councilors },
      ]);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (voteData) => {
    console.log('Submitting barangay votes:', voteData);
    return Promise.resolve();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
        <div className="animate-pulse text-2xl text-[#0f4c5c]">Loading Barangay Election...</div>
      </div>
    );
  }

  return (
    <ElectionContainer
      electionName="Barangay Election"
      electionTagline="Vote for your local leaders"
      positions={positions}
      onSubmitVotes={handleSubmit}
    />
  );
}