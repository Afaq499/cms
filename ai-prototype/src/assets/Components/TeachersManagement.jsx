import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "./constants";

export function TeachersManagement() {
  const { id } = useParams(); // For edit mode
  const navigate = useNavigate();
  const [view, setView] = useState(id ? "edit" : "list"); // list, add, edit
  const [teachers, setTeachers] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]); // Array of course codes
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [teacher, setTeacher] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
    contact: "",
  });

  useEffect(() => {
    if (id) {
      setView("edit");
      fetchDegrees().then(() => {
        fetchTeacher(id);
      });
    } else if (view === "list") {
      fetchTeachers();
    } else if (view === "add") {
      fetchDegrees();
    }
  }, [id]);

  useEffect(() => {
    if (view === "list") {
      fetchTeachers();
    } else if (view === "add") {
      fetchDegrees();
      setSelectedCourses([]); // Reset selected courses when adding new teacher
      setTeacher({
        name: "",
        email: "",
        password: "",
        subject: "",
        contact: "",
      });
    }
  }, [view]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/teachers`);
      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchTeacher = async (teacherId) => {
    try {
      const response = await fetch(`${API_URL}/admin/teachers/${teacherId}`);
      const data = await response.json();
      if (data.teacher) {
        setTeacher({
          name: data.teacher.name || "",
          email: data.teacher.email || "",
          password: "",
          subject: data.teacher.subject || "",
          contact: data.teacher.contact || "",
        });
        // Set selected courses from teacher's courses array
        if (data.teacher.courses && Array.isArray(data.teacher.courses)) {
          setSelectedCourses(data.teacher.courses);
        } else {
          setSelectedCourses([]);
        }
      }
    } catch (error) {
      console.error("Error fetching teacher:", error);
      alert("Failed to fetch teacher data");
    }
  };

  const fetchDegrees = async () => {
    try {
      const response = await fetch(`${API_URL}/degrees`);
      const data = await response.json();
      const degreesList = data.degrees || [];
      setDegrees(degreesList);
      
      // Collect all courses from all degrees
      const courses = [];
      degreesList.forEach(degree => {
        if (degree.courses && degree.courses.length > 0) {
          degree.courses.forEach(course => {
            courses.push({
              ...course,
              degreeName: degree.name,
              degreeCode: degree.code,
            });
          });
        }
      });
      setAllCourses(courses);
      return degreesList; // Return for use in fetchTeacher
    } catch (error) {
      console.error("Error fetching degrees:", error);
      return [];
    }
  };

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = view === "edit" 
        ? `${API_URL}/admin/teachers/${id}`
        : `${API_URL}/admin/teachers`;
      
      const method = view === "edit" ? "PUT" : "POST";
      
      const body = view === "edit" 
        ? {
            name: teacher.name,
            email: teacher.email,
            subject: teacher.subject,
            contact: teacher.contact,
            courses: selectedCourses, // Send selected courses array
          }
        : {
            name: teacher.name,
            email: teacher.email,
            password: teacher.password || "123456",
            subject: teacher.subject,
            contact: teacher.contact,
            courses: selectedCourses, // Send selected courses array
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Teacher ${view === "edit" ? "updated" : "added"} successfully!`);
        navigate("/admin/teachers");
      } else {
        alert(data.error || `Failed to ${view === "edit" ? "update" : "add"} teacher`);
      }
    } catch (error) {
      console.error(`Error ${view === "edit" ? "updating" : "adding"} teacher:`, error);
      alert(`Failed to ${view === "edit" ? "update" : "add"} teacher`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    try {
      const response = await fetch(`${API_URL}/admin/teachers/${teacherId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Teacher deleted successfully!");
        fetchTeachers();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete teacher");
      }
    } catch (error) {
      console.error("Error deleting teacher:", error);
      alert("Failed to delete teacher");
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === "add" || view === "edit") {
    return (
      <div className="form-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>{view === "edit" ? "Edit Teacher" : "Add New Teacher"}</h2>
          <button onClick={() => setView("list")} style={{ padding: "8px 16px", backgroundColor: "#95a5a6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Back to List
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input 
            name="name" 
            placeholder="Full Name" 
            value={teacher.name}
            onChange={handleChange} 
            required
          />
          <input 
            name="email" 
            type="email"
            placeholder="Email" 
            value={teacher.email}
            onChange={handleChange} 
            required
          />
          {view === "add" && (
            <input 
              name="password" 
              type="password"
              placeholder="Password (default: 123456)" 
              value={teacher.password}
              onChange={handleChange} 
              minLength={6}
            />
          )}
          {allCourses.length > 0 && (
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
                {allCourses.map((course, index) => (
                  <label 
                    key={course._id || index} 
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
                        ({course.degreeCode}, {course.type}, {course.creditHours} credits, Semester {course.semester})
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
            name="subject" 
            placeholder="Subject (Optional)" 
            value={teacher.subject}
            onChange={handleChange} 
          />
          <input 
            name="contact" 
            placeholder="Contact" 
            value={teacher.contact}
            onChange={handleChange} 
          />
          <button type="submit" disabled={loading}>
            {loading ? (view === "edit" ? "Updating..." : "Adding...") : (view === "edit" ? "Update Teacher" : "Add Teacher")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>All Teachers</h2>
        <button 
          onClick={() => setView("add")} 
          style={{ padding: "10px 20px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Add New Teacher
        </button>
      </div>
      
      <input
        type="text"
        className="search-bar"
        placeholder="Search by name, email, or subject..."
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
              <th>Subject</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  {searchTerm ? "No teachers found matching your search." : "No teachers found."}
                </td>
              </tr>
            ) : (
              filteredTeachers.map((t) => (
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.subject}</td>
                  <td>{t.contact}</td>
                  <td>
                    <button onClick={() => navigate(`/admin/teachers/${t._id}`)} className="edit-btn">
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(t._id)}>
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

