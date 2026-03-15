import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_voters: 0,
    total_candidates: 0,
    total_elections: 0,
    total_positions: 0,
    turnout_percentage: 0,
    elections: { upcoming: 0, ongoing: 0, closed: 0 }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🚀 Dashboard mounted, checking token...');
        const token = localStorage.getItem('token');
        console.log('Token in Dashboard:', token ? '✅ Present' : '❌ Missing');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('📡 Fetching dashboard stats...');
        const data = await API.get('/dashboard/stats');
        console.log('📊 Dashboard data received:', data);

        if (data.status === 'success') {
          setStats(data.data);
        } else {
          throw new Error(data.error || 'Failed to load stats');
        }
      } catch (err) {
        console.error('❌ Dashboard error:', err);
        setError(err.message || 'Could not load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Overview of Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.total_voters}</div>
          <div className="stat-label">Total Voters</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{stats.total_candidates}</div>
          <div className="stat-label">Total Candidates</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🗳️</div>
          <div className="stat-value">{stats.total_elections}</div>
          <div className="stat-label">Total Elections</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.total_positions}</div>
          <div className="stat-label">Total Positions</div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.turnout_percentage}%</div>
          <div className="stat-label">Turnout</div>
        </div>
      </div>

      {/* Election Status */}
      <div className="card">
        <h2 className="card-title">Election Status</h2>
        <div className="status-grid">
          <div className="status-item upcoming">
            <span className="status-count">{stats.elections.upcoming}</span>
            <span className="status-label">Upcoming</span>
          </div>
          <div className="status-item ongoing">
            <span className="status-count">{stats.elections.ongoing}</span>
            <span className="status-label">Ongoing</span>
          </div>
          <div className="status-item closed">
            <span className="status-count">{stats.elections.closed}</span>
            <span className="status-label">Closed</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="page-footer">
        Parallel Voting System • Real-time overview
      </div>
    </div>
  );
}