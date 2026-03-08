import React, { useState, useEffect } from 'react';
import './Candidates.css';

const mockCandidates = [
  {
    candidate_id: 1,
    full_name: 'Juan Dela Cruz',
    party_name: 'SAMAHAN',
    position_name: 'President',
    election_name: 'School Elections 2025-2026',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    status: 'Active',
  },
  {
    candidate_id: 2,
    full_name: 'Maria Santos',
    party_name: 'Lakas ng Kabataan',
    position_name: 'Vice President',
    election_name: 'School Elections 2025-2026',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    status: 'Active',
  },
];

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    party_name: '',
    photo_url: '',
    status: 'Active',
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/candidates');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (json.status === 'success') {
          setCandidates(json.data || []);
        } else {
          setError('Backend returned error — showing demo data');
          setCandidates(mockCandidates);
        }
      } catch (err) {
        console.error('Fetch failed:', err);
        setError('Could not connect to server — showing demo data');
        setCandidates(mockCandidates);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }

    const dataToSend = {
      ...formData,
      position_id: 1, 
    };

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const json = await res.json();

      if (!res.ok || json.status !== 'success') {
        throw new Error(json.error || 'Failed to add candidate');
      }

      alert('Candidate added successfully!');

      const refreshRes = await fetch('/api/candidates');
      const refreshJson = await refreshRes.json();
      if (refreshJson.status === 'success') {
        setCandidates(refreshJson.data || []);
      }

      setFormData({
        full_name: '',
        party_name: '',
        photo_url: '',
        status: 'Active',
      });
    } catch (err) {
      setError(err.message);
      console.error('Add failed:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading candidates...</div>;
  }

  return (
    <div className="candidates-container">
      <div className="page-header">
        <h1 className="page-title">Manage Candidates</h1>
        <p className="page-subtitle">
          Add, view and manage candidates across all positions and elections
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error} {candidates.length > 0 && '(showing demo data)'}
        </div>
      )}

      <div className="form-card">
        <h2 className="form-title">Add New Candidate</h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Note: Position is fixed to ID 1 in demo mode (add real positions in DB to unlock selection)
        </p>

        <form onSubmit={handleSubmit} className="candidate-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            <div className="form-group">
              <label>Party / Group (optional)</label>
              <input
                type="text"
                name="party_name"
                value={formData.party_name}
                onChange={handleChange}
                placeholder="e.g. SAMAHAN"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Photo URL (optional)</label>
              <input
                type="url"
                name="photo_url"
                value={formData.photo_url}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Create Candidate
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <h2 className="table-title">
          Candidates List {candidates.length > 0 && `(${candidates.length})`}
        </h2>

        {candidates.length === 0 ? (
          <div className="empty-state">
            No candidates found in the database.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Party</th>
                  <th>Position</th>
                  <th>Election</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c.candidate_id}>
                    <td>
                      <img
                        src={c.photo_url || 'https://via.placeholder.com/60?text=No+Photo'}
                        alt={c.full_name}
                        className="candidate-photo"
                        onError={e => e.target.src = 'https://via.placeholder.com/60?text=Error'}
                      />
                    </td>
                    <td>{c.full_name}</td>
                    <td>{c.party_name || '—'}</td>
                    <td>{c.position_name || 'Unknown'}</td>
                    <td>{c.election_name || 'Unknown'}</td>
                    <td>
                      <span className={`status-badge ${c.status?.toLowerCase() || 'active'}`}>
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="btn btn-edit">Edit</button>
                      <button className="btn btn-delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="page-footer">
        <small>
          {candidates.length > 0 && candidates[0].candidate_id !== mockCandidates[0].candidate_id
            ? 'Connected to real backend'
            : 'Demo mode (mock data)'}
        </small>
      </div>
    </div>
  );
}