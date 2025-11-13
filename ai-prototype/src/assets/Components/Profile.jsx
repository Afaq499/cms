import React from "react";
import "./Profile.css";
import { Sidebar } from "./Sidbar";

export function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="profileLayout">
      <Sidebar />

      <div className="profileMain">
        <h1 className="profileTitle">Student Profile</h1>

        <div className="profileCard">
          <div className="profileImg">
            <img src="/images/man.png" alt="Student" /><br /><br />
             <p><strong>Name:</strong> {user.name}</p>
          </div>

          <div className="profileData">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Father Name:</strong> Fghi</p>
            <p><strong>Gender:</strong> Male</p>
            <p><strong>Birth Date:</strong> 12 Oct 2000</p>
            <p><strong>CNIC:</strong> 35301-11231-1</p>
            <p><strong>Degree:</strong> BS</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Current Semester:</strong> 7</p>
            <p><strong>CGPA:</strong> 3.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
