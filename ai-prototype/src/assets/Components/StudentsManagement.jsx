import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "./constants";

export function StudentsManagement() {
  const { id } = useParams(); // For edit mode
  const navigate = useNavigate();
  const [view, setView] = useState(id ? "edit" : "list"); // list, add, edit
  const [students, setStudents] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]); // Array of course codes
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [student, setStudent] = useState({
    name: "",
    email: "",
    degree: "",
    studentId: "",
    address: "",
    contact: "",
    gender: "",
    batch: "",
  });

  useEffect(() => {
    if (id) {
      setView("edit");
      fetchDegrees().then(() => {
        fetchStudent(id);
      });
    } else if (view === "list") {
      fetchStudents();
    } else if (view === "add") {
      fetchDegrees();
    }
  }, [id]);

  useEffect(() => {
    if (view === "list") {
      fetchStudents();
    } else if (view === "add") {
      fetchDegrees();
      setSelectedCourses([]); // Reset selected courses when adding new student
      setStudent({
        name: "",
        email: "",
        degree: "",
        studentId: "",
        address: "",
        contact: "",
        gender: "",
        batch: "",
      });
    }
  }, [view]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/students`);
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchStudent = async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/admin/students/${studentId}`);
      const data = await response.json();
      if (data.student) {
        setStudent({
          name: data.student.name || "",
          email: data.student.email || "",
          degree: data.student.degree || "",
          studentId: data.student.studentId || "",
          address: data.student.address || "",
          contact: data.student.contact || "",
          gender: data.student.gender || "",
          batch: data.student.batch || "",
        });
        
        // Load courses for the student's degree (use current degrees state or fetch again)
        const currentDegrees = degrees.length > 0 ? degrees : await fetchDegrees();
        if (data.student.degree) {
          const selectedDegree = currentDegrees.find(d => d.name === data.student.degree);
          if (selectedDegree && selectedDegree.courses) {
            setCourses(selectedDegree.courses);
          }
        }
        
        // Fetch existing assigned courses (Progress records)
        const progressResponse = await fetch(`${API_URL}/progress/student/${studentId}`);
        const progressData = await progressResponse.json();
        if (progressData && Array.isArray(progressData)) {
          const assignedCourseCodes = progressData.map(p => p.courseCode);
          setSelectedCourses(assignedCourseCodes);
        }
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      alert("Failed to fetch student data");
    }
  };

  const fetchDegrees = async () => {
    try {
      const response = await fetch(`${API_URL}/degrees`);
      const data = await response.json();
      const degreesList = data.degrees || [];
      setDegrees(degreesList);
      return degreesList; // Return for use in fetchStudent
    } catch (error) {
      console.error("Error fetching degrees:", error);
      return [];
    }
  };

  const handleDegreeChange = (e) => {
    const selectedDegreeName = e.target.value;
    setStudent({ ...student, degree: selectedDegreeName });
    
    const selectedDegree = degrees.find(d => d.name === selectedDegreeName);
    if (selectedDegree && selectedDegree.courses) {
      setCourses(selectedDegree.courses);
      // Reset selected courses when degree changes
      setSelectedCourses([]);
    } else {
      setCourses([]);
      setSelectedCourses([]);
    }
  };

  const handleCourseToggle = (courseCode) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseCode)) {
        return prev.filter(code => code !== courseCode);
      } else {
        return [...prev, courseCode];
      }
    });
  };

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = view === "edit" 
        ? `${API_URL}/admin/students/${id}`
        : `${API_URL}/admin/students`;
      
      const method = view === "edit" ? "PUT" : "POST";
      
      const body = view === "edit" 
        ? {
            name: student.name,
            email: student.email,
            degree: student.degree,
            studentId: student.studentId,
            address: student.address,
            contact: student.contact,
            gender: student.gender,
            batch: student.batch,
            courses: selectedCourses, // Send selected courses array
          }
        : {
            name: student.name,
            email: student.email,
            password: "123456",
            degree: student.degree,
            studentId: student.studentId,
            address: student.address,
            contact: student.contact,
            gender: student.gender,
            batch: student.batch,
            courses: selectedCourses, // Send selected courses array
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Student ${view === "edit" ? "updated" : "added"} successfully!`);
        navigate("/admin/students");
      } else {
        alert(data.error || `Failed to ${view === "edit" ? "update" : "add"} student`);
      }
    } catch (error) {
      console.error(`Error ${view === "edit" ? "updating" : "adding"} student:`, error);
      alert(`Failed to ${view === "edit" ? "update" : "add"} student`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(`${API_URL}/admin/students/${studentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Student deleted successfully!");
        fetchStudents();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === "add" || view === "edit") {
    return (
      <div className="form-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>{view === "edit" ? "Edit Student" : "Add New Student"}</h2>
          <button onClick={() => setView("list")} style={{ padding: "8px 16px", backgroundColor: "#95a5a6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Back to List
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input 
            name="name" 
            placeholder="Student Name" 
            value={student.name}
            onChange={handleChange} 
            required
          />
          <input 
            name="email" 
            type="email"
            placeholder="Email" 
            value={student.email}
            onChange={handleChange} 
            required
          />
          <select 
            name="degree" 
            value={student.degree}
            onChange={handleDegreeChange}
            required
          >
            <option value="">Select Degree</option>
            {degrees.map((degree) => (
              <option key={degree._id} value={degree.name}>
                {degree.name} ({degree.code})
              </option>
            ))}
          </select>
          {courses.length > 0 && (
            <div style={{ marginTop: "10px", marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                Select Courses (Multiple selection):
              </label>
              <div style={{ 
                border: "1px solid #ccc", 
                borderRadius: "4px", 
                padding: "10px", 
                maxHeight: "200px", 
                overflowY: "auto",
                backgroundColor: "#f9f9f9"
              }}>
                {courses.map((course) => (
                  <label 
                    key={course._id} 
                    style={{ 
                      display: "block", 
                      padding: "8px",
                      cursor: "pointer",
                      backgroundColor: selectedCourses.includes(course.code) ? "#e3f2fd" : "transparent",
                      borderRadius: "4px",
                      marginBottom: "5px"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.code)}
                      onChange={() => handleCourseToggle(course.code)}
                      style={{ marginRight: "10px" }}
                    />
                    <span>
                      {course.code} - {course.title} 
                      <span style={{ color: "#666", fontSize: "12px", marginLeft: "10px" }}>
                        ({course.type}, {course.creditHours} credits, Semester {course.semester})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {selectedCourses.length > 0 && (
                <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                  {selectedCourses.length} course(s) selected
                </p>
              )}
            </div>
          )}
          <input 
            name="studentId" 
            placeholder="Student ID" 
            value={student.studentId}
            onChange={handleChange} 
            required
          />
          <input 
            name="address" 
            placeholder="Address" 
            value={student.address}
            onChange={handleChange} 
          />
          <input 
            name="contact" 
            placeholder="Contact" 
            value={student.contact}
            onChange={handleChange} 
          />
          <select 
            name="gender" 
            value={student.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input 
            name="batch" 
            placeholder="Batch (e.g., 2024)" 
            value={student.batch}
            onChange={handleChange} 
          />
          <button type="submit" disabled={loading}>
            {loading ? (view === "edit" ? "Updating..." : "Adding...") : (view === "edit" ? "Update Student" : "Add Student")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>All Students</h2>
        <button 
          onClick={() => setView("add")} 
          style={{ padding: "10px 20px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Add New Student
        </button>
      </div>
      
      <input
        type="text"
        className="search-bar"
        placeholder="Search by name, ID, or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "20px" }}
      />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Degree</th>
              <th>Student ID</th>
              <th>Batch</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  {searchTerm ? "No students found matching your search." : "No students found."}
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.degree}</td>
                  <td>{s.studentId}</td>
                  <td>{s.batch}</td>
                  <td>{s.gender}</td>
                  <td>
                    <button onClick={() => navigate(`/admin/students/${s._id}`)} className="edit-btn">
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(s._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

