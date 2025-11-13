import React, { useState, useEffect } from "react";
import { API_URL } from "./constants";

export function StudentProgress() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentProgress();
  }, []);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reports/all-students`);
      if (!response.ok) {
        throw new Error("Failed to fetch student progress");
      }
      const data = await response.json();
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching student progress:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="table-container">Loading...</div>;
  }

  if (error) {
    return <div className="table-container">Error: {error}</div>;
  }

  return (
    <div className="table-container">
      <h2>Student Progress</h2>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Total Courses</th>
              <th>Completed Courses</th>
              <th>Progress (%)</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.totalCourses}</td>
                <td>{student.completedCourses}</td>
                <td>{student.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
