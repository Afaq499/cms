import React from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import "./admin.css";
import { AddStudent } from "./AddStudent";
import { AddTeacher } from "./AddTeacher";
import { StudentList } from "./StudentList";
import { TeacherList } from "./TeacherList";
import { EditStudent } from "./EditStudent";
import { EditTeacher } from "./EditTeacher";

export function Admin() {
  const navigate = useNavigate();

   const handleLogout = () => {
    localStorage.removeItem("user"); 
    navigate("/login"); 
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li>
            <NavLink to="/admin/add-student">Add New Student</NavLink>
          </li>
          <li>
            <NavLink to="/admin/add-teacher">Add New Teacher</NavLink>
          </li>
          <li>
            <NavLink to="/admin/students">All Students</NavLink>
          </li>
          <li>
            <NavLink to="/admin/teachers">All Teachers</NavLink>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <h1>Welcome, Admin</h1>

        <div className="summary-section">
          <div className="summary-card">Total Students: 200</div>
          <div className="summary-card">Total Teachers: 25</div>
          <div className="summary-card">Total Courses: 15</div>
        </div>

        <input
          type="text"
          className="search-bar"
          placeholder="Search by name or ID..."
        />

        {/* Nested Routes */}
        <div className="content-area">
          <Routes>
            <Route index element={<div>Select an option from the sidebar.</div>} />
            <Route path="add-student" element={<AddStudent />} />
            <Route path="add-teacher" element={<AddTeacher />} />
            <Route path="students" element={<StudentList />} />
            <Route path="teachers" element={<TeacherList />} />
            <Route path="edit-student/:id" element={<EditStudent />} />
            <Route path="edit-teacher/:id" element={<EditTeacher />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
