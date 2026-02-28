import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Admin Panel</h3>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="icon">🏠</span> Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="icon">👥</span> Users
          </NavLink>

          <NavLink
            to="/admin/candidates"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="icon">🏆</span> Candidates
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn">Logout</button>
        </div>
      </aside>

      <div className="main-area">
        <header className="top-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="header-right">
            <span className="user-info">Admin User</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;