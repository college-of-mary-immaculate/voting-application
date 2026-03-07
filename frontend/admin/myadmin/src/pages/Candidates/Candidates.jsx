import React, { useState } from 'react';
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
  {
    candidate_id: 3,
    full_name: 'Pedro Reyes',
    party_name: null,
    position_name: 'Secretary',
    election_name: 'Class 11-A Officer Election',
    photo_url: '',
    status: 'Withdrawn',
  },
  {
    candidate_id: 4,
    full_name: 'Ana Lim',
    party_name: 'Bagong Pag-asa',
    position_name: 'Treasurer',
    election_name: 'School Elections 2025-2026',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    status: 'Active',
  },
];

export default function Candidates() {
  const [candidates] = useState(mockCandidates);
  const [formData, setFormData] = useState({
    full_name: '',
    party_name: '',
    position_id: '',
    photo_url: '',
    status: 'Active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Candidate added (demo mode – no real save)');
    // You can simulate adding to the list if you want
  };

  return (
    <div className="candidates-container">
      <div className="page-header">
        <h1 className="page-title">Manage Candidates</h1>
        <p className="page-subtitle">
          Add, view and manage candidates across all positions and elections
        </p>
      </div>

      {/* Add Candidate Form */}
      <div className="form-card">
        <h2 className="form-title">Add New Candidate</h2>
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
              <label>Position *</label>
              <select name="position_id" value={formData.position_id} onChange={handleChange} required>
                <option value="">— Select Position —</option>
                <option value="1">President</option>
                <option value="2">Vice President</option>
                <option value="3">Secretary</option>
                <option value="4">Treasurer</option>
                <option value="5">Auditor</option>
              </select>
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
          Candidates List {candidates.length > 0 && `(${candidates.length})`}
        </h2>

        {candidates.length === 0 ? (
          <div className="empty-state">
            No candidates added yet.
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
                      />
                    </td>
                    <td>{c.full_name}</td>
                    <td>{c.party_name || '—'}</td>
                    <td>{c.position_name}</td>
                    <td>{c.election_name}</td>
                    <td>
                      <span className={`status-badge ${c.status.toLowerCase()}`}>
                        {c.status}
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
        <small>Demo mode – UI only (no backend connection)</small>
      </div>
    </div>
  );
}