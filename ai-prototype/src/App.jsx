import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./assets/Components/Navbar";
import { Footer } from "./assets/Components/Footer";
import { Login } from "./assets/Components/Login";
import { SignUp } from "./assets/Components/SignUp";
import { Home } from "./assets/Components/Home";
import { Course } from "./assets/Components/Course";
import { Assignment } from "./assets/Components/Assignment";
import { Quiz } from "./assets/Components/Quiz";
import { Profile } from "./assets/Components/Profile";
import { Fee } from "./assets/Components/Fee";
import { Progress } from "./assets/Components/Progress";
import { Watched } from "./assets/Components/Watched";
import { Gdb } from "./assets/Components/Gdb";
import { Teacher } from "./assets/Components/Teacher";
import { Admin } from "./assets/Components/Admin";
import { ProtectedRoute } from "./assets/Components/ProtectedRoute";
import { StudentGdb } from "./assets/Components/StudentGdb";

// Teacher sub-components
import { StudentProgress } from "./assets/Components/StudentProgress";
import { GenerateReport } from "./assets/Components/GenerateReport";
import { ScheduleQuiz } from "./assets/Components/ScheduleQuiz";
import { ScheduleAssignment } from "./assets/Components/ScheduleAssignment";
import { LectureVideos } from "./assets/Components/LectureVideos";

export function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <Course />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignment"
            element={
              <ProtectedRoute allowedRoles={["Student", "Teacher"]}>
                <Assignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["Student", "Teacher", "Admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fee"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <Fee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watched"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <Watched />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gdb"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <Gdb />
              </ProtectedRoute>
            }
          />

          {/* --- Teacher Routes --- */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={["Teacher"]}>
                <Teacher />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentProgress />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="report" element={<GenerateReport />} />
            <Route path="quiz" element={<ScheduleQuiz />} />
            <Route path="assignment" element={<ScheduleAssignment />} />
            <Route path="gdb" element={<StudentGdb />} />
            <Route path="lecture" element={<LectureVideos />} />
          </Route>

          {/* --- Admin Routes --- */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
