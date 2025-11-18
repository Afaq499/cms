import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Student.css";
import { Sidebar } from "./Sidbar";
import { API_URL } from "./constants";

export function Student() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentCourses();
  }, []);

  const fetchStudentCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current student from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser || !currentUser._id) {
        setError("User not found. Please login again.");
        setLoading(false);
        return;
      }

      const studentId = currentUser._id;

      // Fetch dashboard data from the new API endpoint
      const response = await fetch(`${API_URL}/dashboard/student/${studentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch student dashboard");
      }
      const data = await response.json();

      if (!data.courses || data.courses.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      setCourses(data.courses);
    } catch (err) {
      console.error("Error fetching student courses:", err);
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Group courses into rows of 2
  const groupCoursesIntoRows = (courses) => {
    const rows = [];
    for (let i = 0; i < courses.length; i += 2) {
      rows.push(courses.slice(i, i + 2));
    }
    return rows;
  };

  const getTeacherImage = (gender) => {
    return gender === "Female" ? "/images/woman.png" : "/images/man.png";
  };

  if (loading) {
    return (
      <>
        <div className="studentLayout">
          <div className="studentmain">
            <h1>My Course</h1>
            <p>Loading courses...</p>
          </div>
        </div>
        <Sidebar />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="studentLayout">
          <div className="studentmain">
            <h1>My Course</h1>
            <p style={{ color: "red" }}>Error: {error}</p>
            <button onClick={fetchStudentCourses} style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "10px"
            }}>
              Retry
            </button>
          </div>
        </div>
        <Sidebar />
      </>
    );
  }

  if (courses.length === 0) {
    return (
      <>
        <div className="studentLayout">
          <div className="studentmain">
            <h1>My Course</h1>
            <p>No courses found. Please contact your administrator.</p>
          </div>
        </div>
        <Sidebar />
      </>
    );
  }

  const courseRows = groupCoursesIntoRows(courses);

  return (
    <>
      <div className="studentLayout">
        <div className="studentmain">
          <h1>My Course</h1>
          {courseRows.map((row, rowIndex) => (
            <div key={rowIndex} className="two-cols">
              {row.map((course, courseIndex) => (
                <div key={`${course.courseCode}-${courseIndex}`} className="col-box">
                  <div className="stud-Header">
                    <h2>{course.courseCode} - {course.courseTitle}</h2><br />
                    <p>{course.degreeName}</p><br />
                    <p>{course.creditHours} Credit Hours</p>
                  </div>

                  <div className="stud-profile two-cols">
                    <img 
                      src={getTeacherImage(course.teacher.gender)} 
                      alt="Teacher" 
                      width={60} 
                      height={60} 
                    />
                    <h2>{course.teacher.name}</h2>
                    {course.teacher.subject && <p>{course.teacher.subject}</p>}
                    {course.teacher.contact && <p>{course.teacher.contact}</p>}
                  </div>
                  <hr />

                  <div className="stud-image">
                    <a href="/assignment" title={`${course.counts.assignments} Assignment(s)`} style={{ position: "relative", display: "inline-block" }}>
                      <img src="/images/assignment.png" alt="Assignment" width={60} height={60} />
                      {course.counts.assignments > 0 && (
                        <span style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          backgroundColor: "#ff4444",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: "20px",
                          height: "20px",
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 4px",
                          fontWeight: "bold"
                        }}>
                          {course.counts.assignments}
                        </span>
                      )}
                    </a>
                    <a href="/gdb" title={`${course.counts.gdbs} GDB(s)`} style={{ position: "relative", display: "inline-block" }}>
                      <img src="/images/gdb.png" alt="GDB" width={60} height={60} />
                      {course.counts.gdbs > 0 && (
                        <span style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          backgroundColor: "#ff4444",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: "20px",
                          height: "20px",
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 4px",
                          fontWeight: "bold"
                        }}>
                          {course.counts.gdbs}
                        </span>
                      )}
                    </a>
                    <a href="/quiz" title={`${course.counts.quizzes} Quiz(zes)`} style={{ position: "relative", display: "inline-block" }}>
                      <img src="/images/quiz.png" alt="Quiz" width={60} height={60} />
                      {course.counts.quizzes > 0 && (
                        <span style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          backgroundColor: "#ff4444",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: "20px",
                          height: "20px",
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 4px",
                          fontWeight: "bold"
                        }}>
                          {course.counts.quizzes}
                        </span>
                      )}
                    </a>
                    <Link to="./watched" title={`${course.counts.videos} Video(s)`} style={{ position: "relative", display: "inline-block" }}>
                      <img src="/images/video.png" alt="Video" width={60} height={60} />
                      {course.counts.videos > 0 && (
                        <span style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          backgroundColor: "#ff4444",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: "20px",
                          height: "20px",
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 4px",
                          fontWeight: "bold"
                        }}>
                          {course.counts.videos}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Sidebar />
    </>
  );
}
