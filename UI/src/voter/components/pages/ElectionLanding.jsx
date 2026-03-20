import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getElections } from '../../services/api';
import CountdownTimer from '../elections/CountdownTimer';

const electionContent = {
  1: { // National
    tagline: "Shape the future of our nation",
    image: "https://tse1.mm.bing.net/th/id/OIP.JQ4NpNKqdQvSOI2NjFc6BgHaFV?rs=1&pid=ImgDetMain&o=7&rm=3",
    alt: "National election",
    slug: 'national'
  },
  2: { // Barangay
    tagline: "Choose your barangay officials",
    image: "https://www.rappler.com/tachyon/2023/02/imho-community-governance.png",
    alt: "Barangay election",
    slug: 'barangay'
  },
  3: { // Class
    tagline: "Choose your class officers",
    image: "https://www.shutterstock.com/image-vector/students-who-vote-class-gain-260nw-2421182715.jpg",
    alt: "Class election",
    slug: 'class'
  },
  4: { // Custom
    tagline: "Cast your votes for this election",
    image: "https://tse2.mm.bing.net/th/id/OIP.EGnBKA1h5l0Pxy1hq96fhwHaEJ?rs=1&pid=ImgDetMain&o=7&rm=3",
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
        if (found) {
          if (found.has_voted) {
            navigate(`/elections/tally/${electionId}`, { replace: true });
            return;
          }
          setElection(found);
        } else {
          setElection(null);
        }
      } catch (err) {
        console.error('Failed to fetch election:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchElection();
  }, [electionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{ backgroundImage: "url('https://img.freepik.com/premium-vector/philippines-election-banner-background-template-your-design_97886-9564.jpg')" }}></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{ backgroundImage: "url('https://img.freepik.com/premium-vector/philippines-election-banner-background-template-your-design_97886-9564.jpg')" }}></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
          <div className="text-5xl mb-4 text-red-400">⚠️</div>
          <p className="text-xl text-red-600 font-medium mb-2">Election not found</p>
          <p className="text-gray-600">You may not be assigned to this election.</p>
        </div>
      </div>
    );
  }

  const content = electionContent[election.election_type_id] || electionContent[4];

  const handleStartVoting = () => {
    navigate(`/elections/${slug}/${electionId}/vote`);
  };

  return (
    <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
        style={{ backgroundImage: "url('https://img.freepik.com/premium-vector/philippines-election-banner-background-template-your-design_97886-9564.jpg')" }}
      ></div>
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/50 transition-all duration-300 hover:shadow-3xl">
          <div className="flex flex-col md:flex-row">
            {/* Left side – image */}
            <div className="md:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <div className="h-64 md:h-full flex items-center justify-center p-8">
                <img
                  src={content.image}
                  alt={content.alt}
                  className="w-full max-w-sm object-cover rounded-2xl shadow-2xl transform transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Right side – content */}
            <div className="md:w-1/2 p-8 sm:p-10 md:p-12 flex flex-col justify-center">
              <div className="mb-2 text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                {election.type_name || 'Election'}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {election.election_name}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed">
                {content.tagline}
              </p>

              {/* Countdown timer */}
              {election.end_at && (
                <div className="mb-8">
                  <div className="inline-block bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 shadow-md">
                    <CountdownTimer endTime={election.end_at} serverTime={new Date().toISOString()} />
                  </div>
                </div>
              )}

              {/* Start Voting button */}
              <button
                onClick={handleStartVoting}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="relative z-10">Start Voting</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}