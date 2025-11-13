import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function TeacherList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([
    { id: 1, name: "Mr. Ahmed", subject: "AI", email: "ahmed@vu.edu.pk" },
    { id: 2, name: "Ms. Fatima", subject: "Database", email: "fatima@vu.edu.pk" },
  ]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      setTeachers(teachers.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="table-container">
      <h2>All Teachers</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Subject</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.subject}</td>
              <td>{t.email}</td>
              <td>
                <button onClick={() => navigate(`/admin/edit-teacher/${t.id}`)} className="edit-btn">Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
