import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock student data (In real app, fetch from backend)
  const [student, setStudent] = useState({
    name: "",
    degree: "",
    studentId: "",
    address: "",
    contact: "",
    gender: "",
    batch: "",
  });

  useEffect(() => {
    // Simulate fetching student by id
    const mockData = {
      1: { name: "Ali Khan", degree: "BSIT", studentId: "1", address: "Street 1", contact: "123456", gender: "Male", batch: "2023" },
      2: { name: "Sara Ahmed", degree: "BSCS", studentId: "2", address: "Street 2", contact: "654321", gender: "Female", batch: "2024" },
    };
    if (mockData[id]) setStudent(mockData[id]);
  }, [id]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Student updated successfully!");
    console.log(student);
    navigate("/admin/students");
  };

  return (
    <div className="form-container">
      <h2>Edit Student</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Student Name" value={student.name} onChange={handleChange} />
        <input name="degree" placeholder="Degree" value={student.degree} onChange={handleChange} />
        <input name="studentId" placeholder="Student ID" value={student.studentId} onChange={handleChange} />
        <input name="address" placeholder="Address" value={student.address} onChange={handleChange} />
        <input name="contact" placeholder="Contact" value={student.contact} onChange={handleChange} />
        <input name="gender" placeholder="Gender" value={student.gender} onChange={handleChange} />
        <input name="batch" placeholder="Batch" value={student.batch} onChange={handleChange} />
        <button type="submit">Update Student</button>
      </form>
    </div>
  );
}
