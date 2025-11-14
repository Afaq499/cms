import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./constants";

export function AddStudent() {
  const navigate = useNavigate();
  const [degrees, setDegrees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState({
    name: "",
    email: "",
    degree: "",
    studentId: "",
    address: "",
    contact: "",
    gender: "",
    batch: "",
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
    } catch (error) {
      console.error("Error fetching degrees:", error);
    }
  };

  const handleDegreeChange = (e) => {
    const selectedDegreeName = e.target.value;
    setStudent({ ...student, degree: selectedDegreeName, course: "" });
    
    // Load courses for selected degree
    const selectedDegree = degrees.find(d => d.name === selectedDegreeName);
    if (selectedDegree && selectedDegree.courses) {
      setCourses(selectedDegree.courses);
    } else {
      setCourses([]);
    }
  };

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/admin/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: student.name,
          email: student.email,
          password: "123456", // Default password
          degree: student.degree,
          studentId: student.studentId,
          address: student.address,
          contact: student.contact,
          gender: student.gender,
          batch: student.batch,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("New student added successfully!");
        navigate("/admin/students");
      } else {
        alert(data.error || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Student</h2>
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
          <select 
            name="course" 
            value={student.course}
            onChange={handleChange}
          >
            <option value="">Select Course (Optional)</option>
            {courses.map((course) => (
              <option key={course._id} value={course.code}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
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
          {loading ? "Adding..." : "Add Student"}
        </button>
      </form>
    </div>
  );
}
