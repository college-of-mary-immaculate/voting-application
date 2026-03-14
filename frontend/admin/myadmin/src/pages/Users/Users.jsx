import React, { useState, useEffect } from 'react';
import './Users.css';

export default function Users() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchVoters = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/voters');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status === 'success') {
        setVoters(json.data || []);
      } else {
        throw new Error(json.error || 'Backend error');
      }
    } catch (err) {
      setError(err.message || 'Failed to load voters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ full_name: '', email: '', password: '' });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }
    if (!editingId && !formData.password.trim()) {
      setError('Password is required for new voters');
      return;
    }

    setSubmitting(true);

    try {
      let res;
      if (editingId) {
        // UPDATE
        res = await fetch(`/api/voters/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            password: formData.password || undefined,
          }),
        });
      } else {
        // CREATE (use register endpoint)
        res = await fetch('/api/voters/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullname: formData.full_name.trim(),
            email: formData.email.trim(),
            password: formData.password.trim(),
          }),
        });
      }

      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.error || 'Operation failed');
      }

      alert(editingId ? 'Voter updated successfully!' : 'Voter created successfully!');
      resetForm();
      fetchVoters();
    } catch (err) {
      setError(err.message || 'Failed to save voter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (voter) => {
    setEditingId(voter.voter_id);
    setFormData({
      full_name: voter.full_name,
      email: voter.email,
      password: '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this voter?')) return;

    try {
      const res = await fetch(`/api/voters/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.error || 'Delete failed');
      }
      alert('Voter deleted successfully!');
      fetchVoters();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading voters...</div>;

  return (
    <div className="users-container">
      <div className="page-header">
        <h1 className="page-title">Manage Voters</h1>
        <p className="page-subtitle">Create, edit, and manage voter accounts</p>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-title">{editingId ? 'Edit Voter' : 'Add New Voter'}</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            disabled={submitting}
          >
            {showForm ? 'Cancel' : 'Add Voter'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="voter@example.com"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>{editingId ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required={!editingId}
                  disabled={submitting}
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update Voter' : 'Create Voter'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={submitting}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Table Card */}
      <div className="table-card">
        <h2 className="table-title">Voters List ({voters.length})</h2>

        {voters.length === 0 ? (
          <div className="empty-state">No voters found. Add one using the form above.</div>
        ) : (
          <div className="table-responsive">
            <table className="voters-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Has Voted</th>
                  <th>Registered At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {voters.map(v => (
                  <tr key={v.voter_id}>
                    <td>{v.voter_id}</td>
                    <td className="name-cell">{v.full_name}</td>
                    <td>{v.email}</td>
                    <td>
                      <span className={`status-badge ${v.has_voted ? 'voted' : 'not-voted'}`}>
                        {v.has_voted ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>{new Date(v.created_at).toLocaleString()}</td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(v)}
                        disabled={submitting}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(v.voter_id)}
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
        <small>Connected to backend • {voters.length} voters loaded</small>
      </div>
    </div>
  );
}