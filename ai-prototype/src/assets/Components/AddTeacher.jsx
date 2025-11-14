import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./constants";

export function AddTeacher() {
  const navigate = useNavigate();
  const [degrees, setDegrees] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
    contact: "",
    course: "",
  });

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      const response = await fetch(`${API_URL}/degrees`);
      const data = await response.json();
      setDegrees(data.degrees || []);
      
      // Collect all courses from all degrees
      const courses = [];
      data.degrees?.forEach(degree => {
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
    } catch (error) {
      console.error("Error fetching degrees:", error);
    }
  };

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/admin/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teacher.name,
          email: teacher.email,
          password: teacher.password,
          subject: teacher.subject || teacher.course,
          contact: teacher.contact,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("New teacher added successfully!");
        navigate("/admin/teachers");
      } else {
        alert(data.error || "Failed to add teacher");
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      alert("Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Teacher</h2>
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
        <input 
          name="password" 
          type="password"
          placeholder="Password" 
          value={teacher.password}
          onChange={handleChange} 
          required
          minLength={6}
        />
        {allCourses.length > 0 && (
          <select 
            name="course" 
            value={teacher.course}
            onChange={handleChange}
          >
            <option value="">Select Course (Optional)</option>
            {allCourses.map((course, index) => (
              <option key={course._id || index} value={course.code}>
                {course.code} - {course.title} ({course.degreeCode})
              </option>
            ))}
          </select>
        )}
        <input 
          name="subject" 
          placeholder="Subject (or will use selected course)" 
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
          {loading ? "Adding..." : "Add Teacher"}
        </button>
      </form>
    </div>
  );
}
