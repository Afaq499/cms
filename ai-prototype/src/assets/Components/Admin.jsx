import React, { useState, useEffect } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import "./admin.css";
import { StudentsManagement } from "./StudentsManagement";
import { TeachersManagement } from "./TeachersManagement";
import { ManageDegrees } from "./ManageDegrees";
import { API_URL } from "./constants";

export function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch students count
      const studentsRes = await fetch(`${API_URL}/admin/students`);
      const studentsData = await studentsRes.json();
      
      // Fetch teachers count
      const teachersRes = await fetch(`${API_URL}/admin/teachers`);
      const teachersData = await teachersRes.json();
      
      // Fetch degrees and count total courses
      const degreesRes = await fetch(`${API_URL}/degrees`);
      const degreesData = await degreesRes.json();
      
      let totalCourses = 0;
      if (degreesData.degrees) {
        degreesData.degrees.forEach(degree => {
          if (degree.courses) {
            totalCourses += degree.courses.length;
          }
        });
      }

      setStats({
        students: studentsData.count || studentsData.students?.length || 0,
        teachers: teachersData.count || teachersData.teachers?.length || 0,
        courses: totalCourses,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

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
            <NavLink to="/admin/degrees">Manage Degrees & Courses</NavLink>
          </li>
          <li>
            <NavLink to="/admin/students">Manage Students</NavLink>
          </li>
          <li>
            <NavLink to="/admin/teachers">Manage Teachers</NavLink>
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
          <div className="summary-card">Total Students: {stats.students}</div>
          <div className="summary-card">Total Teachers: {stats.teachers}</div>
          <div className="summary-card">Total Courses: {stats.courses}</div>
        </div>

        {/* Nested Routes */}
        <div className="content-area">
          <Routes>
            <Route index element={<div>Select an option from the sidebar.</div>} />
            <Route path="degrees" element={<ManageDegrees />} />
            <Route path="students" element={<StudentsManagement />} />
            <Route path="students/:id" element={<StudentsManagement />} />
            <Route path="teachers" element={<TeachersManagement />} />
            <Route path="teachers/:id" element={<TeachersManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
