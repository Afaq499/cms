import React, { useState } from "react";
import { API_URL } from "./constants";

export function GenerateReport() {
  const [studentId, setStudentId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError("Please enter a student ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/reports/student/${studentId}`);
      if (!response.ok) {
        throw new Error("Failed to generate report");
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Generate Student Report</h2>
      <form onSubmit={handleGenerateReport}>
        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

      {report && (
        <div style={{ marginTop: "20px" }}>
          <h3>Student Report</h3>
          <div style={{ marginBottom: "20px" }}>
            <h4>Student Information</h4>
            <p><strong>Name:</strong> {report.student.name}</p>
            <p><strong>Email:</strong> {report.student.email}</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4>Progress Summary</h4>
            <p><strong>Total Courses:</strong> {report.progress.totalCourses}</p>
            <p><strong>Completed Courses:</strong> {report.progress.completedCourses}</p>
            <p><strong>In Progress Courses:</strong> {report.progress.inProgressCourses}</p>
            <p><strong>Dropped Courses:</strong> {report.progress.droppedCourses}</p>
            <p><strong>Average Grade:</strong> {report.progress.averageGrade}</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4>Course Details</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Course Code</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Course Title</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Assignments</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Quizzes</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Midterm</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Final</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Grade</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.progress.courses.map((course, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.courseCode}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.courseTitle}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.assignments}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.quizzes}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.midterm}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.final}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.overallGrade}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4>Assignment Summary</h4>
            <p><strong>Total Assignments:</strong> {report.assignments.total}</p>
            <p><strong>Submitted:</strong> {report.assignments.submitted}</p>
            <p><strong>Pending:</strong> {report.assignments.pending}</p>
          </div>

          <p><small>Report generated at: {new Date(report.generatedAt).toLocaleString()}</small></p>
        </div>
      )}
    </div>
  );
}
