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
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state (used for both create and edit)
  const [formData, setFormData] = useState({
    election_type_id: 3,
    name: '',
    start_at: '',
    end_at: '',
  });

  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch elections
  const fetchElections = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/elections');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();

      if (json.status === 'success') {
        setElections(json.data || []);
      } else {
        throw new Error(json.message || json.error || 'Backend error');
      }
    } catch (err) {
      setError(err.message || 'Failed to load elections');
      console.error('Fetch elections error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form and close
  const resetForm = () => {
    setFormData({
      election_type_id: 3,
      name: '',
      start_at: '',
      end_at: '',
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  // Create or Update election
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Election name is required');
      return;
    }
    if (!formData.election_type_id) {
      setError('Please select an election type');
      return;
    }
    if (!formData.start_at || !formData.end_at) {
      setError('Start and end dates are required');
      return;
    }

    setSubmitting(true);

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/elections/${editingId}` : '/api/elections';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          election_type_id: Number(formData.election_type_id),
          start_at: formData.start_at,
          end_at: formData.end_at,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      const json = await res.json();

      if (json.status !== 'success') {
        throw new Error(json.message || json.error || 'Operation failed');
      }

      alert(editingId ? 'Election updated successfully!' : 'Election created successfully!');
      resetForm();
      fetchElections();
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing
  const handleEdit = (election) => {
    setEditingId(election.election_id);
    setFormData({
      election_type_id: election.election_type_id,
      name: election.election_name || '',
      start_at: election.start_at ? election.start_at.slice(0, 16) : '',
      end_at: election.end_at ? election.end_at.slice(0, 16) : '',
    });
    setShowForm(true);
    setError(null);
  };

  // Delete election
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/elections/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      alert('Election deleted successfully!');
      fetchElections();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
      console.error('Delete error:', err);
    }
  };

  // Filter by type (client-side)
  const filteredElections = selectedType === 0
    ? elections
    : elections.filter((el) => el.election_type_id === selectedType);

  return (
    <div className="election-container">
      <div className="election-header">
        <h1 className="election-title">Manage Elections</h1>
        <p className="election-subtitle">Create, edit, and monitor all voting events</p>
      </div>

      {/* Create / Edit Form */}
      <div className="content-card">
        <div className="content-header">
          <h2 className="content-title">
            {editingId ? 'Edit Election' : 'Create New Election'}
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            disabled={submitting}
          >
            {showForm ? 'Cancel' : 'Add Election'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Election Type *</label>
                <select
                  name="election_type_id"
                  value={formData.election_type_id}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  {electionTypes.slice(1).map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Election Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. 2026 Student Council Election"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  name="start_at"
                  value={formData.start_at}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>End Date & Time *</label>
                <input
                  type="datetime-local"
                  name="end_at"
                  value={formData.end_at}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {error && <div className="error-message mt-3">{error}</div>}

            <div className="form-actions mt-4">
              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting
                  ? 'Saving...'
                  : editingId
                  ? 'Update Election'
                  : 'Create Election'}
              </button>
              <button
                type="button"
                className="btn btn-secondary ml-2"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Elections List */}
      <div className="content-card">
        <div className="content-header flex justify-between items-center">
          <h2 className="content-title">Elections List</h2>
          <div className="filter-group">
            <label className="mr-2">Filter by Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(Number(e.target.value))}
              className="filter-select"
            >
              {electionTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading text-center py-8">Loading elections...</div>
        ) : error ? (
          <div className="error-message text-center py-8">{error}</div>
        ) : filteredElections.length === 0 ? (
          <div className="empty-state text-center py-12">
            No elections found for the selected filter.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="elections-table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredElections.map((el) => (
                  <tr key={el.election_id}>
                    <td>{el.election_id}</td>
                    <td className="font-medium">{el.election_name}</td>
                    <td>{el.type_name || 'Unknown'}</td>
                    <td>
                      {el.start_at &&
                        new Date(el.start_at).toLocaleString('en-PH', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                    </td>
                    <td>
                      {el.end_at &&
                        new Date(el.end_at).toLocaleString('en-PH', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          el.status === 'Ongoing'
                            ? 'ongoing'
                            : el.status === 'Upcoming'
                            ? 'upcoming'
                            : 'closed'
                        }`}
                      >
                        {el.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-edit mr-2"
                        onClick={() => handleEdit(el)}
                        disabled={submitting}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(el.election_id)}
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

      <p className="election-footer text-center mt-8 text-gray-500">
        Connected to backend • {elections.length} elections loaded
      </p>
    </div>
  );
}