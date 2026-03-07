import React, { useState } from 'react';
import './Users.css';

const mockVoters = [
  {
    voter_id: 1,
    full_name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    has_voted: true,
    created_at: '2025-02-15 09:30:00',
  },
  {
    voter_id: 2,
    full_name: 'Maria Santos',
    email: 'maria.santos@school.edu.ph',
    has_voted: false,
    created_at: '2025-02-16 14:45:00',
  },
  {
    voter_id: 3,
    full_name: 'Pedro Reyes',
    email: 'pedro.reyes@gmail.com',
    has_voted: true,
    created_at: '2025-02-17 11:20:00',
  },
  {
    voter_id: 4,
    full_name: 'Ana Lim',
    email: 'ana.lim@yahoo.com',
    has_voted: false,
    created_at: '2025-02-18 16:10:00',
  },
  {
    voter_id: 5,
    full_name: 'Carlos Mendoza',
    email: 'carlos.mendoza@outlook.com',
    has_voted: true,
    created_at: '2025-02-19 08:55:00',
  },
];

export default function Users() {
  const [voters] = useState(mockVoters);
  const [searchTerm, setSearchTerm] = useState('');

  // Simple client-side search/filter
  const filteredVoters = voters.filter(voter =>
    voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Manage Voters</h1>
        <p className="page-subtitle">
          View and manage registered voters • Total: {voters.length}
        </p>
      </div>

      {/* Search bar */}
      <div className="search-card">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Voters Table */}
      <div className="table-card">
        <h2 className="table-title">Registered Voters</h2>

        {filteredVoters.length === 0 ? (
          <div className="empty-state">
            No voters found matching "{searchTerm}"
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.map(voter => (
                  <tr key={voter.voter_id}>
                    <td>{voter.voter_id}</td>
                    <td>{voter.full_name}</td>
                    <td>{voter.email}</td>
                    <td>
                      <span className={`status-badge ${voter.has_voted ? 'voted' : 'not-voted'}`}>
                        {voter.has_voted ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>{new Date(voter.created_at).toLocaleDateString('en-PH')}</td>
                    <td className="actions-cell">
                      <button className="btn btn-view">View</button>
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
        <small>Demo mode – UI only (mock data) • Real data from voters table coming later</small>
      </div>
    </div>
  );
}