import React, { useState } from "react";

export function AddStudent() {
  const [student, setStudent] = useState({
    name: "",
    degree: "",
    studentId: "",
    address: "",
    contact: "",
    gender: "",
    batch: "",
  });

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("New student added successfully!");
    console.log(student);
  };

  return (
    <div className="form-container">
      <h2>Add New Student</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Student Name" onChange={handleChange} />
        <input name="degree" placeholder="Degree" onChange={handleChange} />
        <input name="studentId" placeholder="Student ID" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="contact" placeholder="Contact" onChange={handleChange} />
        <input name="gender" placeholder="Gender" onChange={handleChange} />
        <input name="batch" placeholder="Batch" onChange={handleChange} />
        <button type="submit">Add Student</button>
      </form>
    </div>
  );
}
