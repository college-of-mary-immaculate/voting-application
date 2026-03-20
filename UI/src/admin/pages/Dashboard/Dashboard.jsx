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

        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const data = await API.get('/dashboard/stats');
        
        if (data.status === 'success') {
          setStats(data.data);
        } else {
          throw new Error(data.error || 'Failed to load stats');
        }
      } catch (err) {
        console.error('Dashboard error:', err);
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

  // Calculate voters who participated
  const votersParticipated = Math.round(stats.total_voters * stats.turnout_percentage / 100);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Overview of your voting system
        </p>
      </div>

      {/* Stats Grid - Removed the Turnout Card */}
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
      </div>

      {/* Voter Turnout Section with Progress Bar */}
      <div className="turnout-section">
        <div className="turnout-header">
          <h3 className="turnout-title">Voter Turnout</h3>
          <div className="turnout-percentage">{stats.turnout_percentage}%</div>
        </div>
        <div className="turnout-bar-container">
          <div 
            className="turnout-bar" 
            style={{ width: `${stats.turnout_percentage}%` }}
          ></div>
        </div>
        <div className="turnout-stats">
          <div className="turnout-stat">
            <span className="stat-number">{votersParticipated}</span>
            <span className="stat-text">Voters Participated</span>
          </div>
          <div className="turnout-stat">
            <span className="stat-number">{stats.total_voters}</span>
            <span className="stat-text">Total Registered</span>
          </div>
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