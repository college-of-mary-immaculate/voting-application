import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import TokenHandler from "./TokenHandler";
import "./AdminLayout.css";
import "../../admin-global.css";

function AdminLayout() {
  const navigate = useNavigate();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <TokenHandler>
      <div className="admin-container">
        {/* Sidebar - conditionally rendered */}
        {isSidebarVisible && (
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
                <span className="icon">🏠</span>
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <span className="icon">👥</span>
                <span>Users</span>
              </NavLink>

              <NavLink
                to="/admin/elections"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <span className="icon">🗳️</span>
                <span>Elections</span>
              </NavLink>

              <NavLink
                to="/admin/candidates"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <span className="icon">🏆</span>
                <span>Candidates</span>
              </NavLink>

              <NavLink
                to="/admin/admins"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <span className="icon">👤</span>
                <span>Admins</span>
              </NavLink>
            </nav>

            <div className="sidebar-footer">
              <div className="user-info-container">
                <small className="user-info-label">Logged in as:</small>
                <div className="user-info-name">
                  {user.fullname || user.email || 'Admin'}
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </aside>
        )}

        <div className="main-area" style={{ marginLeft: isSidebarVisible ? '240px' : '0' }}>
          <header className="top-header">
            <div className="header-left">
              <button className="menu-toggle-btn" onClick={toggleSidebar}>
                <span className="icon">☰</span>
              </button>
            </div>
            <div className="header-center">
              <div className="welcome-message">
                Welcome, {user.fullname || user.email || 'Admin'}!
              </div>
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