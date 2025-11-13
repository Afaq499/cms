import React, { useState } from "react";

export function AddTeacher() {
  const [teacher, setTeacher] = useState({
    name: "",
    subject: "",
    email: "",
    contact: "",
  });

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("New teacher added successfully!");
    console.log(teacher);
  };

  return (
    <div className="form-container">
      <h2>Add New Teacher</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" onChange={handleChange} />
        <input name="subject" placeholder="Subject" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="contact" placeholder="Contact" onChange={handleChange} />
        <button type="submit">Add Teacher</button>
      </form>
    </div>
  );
}
