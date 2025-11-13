import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function EditTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState({
    name: "",
    subject: "",
    email: "",
  });

  useEffect(() => {
    const mockData = {
      1: { name: "Mr. Ahmed", subject: "AI", email: "ahmed@vu.edu.pk" },
      2: { name: "Ms. Fatima", subject: "Database", email: "fatima@vu.edu.pk" },
    };
    if (mockData[id]) setTeacher(mockData[id]);
  }, [id]);

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Teacher updated successfully!");
    console.log(teacher);
    navigate("/admin/teachers");
  };

  return (
    <div className="form-container">
      <h2>Edit Teacher</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Teacher Name" value={teacher.name} onChange={handleChange} />
        <input name="subject" placeholder="Subject" value={teacher.subject} onChange={handleChange} />
        <input name="email" placeholder="Email" value={teacher.email} onChange={handleChange} />
        <button type="submit">Update Teacher</button>
      </form>
    </div>
  );
}
