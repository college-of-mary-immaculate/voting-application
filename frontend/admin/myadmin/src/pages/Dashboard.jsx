import React from 'react';
import './Dashboard.css';

export default function Dashboard() {
  const turnout = 68; // sample value

  return (
    <div className="dashboard-container space-y-8">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Overview • {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Voters</div>
          <div className="stat-value">1,250</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Votes Cast</div>
          <div className="stat-value green">820</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Turnout</div>
          <div className="stat-value blue">{turnout}%</div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${turnout}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Elections</div>
          <div className="stat-value indigo">2</div>
        </div>
      </div>

      {/* Main content */}
      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Elections</h3>
          </div>
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-title">No active elections yet</div>
              <div className="empty-state-text">
                Create your first election to start collecting votes
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Voting Activity</h3>
          </div>
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-title">Chart coming soon</div>
              <div className="empty-state-text">
                Votes over time will appear here once data is available
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        Parallel • Voting System • 2026
      </div>
    </div>
  );
}