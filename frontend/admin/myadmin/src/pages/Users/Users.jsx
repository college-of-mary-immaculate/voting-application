import React, { useState, useEffect } from 'react';
import './Users.css';

export default function Users() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real voters from backend
  useEffect(() => {
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
          throw new Error(json.error || 'Backend returned error');
        }
      } catch (err) {
        setError(err.message || 'Failed to load voters');
        console.error('Fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoters();
  }, []);

  if (loading) {
    return <div className="loading">Loading voters...</div>;
  }

  return (
    <div className="users-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Manage Voters</h1>
        <p className="page-subtitle">
          View all registered voters in the system
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Voters Table */}
      <div className="table-card">
        <h2 className="table-title">
          Voters List ({voters.length})
        </h2>

        {voters.length === 0 ? (
          <div className="empty-state">
            No voters registered yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="voters-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Has Voted</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {voters.map(v => (
                  <tr key={v.voter_id}>
                    <td>{v.voter_id}</td>
                    <td>{v.full_name}</td>
                    <td>{v.email}</td>
                    <td>
                      <span className={`status-badge ${v.has_voted ? 'voted' : 'not-voted'}`}>
                        {v.has_voted ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      {new Date(v.created_at).toLocaleString('en-PH', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
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
          Connected to real backend • {voters.length} voters loaded
        </small>
      </div>
    </div>
  );
}