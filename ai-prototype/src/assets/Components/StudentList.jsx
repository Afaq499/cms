import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function StudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([
    { id: 1, name: "Ali Khan", degree: "BSIT", batch: "2023", gender: "Male" },
    { id: 2, name: "Sara Ahmed", degree: "BSCS", batch: "2024", gender: "Female" },
  ]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="table-container">
      <h2>All Students</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Degree</th>
            <th>ID</th>
            <th>Batch</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.degree}</td>
              <td>{s.id}</td>
              <td>{s.batch}</td>
              <td>{s.gender}</td>
              <td>
                <button onClick={() => navigate(`/admin/edit-student/${s.id}`)} className="edit-btn">Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
