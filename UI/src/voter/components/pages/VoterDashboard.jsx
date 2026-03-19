import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getElections } from '../../services/api';

export default function VoterDashboard() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const res = await getElections();
        
        // Handle different response structures
        let electionsData = [];
        if (res.data && Array.isArray(res.data)) {
          electionsData = res.data;
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          electionsData = res.data.data;
        } else if (Array.isArray(res)) {
          electionsData = res;
        }

        // Remove duplicates based on election_id
        const uniqueElections = Array.from(
          new Map(electionsData.map(item => [item.election_id, item])).values()
        );
        
        setElections(uniqueElections);
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError('Failed to load elections');
      } finally {
        setLoading(false);
      }
    };
    
    fetchElections();
  }, []);

  const renderTimer = (election) => {
    const now = new Date();
    const start = new Date(election.start_at);
    const end = new Date(election.end_at);

    if (now < start) {
      const diff = start - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return <span className="text-blue-600">Starts in {days}d {hours}h</span>;
      } else if (hours > 0) {
        return <span className="text-blue-600">Starts in {hours}h {minutes}m</span>;
      } else {
        return <span className="text-blue-600">Starts in {minutes}m</span>;
      }
    } else if (now >= start && now <= end) {
      const diff = end - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return <span className="text-green-600 font-bold">Ends in {hours}h {minutes}m</span>;
      } else {
        return <span className="text-green-600 font-bold">Ends in {minutes}m</span>;
      }
    } else {
      return <span className="text-red-600 font-bold">Closed</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Loading your elections...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 text-red-500">❌</div>
          <div className="text-xl text-red-600 mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🗳️ Your Elections</h1>
        <p className="text-gray-600 mb-6">Select an election to vote or view results</p>
        
        {elections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold mb-2">No Elections Found</h2>
            <p className="text-gray-600">You are not assigned to any elections yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div 
                key={election.election_id} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-semibold text-xl text-gray-800">
                      {election.election_name}
                    </h2>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      election.status === 'Ongoing' ? 'bg-green-100 text-green-800' :
                      election.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {election.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">
                      {election.type_name || 'Election'}
                    </div>
                    <div className="text-sm">
                      {renderTimer(election)}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {election.status === 'Ongoing' && !election.has_voted && (
                      <button
                        onClick={() => navigate(`/election/${election.election_id}/vote`)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        🗳️ Vote Now
                      </button>
                    )}
                    
                    {election.status === 'Ongoing' && election.has_voted && (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed font-medium"
                      >
                        ✅ Already Voted
                      </button>
                    )}
                    
                    {election.status === 'Closed' && (
                      <button
                        onClick={() => navigate(`/election/${election.election_id}/results`)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        📊 View Results
                      </button>
                    )}
                    
                    {election.status === 'Upcoming' && (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed font-medium"
                      >
                        ⏳ Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}