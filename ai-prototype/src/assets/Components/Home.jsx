import React from "react";
import { Student } from "./Student";
import { Teacher } from "./Teacher";
import { Admin } from "./Admin";

export function Home() {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.toLowerCase(); // normalize role string

  return (
    <>
      {role === "student" && <Student />}
      {role === "teacher" && <Teacher />}
      {role === "admin" && <Admin />}
      {!role && <h2>No role found. Please login again.</h2>}
    </>
  );
}
