import React, { useState, useEffect } from 'react';
import './Election.css';

const electionTypes = [
  { id: 0, name: 'All Types', description: 'Show all elections' },
  { id: 1, name: 'National Elections', description: 'Country-wide / presidential / congressional elections' },
  { id: 2, name: 'Barangay Elections', description: 'Local village / community-level elections' },
  { id: 3, name: 'School Elections', description: 'Student council, class officers, campus organizations' },
  { id: 4, name: 'Custom Elections', description: 'Any user-defined or special voting event' },
];

export default function Elections() {
  const [selectedType, setSelectedType] = useState(0);
  const currentType = electionTypes.find(t => t.id === selectedType);

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const [formData, setFormData] = useState({
    election_type_id: 3,
    name: '',
    start_at: '',
    end_at: '',
  });

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/elections');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.status === 'success') {
        console.log('Fetched elections:', json.data);
        setElections(json.data || []);
      } else {
        throw new Error(json.message || 'Backend returned error');
      }
    } catch (err) {
      setError(err.message || 'Failed to load elections');
      console.error(err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleTypeChange = (e) => {
    setSelectedType(Number(e.target.value));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.start_at || !formData.end_at) {
      setError('All fields are required');
      return;
    }

    const formattedData = {
      election_type_id: Number(formData.election_type_id),
      name: formData.name.trim(),
      start_at: formData.start_at.replace('T', ' ') + ':00',
      end_at: formData.end_at.replace('T', ' ') + ':00',
    };

    try {
      const res = await fetch('/api/elections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const json = await res.json();

      if (!res.ok || json.status !== 'success') {
        throw new Error(json.error || json.message || 'Failed to create election');
      }

      alert('Election created successfully!');

      setSelectedType(Number(formData.election_type_id));

      const optimistic = {
        election_id: Date.now(),
        election_name: formData.name.trim(),
        election_type_id: Number(formData.election_type_id),
        start_at: formattedData.start_at,
        end_at: formattedData.end_at,
        status: 'Upcoming',
        type_name: electionTypes.find(t => t.id === Number(formData.election_type_id))?.name || 'Unknown',
      };
      setElections(prev => [...prev, optimistic]);

      setSyncing(true);

      setTimeout(() => {
        fetchElections();
      }, 5000);

      setFormData({
        election_type_id: 3,
        name: '',
        start_at: '',
        end_at: '',
      });
    } catch (err) {
      setError(err.message);
      console.error('Create error:', err);
    }
  };

  const filteredElections = selectedType === 0
    ? elections
    : elections.filter(el => el.type_name?.trim() === currentType?.name?.replace(' Elections', '').trim());

  return (
    <div className="election-container space-y-8">
      <div className="election-header">
        <h1 className="election-title">Elections Management</h1>
        <p className="election-subtitle">
          Create, view and manage voting events • {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="content-card">
        <div className="content-header">
          <h3 className="content-title">Create New Election</h3>
        </div>

        <div className="card-body">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateElection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Election Type
                </label>
                <select
                  name="election_type_id"
                  value={formData.election_type_id}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {electionTypes.slice(1).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Election Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Student Council Election 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="start_at"
                  value={formData.start_at}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  name="end_at"
                  value={formData.end_at}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-8">
              <button 
                type="submit" 
                className="create-btn px-8 py-3"
                disabled={syncing || loading}
              >
                {syncing ? 'Creating...' : 'Create Election'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="content-card">
        <div className="content-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="content-title">
            {selectedType === 0 ? 'All' : currentType?.name || 'Unknown'} Elections ({filteredElections.length})
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by type:
            </label>
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {electionTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} (ID: {type.id})
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSyncing(true);
                fetchElections();
              }}
              disabled={loading || syncing}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap"
            >
              {syncing ? 'Syncing...' : 'Refresh List'}
            </button>
          </div>
        </div>

        <div className="card-body p-0 mt-6">
          {loading || syncing ? (
            <div className="text-center py-12 text-gray-600">
              {syncing ? 'Syncing... waiting for database (may take 5–10 seconds)' : 'Loading elections...'}
            </div>
          ) : filteredElections.length === 0 ? (
            <div className="empty-state py-16 text-center">
              <div className="text-xl font-semibold mb-2">No elections found</div>
              <div className="text-gray-600">Create one using the form above</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredElections.map(el => (
                    <tr key={el.election_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{el.election_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{el.type_name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(el.start_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(el.end_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          el.status === 'Ongoing' ? 'bg-green-100 text-green-800' :
                          el.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {el.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <p className="election-footer text-center text-sm text-gray-500 mt-8">
        Connected to backend • Real data from /api/elections
      </p>
    </div>
  );
}