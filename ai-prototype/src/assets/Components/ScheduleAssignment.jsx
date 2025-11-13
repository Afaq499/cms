import React, { useState, useEffect } from "react";
import { API_URL } from "./constants";

export function ScheduleAssignment() {
  const [formData, setFormData] = useState({
    assignmentNumber: "",
    title: "",
    courseCode: "",
    courseName: "",
    dueDate: "",
    totalMarks: 100,
    description: "",
    instructions: "",
  });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_URL}/assignments`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Combine date and time if needed, or just use date
      const assignmentData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        totalMarks: parseInt(formData.totalMarks),
      };

      const response = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to schedule assignment");
      }

      const newAssignment = await response.json();
      setSuccess("Assignment scheduled successfully!");
      setFormData({
        assignmentNumber: "",
        title: "",
        courseCode: "",
        courseName: "",
        dueDate: "",
        totalMarks: 100,
        description: "",
        instructions: "",
      });
      fetchAssignments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Schedule an Assignment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="assignmentNumber"
          placeholder="Assignment Number"
          value={formData.assignmentNumber}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="title"
          placeholder="Assignment Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="courseCode"
          placeholder="Course Code"
          value={formData.courseCode}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="courseName"
          placeholder="Course Name"
          value={formData.courseName}
          onChange={handleChange}
          required
        />
        <input
          type="datetime-local"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="totalMarks"
          placeholder="Total Marks"
          value={formData.totalMarks}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
        <textarea
          name="instructions"
          placeholder="Instructions (optional)"
          value={formData.instructions}
          onChange={handleChange}
          rows="3"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Scheduling..." : "Schedule Assignment"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: "10px" }}>{success}</div>}

      {assignments.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Scheduled Assignments</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Assignment #</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Title</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Course</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Due Date</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Marks</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment._id}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{assignment.assignmentNumber}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{assignment.title}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{assignment.courseCode}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{assignment.totalMarks}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{assignment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
