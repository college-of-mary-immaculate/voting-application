import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import './Candidates.css';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    position_id: '',
    full_name: '',
    party_name: '',
    photo_url: '',
    status: 'Active',
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await API.get('/candidates');
      if (data.status === 'success') {
        setCandidates(data.data || []);
      } else {
        throw new Error(data.error || 'Backend error');
      }
    } catch (err) {
      setError(err.message || 'Failed to load candidates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      position_id: '',
      full_name: '',
      party_name: '',
      photo_url: '',
      status: 'Active',
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim() || !formData.position_id) {
      setError('Full name and position ID are required');
      return;
    }

    setSubmitting(true);

    try {
      let data;
      if (editingId) {
        data = await API.put(`/candidates/${editingId}`, {
          position_id: Number(formData.position_id),
          full_name: formData.full_name.trim(),
          party_name: formData.party_name.trim() || null,
          photo_url: formData.photo_url.trim() || null,
          status: formData.status,
        });
      } else {
        data = await API.post('/candidates', {
          position_id: Number(formData.position_id),
          full_name: formData.full_name.trim(),
          party_name: formData.party_name.trim() || null,
          photo_url: formData.photo_url.trim() || null,
          status: formData.status,
        });
      }

      if (data.status !== 'success') {
        throw new Error(data.error || 'Operation failed');
      }

      alert(editingId ? 'Candidate updated successfully!' : 'Candidate added successfully!');
      resetForm();
      fetchCandidates();
    } catch (err) {
      setError(err.message || 'Failed to save candidate');
      console.error('Save failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (candidate) => {
    setEditingId(candidate.candidate_id);
    setFormData({
      position_id: candidate.position_id ?? '',
      full_name: candidate.full_name || '',
      party_name: candidate.party_name || '',
      photo_url: candidate.photo_url || '',
      status: candidate.status || 'Active',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (candidate_id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;

    try {
      await API.delete(`/candidates/${candidate_id}`);
      alert('Candidate deleted successfully!');
      fetchCandidates();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading candidates...</div>;

  return (
    <div className="candidates-container">
      <div className="page-header">
        <h1 className="page-title">Manage Candidates</h1>
        <p className="page-subtitle">
          Create, edit, and manage candidates across all positions
        </p>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-title">
            {editingId ? 'Edit Candidate' : 'Add New Candidate'}
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            disabled={submitting}
          >
            {showForm ? 'Cancel' : 'Add Candidate'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Position ID *</label>
                <input
                  type="number"
                  name="position_id"
                  value={formData.position_id}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  required
                  disabled={submitting}
                />
                <small className="help-text">
                  Enter a valid position ID from the Positions table
                </small>
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Juan Dela Cruz"
                  required
                  disabled={submitting}
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
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Photo URL (optional)</label>
                <input
                  type="url"
                  name="photo_url"
                  value={formData.photo_url}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  disabled={submitting}
                />
              </div>

              <div className="form-group full-width">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} disabled={submitting}>
                  <option value="Active">Active</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting
                  ? 'Saving...'
                  : editingId
                  ? 'Update Candidate'
                  : 'Create Candidate'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Table Card */}
      <div className="table-card">
        <h2 className="table-title">Candidates List ({candidates.length})</h2>

        {candidates.length === 0 ? (
          <div className="empty-state">No candidates found. Add one using the form above.</div>
        ) : (
          <div className="table-responsive">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>Ballot</th>
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
                    <td>{c.ballot_number || '—'}</td>
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
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(c)}
                        disabled={submitting}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(c.candidate_id)}
                        disabled={submitting}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="page-footer">
        <small>Connected to backend • {candidates.length} candidates loaded</small>
      </div>
    </div>
  );
}