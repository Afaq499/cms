import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Student.css";

export function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); // clear user session
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="studentLayout">
      <div className="sidebar">
        <ul>
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/course">Course</NavLink></li>
          <li><NavLink to="/progress">Progress</NavLink></li>
          <li><NavLink to="/fee">Fee Voucher</NavLink></li>
          <li><NavLink to="/profile">Profile</NavLink></li>
          {/* Logout as button */}
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
