import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SignUp.css";
import axios from "axios";
import { API_URL } from "./constants";

export function SignUp() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log("kjskdasdk");
    const response = await axios.post(`${API_URL}/users/signup`, user);
    console.log(response);

    const data = await response.data;
    if (response.status === 201) {
      alert("Signup successful! Please login.");
      window.location.href = "/login";
    } else {
      alert(data.error || "Signup failed");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};


  return (
    <div className="Signmain">
      <div className="signForm">
        <h1 className="signmainHeading mb-3">Sign Up</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              placeholder="enter your full name"
              name="name"
              id="name"
              required
              autoComplete="off"
              value={user.name}
              onChange={handleInput}
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="info@gmail.com"
              name="email"
              id="email"
              required
              autoComplete="off"
              value={user.email}
              onChange={handleInput}
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Password"
              name="password"
              id="password"
              required
              autoComplete="off"
              value={user.password}
              onChange={handleInput}
            />
          </div>

          <div>
            <label htmlFor="role">Role</label>
            <select
              name="role"
              id="role"
              value={user.role}
              onChange={handleInput}
              required
            >
              <option value="">Select Role</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>
          <button type="submit">Sign Up</button>
          <Link to="/login">
            <button type="button">Already have an Account</button>
          </Link>
        </form>
      </div>
    </div>
  );
}
