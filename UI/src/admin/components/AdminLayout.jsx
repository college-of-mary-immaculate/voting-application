import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import TokenHandler from "./TokenHandler";
import "./AdminLayout.css";
import "../../admin-global.css";  // dalawang dots, papuntang src/

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <TokenHandler>
      {/* admin-container serves as the scoped wrapper for all admin styles */}
      <div className="admin-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Admin Panel</h3>
          </div>

          <nav className="sidebar-nav">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span className="icon">🏠</span> Dashboard
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span className="icon">👥</span> Users
            </NavLink>

            <NavLink
              to="/admin/elections"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span className="icon">🗳️</span> Elections
            </NavLink>

            <NavLink
              to="/admin/candidates"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span className="icon">🏆</span> Candidates
            </NavLink>

            <NavLink
              to="/admin/admins"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span className="icon">👤</span> Admins
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <div className="user-info" style={{ padding: '0 0 1rem 0', textAlign: 'center', borderBottom: '1px solid #334155', marginBottom: '1rem' }}>
              <small style={{ color: '#94a3b8' }}>Logged in as:</small>
              <div style={{ color: 'white', fontWeight: 500 }}>{user.fullname || user.email || 'Admin'}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <div className="main-area">
          <header className="top-header">
            <div className="header-center">
              <span className="user-info" style={{ color: '#1e293b', fontWeight: 500 }}>
                Welcome, {user.fullname || user.email || 'Admin'}!
              </span>
            </div>
          </header>

          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </TokenHandler>
  );
}

export default AdminLayout;