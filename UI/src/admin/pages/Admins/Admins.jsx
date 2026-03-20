import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import './Admins.css';

export default function Admins() {
  const [admins, setAdmins] = useState([]);
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

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await API.get('/admins');
      if (data.status === 'success') {
        setAdmins(data.data || []);
      } else {
        throw new Error(data.error || 'Backend error');
      }
    } catch (err) {
      setError(err.message || 'Failed to load admins');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
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

    if (!formData.full_name.trim() || !formData.email.trim() || (!editingId && !formData.password.trim())) {
      setError('Name, email and password are required');
      return;
    }

    setSubmitting(true);

    try {
      let data;
      if (editingId) {
        // UPDATE
        data = await API.put(`/admins/${editingId}`, {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          password: formData.password || undefined,
        });
      } else {
        // CREATE
        data = await API.post('/admins/create', {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
        });
      }

      if (data.status !== 'success') {
        throw new Error(data.error || 'Operation failed');
      }

      alert(editingId ? 'Admin updated successfully!' : 'Admin created successfully!');
      resetForm();
      fetchAdmins();
    } catch (err) {
      setError(err.message || 'Failed to save admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (admin) => {
    setEditingId(admin.admin_id);
    setFormData({
      full_name: admin.full_name,
      email: admin.email,
      password: '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;

    try {
      const data = await API.delete(`/admins/${id}`);
      if (data.status !== 'success') {
        throw new Error(data.error || 'Delete failed');
      }
      alert('Admin deleted successfully!');
      fetchAdmins();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading admins...</div>;

  return (
    <div className="admins-container">
      <div className="page-header">
        <h1 className="page-title">Manage Admins</h1>
        <p className="page-subtitle">Create, edit, and manage administrator accounts</p>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-title">{editingId ? 'Edit Admin' : 'Add New Admin'}</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            disabled={submitting}
          >
            {showForm ? 'Cancel' : 'Add Admin'}
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
                  placeholder="admin@example.com"
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
                {submitting ? 'Saving...' : editingId ? 'Update Admin' : 'Create Admin'}
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
        <h2 className="table-title">Admins List ({admins.length})</h2>

        {admins.length === 0 ? (
          <div className="empty-state">No admins found. Add one using the form above.</div>
        ) : (
          <div className="table-responsive">
            <table className="admins-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.admin_id}>
                    <td>{admin.admin_id}</td>
                    <td className="name-cell">{admin.full_name}</td>
                    <td>{admin.email}</td>
                    <td>{new Date(admin.created_at).toLocaleString()}</td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(admin)}
                        disabled={submitting}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(admin.admin_id)}
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
        <small>Parallel Voting System • {admins.length} admins loaded</small>
      </div>
    </div>
  );
}