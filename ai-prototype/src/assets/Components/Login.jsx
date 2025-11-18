import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";
import { API_URL } from "./constants";

export function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
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
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user)); // save user session
      window.location.href = "/"; // redirect after login
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};


  return (
    <>
      <div className="main">
        <div className="LogForm">
          <h1 className="mainHeading mb-3">Login</h1>

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Student email</label>
              <input
                type="text"
                placeholder="enter your student Id"
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

            <h3>
              <a href="/">Forget Password?</a>
            </h3>

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
}
