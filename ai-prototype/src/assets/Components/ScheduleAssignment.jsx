import React, { useState, useEffect } from "react";
import { API_URL } from "./constants";

export function ScheduleAssignment() {
  const [formData, setFormData] = useState({
    title: "",
    courseCode: "",
    courseName: "",
    dueDate: "",
    totalMarks: 100,
    description: "",
    instructions: "",
    content: "",
  });
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // States for viewing and grading assignments
  const [showStudentSubmissions, setShowStudentSubmissions] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  // States for grading modal
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeRemarks, setGradeRemarks] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Get current teacher
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user._id) {
        return;
      }

      // Try fetching from courses endpoint first
      const response = await fetch(`${API_URL}/courses`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
          return;
        }
      }

      // If courses endpoint doesn't return data, fetch from degrees
      const degreesResponse = await fetch(`${API_URL}/degrees`);
      if (degreesResponse.ok) {
        const degreesData = await degreesResponse.json();
        const degreesList = degreesData.degrees || [];
        
        // Get all courses from all degrees
        const allCourses = [];
        degreesList.forEach(degree => {
          if (degree.courses && Array.isArray(degree.courses)) {
            degree.courses.forEach(course => {
              // Only include courses that the teacher teaches (if teacher has courses array)
              if (!user.courses || user.courses.length === 0 || user.courses.includes(course.code)) {
                // Avoid duplicates
                if (!allCourses.find(c => c.code === course.code)) {
                  allCourses.push({
                    code: course.code,
                    title: course.title || course.name,
                    degreeName: degree.name,
                  });
                }
              }
            });
          }
        });
        
        setCourses(allCourses);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`${API_URL}/assignments`);
      if (response.ok) {
        const data = await response.json();
        // Filter to show only assignments created by the current teacher
        if (user && user.role === 'Teacher') {
          const teacherAssignments = data.filter(assignment => {
            const teacherId = assignment.teacherId?._id || assignment.teacherId;
            return teacherId === user._id;
          });
          setAssignments(teacherAssignments);
        } else {
          setAssignments(data);
        }
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  // Fetch student submissions for a specific assignment
  const fetchStudentSubmissions = async (assignment) => {
    try {
      setLoadingSubmissions(true);
      setSelectedAssignment(assignment);
      
      // Fetch all assignments with the same assignmentNumber and courseCode
      const response = await fetch(`${API_URL}/assignments`);
      if (response.ok) {
        const allAssignments = await response.json();
        // Filter assignments that match this assignment's number and course
        // These represent individual student submissions
        const submissions = allAssignments.filter(a => 
          a.assignmentNumber === assignment.assignmentNumber &&
          a.courseCode === assignment.courseCode &&
          a.studentId // Only show assignments that have been assigned to students
        );
        setStudentSubmissions(submissions);
        setShowStudentSubmissions(true);
      }
    } catch (err) {
      console.error("Error fetching student submissions:", err);
      alert("Error fetching student submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Handle grading an assignment
  const handleGradeAssignment = async () => {
    if (!selectedSubmission || !gradeScore) {
      alert('Please provide a score');
      return;
    }

    const score = parseFloat(gradeScore);
    if (isNaN(score) || score < 0 || score > selectedSubmission.totalMarks) {
      alert(`Score must be between 0 and ${selectedSubmission.totalMarks}`);
      return;
    }

    try {
      setGrading(true);
      
      const response = await fetch(`${API_URL}/assignments/${selectedSubmission._id}/grade`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: score,
          remarks: gradeRemarks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to grade assignment');
      }

      // Refresh submissions
      await fetchStudentSubmissions(selectedAssignment);
      setShowGradeModal(false);
      setGradeScore('');
      setGradeRemarks('');
      setSelectedSubmission(null);
      alert('Assignment graded successfully!');
    } catch (err) {
      alert(err.message || 'Error grading assignment');
      console.error('Error grading assignment:', err);
    } finally {
      setGrading(false);
    }
  };

  // Open grade modal
  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeScore(submission.score || '');
    setGradeRemarks(submission.remarks || '');
    setShowGradeModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCourseChange = (e) => {
    const selectedCourseCode = e.target.value;
    const selectedCourse = courses.find(c => c.code === selectedCourseCode);
    if (selectedCourse) {
      setFormData({
        ...formData,
        courseCode: selectedCourse.code,
        courseName: selectedCourse.title || selectedCourse.name,
      });
    } else {
      setFormData({
        ...formData,
        courseCode: "",
        courseName: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user._id) {
        throw new Error("User not logged in");
      }

      // Auto-generate assignment number based on course code and timestamp
      const timestamp = Date.now();
      const coursePrefix = formData.courseCode ? formData.courseCode.replace(/\s+/g, '').toUpperCase() : 'ASSIGN';
      const assignmentNumber = `${coursePrefix}-${timestamp}`;

      // Combine date and time if needed, or just use date
      const assignmentData = {
        ...formData,
        assignmentNumber: assignmentNumber,
        dueDate: new Date(formData.dueDate).toISOString(),
        totalMarks: parseInt(formData.totalMarks),
        teacherId: user._id,
      };

      const response = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to schedule assignment");
      }

      const newAssignment = await response.json();
      setSuccess("Assignment scheduled successfully!");
      setFormData({
        title: "",
        courseCode: "",
        courseName: "",
        dueDate: "",
        totalMarks: 100,
        description: "",
        instructions: "",
        content: "",
      });
      fetchAssignments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Schedule an Assignment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Assignment Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <select
          name="course"
          value={formData.courseCode}
          onChange={handleCourseChange}
          required
          style={{
            padding: "10px",
            fontSize: "14px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.code} value={course.code}>
              {course.code} - {course.title || course.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="totalMarks"
          placeholder="Total Marks"
          value={formData.totalMarks}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
        <textarea
          name="instructions"
          placeholder="Instructions (optional)"
          value={formData.instructions}
          onChange={handleChange}
          rows="3"
        />
        <textarea
          name="content"
          placeholder="Assignment Content (required)"
          value={formData.content}
          onChange={handleChange}
          rows="6"
          required
          style={{ marginTop: "10px" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Scheduling..." : "Schedule Assignment"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: "10px" }}>{success}</div>}

      {assignments.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Scheduled Assignments</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Assignment #</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Title</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Course</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Due Date</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Marks</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Teacher</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment._id}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{assignment.assignmentNumber}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{assignment.title}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{assignment.courseCode}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{assignment.totalMarks}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {assignment.teacherId?.name || "N/A"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{assignment.status}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <button
                      onClick={() => fetchStudentSubmissions(assignment)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px"
                      }}
                    >
                      View & Grade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Submissions Modal */}
      {showStudentSubmissions && selectedAssignment && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setShowStudentSubmissions(false)}>
          <div style={{
            background: "white",
            borderRadius: "8px",
            maxWidth: "900px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              borderBottom: "1px solid #ddd"
            }}>
              <h3>Student Submissions - {selectedAssignment.assignmentNumber}: {selectedAssignment.title}</h3>
              <button
                onClick={() => setShowStudentSubmissions(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <p><strong>Course:</strong> {selectedAssignment.courseCode} - {selectedAssignment.courseName}</p>
              <p><strong>Due Date:</strong> {formatDate(selectedAssignment.dueDate)}</p>
              <p><strong>Total Marks:</strong> {selectedAssignment.totalMarks}</p>
              
              {loadingSubmissions ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading submissions...</div>
              ) : studentSubmissions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  No student submissions yet.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Student</th>
                      <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Status</th>
                      <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Submitted Date</th>
                      <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Score</th>
                      <th style={{ border: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentSubmissions.map((submission) => (
                      <tr key={submission._id}>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {submission.studentId?.name || submission.studentId?.email || "N/A"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            backgroundColor: submission.status === "Submitted" ? "#d4edda" : "#fff3cd",
                            color: submission.status === "Submitted" ? "#155724" : "#856404"
                          }}>
                            {submission.status}
                          </span>
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {formatDate(submission.submittedDate)}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {submission.score !== null && submission.score !== undefined
                            ? `${submission.score}/${submission.totalMarks}`
                            : "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {submission.status === "Submitted" && (
                            <button
                              onClick={() => openGradeModal(submission)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "13px"
                              }}
                            >
                              {submission.score !== null && submission.score !== undefined ? "Update Grade" : "Grade"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Assignment Modal */}
      {showGradeModal && selectedSubmission && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2000,
          padding: "20px"
        }} onClick={() => setShowGradeModal(false)}>
          <div style={{
            background: "white",
            borderRadius: "8px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              borderBottom: "1px solid #ddd"
            }}>
              <h3>Grade Assignment</h3>
              <button
                onClick={() => setShowGradeModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <p><strong>Assignment:</strong> {selectedSubmission.assignmentNumber} - {selectedSubmission.title}</p>
              <p><strong>Student:</strong> {
                selectedSubmission.studentId?.name || selectedSubmission.studentId?.email || "N/A"
              }</p>
              <p><strong>Course:</strong> {selectedSubmission.courseCode} - {selectedSubmission.courseName}</p>
              <p><strong>Total Marks:</strong> {selectedSubmission.totalMarks}</p>
              <p><strong>Submitted Date:</strong> {formatDate(selectedSubmission.submittedDate)}</p>
              
              {selectedSubmission.submissionText && (
                <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                  <strong>Student Submission:</strong>
                  <p style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>{selectedSubmission.submissionText}</p>
                </div>
              )}
              
              <div style={{ marginTop: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Score (out of {selectedSubmission.totalMarks}):
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedSubmission.totalMarks}
                  step="0.5"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                  required
                />
              </div>
              
              <div style={{ marginTop: "15px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Remarks:
                </label>
                <textarea
                  rows="4"
                  value={gradeRemarks}
                  onChange={(e) => setGradeRemarks(e.target.value)}
                  placeholder="Enter feedback or remarks..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    resize: "vertical"
                  }}
                />
              </div>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              padding: "20px",
              borderTop: "1px solid #ddd"
            }}>
              <button
                onClick={() => setShowGradeModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGradeAssignment}
                disabled={grading || !gradeScore}
                style={{
                  padding: "10px 20px",
                  backgroundColor: grading || !gradeScore ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: grading || !gradeScore ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: grading || !gradeScore ? 0.6 : 1
                }}
              >
                {grading ? "Grading..." : "Submit Grade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
