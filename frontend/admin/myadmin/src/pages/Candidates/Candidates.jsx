import React, { useState, useEffect } from 'react';
import './Candidates.css';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    position_id: '',
    full_name: '',
    party_name: '',
    photo_url: '',
    status: 'Active',
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/candidates');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (json.status === 'success') {
          setCandidates(json.data || []);
        } else {
          throw new Error(json.error || 'Backend error');
        }
      } catch (err) {
        setError(err.message || 'Failed to load candidates');
        console.error('Fetch failed:', err);
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

    if (!formData.full_name.trim() || !formData.position_id) {
      setError('Full name and position ID are required');
      return;
    }

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || json.status !== 'success') {
        throw new Error(json.error || 'Failed to add candidate');
      }

      alert('Candidate added successfully!');

      // Refresh list
      const refreshRes = await fetch('/api/candidates');
      const refreshJson = await refreshRes.json();
      if (refreshJson.status === 'success') {
        setCandidates(refreshJson.data || []);
      }

      // Reset form
      setFormData({
        position_id: '',
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
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Manage Candidates</h1>
        <p className="page-subtitle">
          Add, view, and manage candidates across all positions and elections
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-card">
        <h2 className="form-title">Add New Candidate</h2>

        <form onSubmit={handleSubmit} className="candidate-form">
          <div className="form-grid">
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

            <div className="form-group">
              <label>Position ID *</label>
              <input
                type="number"
                name="position_id"
                value={formData.position_id}
                onChange={handleChange}
                placeholder="Enter valid position ID (e.g. 1)"
                required
              />
              <small className="help-text">
                Get valid IDs from <strong>Positions</strong> table in database
              </small>
            </div>

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

            <div className="form-group full-width">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Create Candidate
            </button>
          </div>
        </form>
      </div>

      {/* Candidates Table */}
      <div className="table-card">
        <h2 className="table-title">
          Candidates ({candidates.length})
        </h2>

        {candidates.length === 0 ? (
          <div className="empty-state">
            No candidates found. Add one using the form above.
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
                    <td className="name-cell">{c.full_name}</td>
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
          Connected to real backend • {candidates.length} candidates loaded
        </small>
      </div>
    </div>
  );
}