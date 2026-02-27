import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-container">
      	<aside className="sidebar">
    		<h3 className="sidebar-title">Admin Sidebar</h3>
        
			<nav className="sidebar-nav">
			<NavLink 
				to="/admin" 
				end 
				className={({ isActive }) => 
				isActive ? "sidebar-btn active" : "sidebar-btn"
				}
			>
				Dashboard
			</NavLink>

			<NavLink 
				to="/admin/users" 
				className={({ isActive }) => 
				isActive ? "sidebar-btn active" : "sidebar-btn"
				}
			>
				Users
			</NavLink>

			<NavLink 
				to="/admin/candidates" 
				className={({ isActive }) => 
				isActive ? "sidebar-btn active" : "sidebar-btn"
				}
			>
				Candidates
			</NavLink>
			</nav>
      	</aside>

      	<main className="content">
        <header className="header">
          <h1>Admin Header</h1>
        </header>
        <div className="main-content">
        	{children}
        </div>
      	</main>
    </div>
  );
}

export default AdminLayout;