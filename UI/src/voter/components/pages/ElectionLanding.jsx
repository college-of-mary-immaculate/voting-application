import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getElections } from '../../services/api';

const electionContent = {
  1: {
    tagline: "Shape the future of our nation",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=2070&auto=format&fit=crop",
    alt: "National election",
    slug: 'national'
  },
  2: {
    tagline: "Choose your barangay officials",
    image: "https://images.unsplash.com/photo-1563262924-641a8b3d9f5b?q=80&w=2070&auto=format&fit=crop",
    alt: "Barangay election",
    slug: 'barangay'
  },
  3: {
    tagline: "Choose your class officers",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
    alt: "Class election",
    slug: 'class'
  },
  4: {
    tagline: "Cast your votes for this election",
    image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070&auto=format&fit=crop",
    alt: "Custom election",
    slug: 'custom'
  }
};

export default function ElectionLanding() {
  const { electionId, slug } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await getElections(); // GET /elections/my-elections
        const elections = res.data?.data || [];
        const found = elections.find(e => e.election_id === parseInt(electionId));
        setElection(found || null);
      } catch (err) {
        console.error('Failed to fetch election:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchElection();
  }, [electionId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-2xl text-indigo-600">Loading...</div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-red-600 text-xl">
          Election not found.
        </div>
      </div>
    );
  }

  const content = electionContent[election.election_type_id] || electionContent[4];

  const handleStartVoting = () => {
    navigate(`/elections/${slug}/${electionId}/vote`);
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="mb-8 flex justify-center">
          <img
            src={content.image}
            alt={content.alt}
            className="w-80 h-80 object-cover rounded-3xl shadow-2xl"
          />
        </div>
        <h1 className="text-6xl font-light text-slate-800 mb-6">
          {election.election_name}
        </h1>
        <p className="text-2xl text-slate-600 mb-8">
          {content.tagline}
        </p>
        <button
          onClick={handleStartVoting}
          className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-xl font-semibold hover:bg-indigo-700 transition shadow-lg"
        >
          Start Voting
        </button>
      </div>
    </div>
  );
}