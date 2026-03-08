import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClassCandidates, isAuthenticated } from '../../services/api';
import ElectionContainer from '../elections/ElectionContainer';

export default function ClassElection() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    getClassCandidates().then(data => {
      setPositions([
        { id: 'president', title: 'Class President', shortTitle: 'Pres', maxVotes: 1, candidates: data.president },
        { id: 'vp', title: 'Class Vice President', shortTitle: 'VP', maxVotes: 1, candidates: data.vicePresident },
        { id: 'rep', title: 'Class Representative', shortTitle: 'Rep', maxVotes: 1, candidates: data.representative },
      ]);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (voteData) => {
    console.log('Submitting class votes:', voteData);
    return Promise.resolve();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
        <div className="animate-pulse text-2xl text-[#0f4c5c]">Loading Class Election...</div>
      </div>
    );
  }

  return (
    <ElectionContainer
      electionName="Class Election"
      electionTagline="Choose your class officers"
      positions={positions}
      onSubmitVotes={handleSubmit}
      endTime={endTime}
    />
  );
}