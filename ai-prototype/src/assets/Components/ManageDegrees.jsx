import React, { useState, useEffect } from "react";
import { API_URL } from "./constants";

export function ManageDegrees() {
  const [degrees, setDegrees] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [showAddDegree, setShowAddDegree] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [degreeForm, setDegreeForm] = useState({
    name: "",
    code: "",
    description: "",
    duration: 4,
  });

  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    type: "Required",
    creditHours: 3,
    semester: 1,
    group: "",
  });

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      const response = await fetch(`${API_URL}/degrees`);
      const data = await response.json();
      setDegrees(data.degrees || []);
    } catch (error) {
      console.error("Error fetching degrees:", error);
      alert("Failed to fetch degrees");
    }
  };

  const handleAddDegree = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/degrees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(degreeForm),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Degree added successfully!");
        setDegreeForm({ name: "", code: "", description: "", duration: 4 });
        setShowAddDegree(false);
        fetchDegrees();
      } else {
        alert(data.error || "Failed to add degree");
      }
    } catch (error) {
      console.error("Error adding degree:", error);
      alert("Failed to add degree");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!selectedDegree) {
      alert("Please select a degree first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/degrees/${selectedDegree._id}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Course added successfully!");
        setCourseForm({ code: "", title: "", type: "Required", creditHours: 3, semester: 1, group: "" });
        setShowAddCourse(false);
        fetchDegrees();
        // Update selected degree
        const updatedDegree = degrees.find(d => d._id === selectedDegree._id);
        if (updatedDegree) {
          setSelectedDegree(data.degree);
        }
      } else {
        alert(data.error || "Failed to add course");
      }
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDegree = async (id) => {
    if (!window.confirm("Are you sure you want to delete this degree?")) return;

    try {
      const response = await fetch(`${API_URL}/degrees/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Degree deleted successfully!");
        fetchDegrees();
        if (selectedDegree?._id === id) {
          setSelectedDegree(null);
        }
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete degree");
      }
    } catch (error) {
      console.error("Error deleting degree:", error);
      alert("Failed to delete degree");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    if (!selectedDegree) return;

    try {
      const response = await fetch(`${API_URL}/degrees/${selectedDegree._id}/courses/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Course deleted successfully!");
        fetchDegrees();
        // Refresh selected degree
        const updatedResponse = await fetch(`${API_URL}/degrees/${selectedDegree._id}`);
        const updatedData = await updatedResponse.json();
        if (updatedData.degree) {
          setSelectedDegree(updatedData.degree);
        }
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Manage Degrees & Courses</h2>
        <button 
          onClick={() => setShowAddDegree(true)} 
          style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Add New Degree
        </button>
      </div>

      {/* Add Degree Form */}
      {showAddDegree && (
        <div style={{ border: "1px solid #ddd", padding: "20px", marginBottom: "20px", borderRadius: "4px" }}>
          <h3>Add New Degree</h3>
          <form onSubmit={handleAddDegree}>
            <input
              type="text"
              placeholder="Degree Name (e.g., Bachelor of Science in Information Technology)"
              value={degreeForm.name}
              onChange={(e) => setDegreeForm({ ...degreeForm, name: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <input
              type="text"
              placeholder="Degree Code (e.g., BSIT)"
              value={degreeForm.code}
              onChange={(e) => setDegreeForm({ ...degreeForm, code: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <textarea
              placeholder="Description (optional)"
              value={degreeForm.description}
              onChange={(e) => setDegreeForm({ ...degreeForm, description: e.target.value })}
              style={{ width: "100%", padding: "8px", marginBottom: "10px", minHeight: "60px" }}
            />
            <input
              type="number"
              placeholder="Duration (years)"
              value={degreeForm.duration}
              onChange={(e) => setDegreeForm({ ...degreeForm, duration: parseInt(e.target.value) || 4 })}
              min="1"
              max="10"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <div>
              <button type="submit" disabled={loading} style={{ padding: "10px 20px", marginRight: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Add Degree
              </button>
              <button type="button" onClick={() => { setShowAddDegree(false); setDegreeForm({ name: "", code: "", description: "", duration: 4 }); }} style={{ padding: "10px 20px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Degrees List */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>
        <div>
          <h3>Degrees</h3>
          <div style={{ border: "1px solid #ddd", borderRadius: "4px", maxHeight: "500px", overflowY: "auto" }}>
            {degrees.length === 0 ? (
              <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>No degrees found</p>
            ) : (
              degrees.map((degree) => (
                <div
                  key={degree._id}
                  onClick={() => setSelectedDegree(degree)}
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    backgroundColor: selectedDegree?._id === degree._id ? "#e3f2fd" : "white",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{degree.name}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{degree.code}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{degree.courses?.length || 0} courses</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDegree(degree._id);
                    }}
                    style={{ marginTop: "5px", padding: "5px 10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Courses for Selected Degree */}
        <div>
          {selectedDegree ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3>Courses in {selectedDegree.name} ({selectedDegree.code})</h3>
                <button
                  onClick={() => setShowAddCourse(true)}
                  style={{ padding: "10px 20px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Add Course
                </button>
              </div>

              {/* Add Course Form */}
              {showAddCourse && (
                <div style={{ border: "1px solid #ddd", padding: "20px", marginBottom: "20px", borderRadius: "4px" }}>
                  <h4>Add New Course</h4>
                  <form onSubmit={handleAddCourse}>
                    <input
                      type="text"
                      placeholder="Course Code (e.g., CS101)"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                    />
                    <input
                      type="text"
                      placeholder="Course Title"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                    />
                    <select
                      value={courseForm.type}
                      onChange={(e) => setCourseForm({ ...courseForm, type: e.target.value })}
                      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                    >
                      <option value="Required">Required</option>
                      <option value="Elective">Elective</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Credit Hours"
                      value={courseForm.creditHours}
                      onChange={(e) => setCourseForm({ ...courseForm, creditHours: parseInt(e.target.value) || 3 })}
                      min="1"
                      max="6"
                      required
                      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                    />
                    <input
                      type="number"
                      placeholder="Semester"
                      value={courseForm.semester}
                      onChange={(e) => setCourseForm({ ...courseForm, semester: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="12"
                      required
                      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                    />
                    <input
                      type="text"
                      placeholder="Group (optional)"
                      value={courseForm.group}
                      onChange={(e) => setCourseForm({ ...courseForm, group: e.target.value })}
                      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                    />
                    <div>
                      <button type="submit" disabled={loading} style={{ padding: "10px 20px", marginRight: "10px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Add Course
                      </button>
                      <button type="button" onClick={() => { setShowAddCourse(false); setCourseForm({ code: "", title: "", type: "Required", creditHours: 3, semester: 1, group: "" }); }} style={{ padding: "10px 20px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Courses Table */}
              {selectedDegree.courses && selectedDegree.courses.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Code</th>
                      <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Title</th>
                      <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Type</th>
                      <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Credits</th>
                      <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Semester</th>
                      <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDegree.courses
                      .sort((a, b) => a.semester - b.semester || a.code.localeCompare(b.code))
                      .map((course) => (
                        <tr key={course._id}>
                          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{course.code}</td>
                          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{course.title}</td>
                          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{course.type}</td>
                          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{course.creditHours}</td>
                          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{course.semester}</td>
                          <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              style={{ padding: "5px 10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>No courses in this degree. Add a course to get started.</p>
              )}
            </>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
              <p>Select a degree from the list to view and manage its courses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

