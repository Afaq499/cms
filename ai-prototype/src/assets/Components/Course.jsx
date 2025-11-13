import React, { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from "./Sidbar";
import "./Course.css";
import { API_URL } from "./constants";

export function Course() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/courses`)
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <div className="coursemain">
        <div className="coursemain2">
          <h1>My Study Course</h1>
          <div className="tablediv">
            <table border="1" cellPadding="5" cellSpacing="0">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Cr.Hrs</th>
                  <th>Semester</th> {/* Added Semester */}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.code}</td>
                    <td>{course.title}</td>
                    <td>{course.type}</td>
                    <td>{course.creditHours}</td>
                    <td>{course.semester}</td> {/* Display Semester */}
                    <td>{course.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Sidebar />
    </>
  );
}
