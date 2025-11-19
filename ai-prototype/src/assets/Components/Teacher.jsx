import React, { useState, useEffect } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import "./Teacher.css";
import { StudentProgress } from "./StudentProgress";
import { GenerateReport } from "./GenerateReport";
import { ScheduleQuiz } from "./ScheduleQuiz";
import { ScheduleAssignment } from "./ScheduleAssignment";
import { StudentGdb } from "./StudentGdb";
import { LectureVideos } from "./LectureVideos";
import { API_URL } from "./constants";

export function Teacher() {
   const navigate = useNavigate();
   const [stats, setStats] = useState({
     totalStudents: 0,
     quizzesScheduled: 0,
     assignmentsPending: 0,
   });
   const [loading, setLoading] = useState(true);
   const [courses, setCourses] = useState([]);

   useEffect(() => {
     fetchDashboardStats();
     fetchCourses();
   }, []);

   const fetchCourses = async () => {
     try {
       // Try fetching from courses endpoint first
       const response = await fetch(`${API_URL}/courses`);
       if (response.ok) {
         const data = await response.json();
         if (Array.isArray(data) && data.length > 0) {
           setCourses(data);
           return;
         }
       }
       
       // If courses endpoint doesn't return data, fetch from degrees
       const degreesResponse = await fetch(`${API_URL}/degrees`);
       if (degreesResponse.ok) {
         const degreesData = await degreesResponse.json();
         const degreesList = degreesData.degrees || [];
         
         // Collect all courses from all degrees
         const allCourses = [];
         degreesList.forEach(degree => {
           if (degree.courses && Array.isArray(degree.courses)) {
             degree.courses.forEach(course => {
               // Avoid duplicates by checking if course with same code already exists
               if (!allCourses.find(c => c.code === course.code)) {
                 allCourses.push(course);
               }
             });
           }
         });
         setCourses(allCourses);
       }
     } catch (error) {
       console.error("Error fetching courses:", error);
     }
   };

   const fetchDashboardStats = async () => {
     try {
       setLoading(true);
       const response = await fetch(`${API_URL}/reports/dashboard-stats`);
       if (!response.ok) {
         throw new Error("Failed to fetch dashboard statistics");
       }
       const data = await response.json();
       setStats(data);
     } catch (error) {
       console.error("Error fetching dashboard stats:", error);
       // Keep default values (0) on error
     } finally {
       setLoading(false);
     }
   };

   const handleLogout = () => {
    localStorage.removeItem("user"); 
    navigate("/login"); 
  };

  return (
    <div className="teacher-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Teacher Dashboard</h2>
        <ul>
          <li>
            <NavLink to="/teacher/progress">Student Progress</NavLink>
          </li>
          <li>
            <NavLink to="/teacher/report">Generate Report</NavLink>
          </li>
          <li>
            <NavLink to="/teacher/quiz">Schedule Quiz</NavLink>
          </li>
          <li>
            <NavLink to="/teacher/assignment">Schedule Assignment</NavLink>
          </li>
          {/* <li>
            <NavLink to="/teacher/StudentGdb">GDB</NavLink>
          </li> */}
          <li>
            <NavLink to="/teacher/videos">Lecture Videos</NavLink>
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
        <h1>Welcome, Teacher</h1>

        <div className="summary-section">
          <div className="summary-card">
            {loading ? "Loading..." : `Total Students: ${stats.totalStudents}`}
          </div>
          <div className="summary-card">
            {loading ? "Loading..." : `Quizzes Scheduled: ${stats.quizzesScheduled}`}
          </div>
          <div className="summary-card">
            {loading ? "Loading..." : `Assignments Pending: ${stats.assignmentsPending}`}
          </div>
        </div>

        {/* Nested Routes */}
        <div className="content-area">
          <Routes>
            <Route index element={<div>Select an option from the sidebar.</div>} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="report" element={<GenerateReport />} />
            <Route path="quiz" element={<ScheduleQuiz />} />
            <Route path="assignment" element={<ScheduleAssignment />} />
            {/* <Route path="StudentGdb" element={<StudentGdb />} /> */}
            <Route path="videos" element={<LectureVideos courses={courses} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
