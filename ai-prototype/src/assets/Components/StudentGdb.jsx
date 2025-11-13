import React, { useState, useEffect } from "react";
import { API_URL } from "./constants";

export function StudentGdb() {
  const [formData, setFormData] = useState({
    title: "",
    topic: "",
    courseCode: "",
    courseName: "",
    dueDate: "",
    description: "",
  });
  const [gdbs, setGdbs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchGdbs();
  }, []);

  const fetchGdbs = async () => {
    try {
      const response = await fetch(`${API_URL}/gdbs`);
      if (response.ok) {
        const data = await response.json();
        setGdbs(data);
      }
    } catch (err) {
      console.error("Error fetching GDBs:", err);
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
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user._id) {
        throw new Error("User not logged in");
      }

      const gdbData = {
        ...formData,
        createdBy: user._id,
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      const response = await fetch(`${API_URL}/gdbs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gdbData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create GDB");
      }

      const newGdb = await response.json();
      setSuccess("GDB posted successfully!");
      setFormData({
        title: "",
        topic: "",
        courseCode: "",
        courseName: "",
        dueDate: "",
        description: "",
      });
      fetchGdbs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>GDB Discussion</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="GDB Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="topic"
          placeholder="Discussion Topic"
          value={formData.topic}
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
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Enter your discussion topic here..."
          rows="5"
          value={formData.description}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: "10px" }}>{success}</div>}

      {gdbs.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Posted GDBs</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px" }}>
            {gdbs.map((gdb) => (
              <div
                key={gdb._id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "5px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h4>{gdb.title}</h4>
                <p><strong>Topic:</strong> {gdb.topic}</p>
                <p><strong>Course:</strong> {gdb.courseCode} - {gdb.courseName}</p>
                <p><strong>Due Date:</strong> {new Date(gdb.dueDate).toLocaleDateString()}</p>
                {gdb.description && <p><strong>Description:</strong> {gdb.description}</p>}
                <p><strong>Status:</strong> {gdb.status}</p>
                <p><small>Created: {new Date(gdb.createdAt).toLocaleString()}</small></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
