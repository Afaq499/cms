import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidbar";
import "./Progress.css";
import { API_URL } from "./constants";

export function Progress() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/progress`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }
      const data = await response.json();
      setProgressData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatGrade = (grade) => {
    return grade === 0 ? "Pending" : `${grade}%`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "In Progress":
        return "status-in-progress";
      case "Dropped":
        return "status-dropped";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="progressPage">
          <div className="progressHeader">
            <h2>Student Progress Report</h2>
            <p>Loading progress data...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="progressPage">
          <div className="progressHeader">
            <h2>Student Progress Report</h2>
            <p style={{ color: 'red' }}>Error: {error}</p>
            <button onClick={fetchProgressData} style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="progressPage">
        {/* Progress Header */}
        <div className="progressHeader">
          <h2>Student Progress Report</h2>
          <p>Degree: BS Information Technology | Session: Spring 2022</p>
        </div>

        {/* Student Progress Table */}
        <div className="progressTableSection">
          <h3 className="sectionTitle">Course Progress</h3>
          <table className="progressTable">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Assignments</th>
                <th>Quizzes</th>
                <th>Midterm</th>
                <th>Final</th>
                <th>Overall Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((course, index) => (
                <tr key={index}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseTitle}</td>
                  <td>{formatGrade(course.assignments)}</td>
                  <td>{formatGrade(course.quizzes)}</td>
                  <td>{formatGrade(course.midterm)}</td>
                  <td>{formatGrade(course.final)}</td>
                  <td>{course.overallGrade}</td>
                  <td className={getStatusClass(course.status)}>
                    {course.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
