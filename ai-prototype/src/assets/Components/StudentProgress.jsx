import React, { useState, useEffect } from "react";
import { API_URL } from "./constants";

export function StudentProgress() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentProgress();
  }, []);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reports/all-students`);
      if (!response.ok) {
        throw new Error("Failed to fetch student progress");
      }
      const data = await response.json();
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching student progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetail = async (student) => {
    try {
      setDetailLoading(true);
      setSelectedStudent(student);
      setDetail(null);
      const response = await fetch(`${API_URL}/reports/student-detail/${student.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch student details");
      }
      const data = await response.json();
      setDetail(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching student detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedStudent(null);
    setDetail(null);
    setError(null);
  };

  const formatGrade = (grade) => {
    if (grade == null) return "Pending";
    return `${grade}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatScore = (score, totalMarks) => {
    if (score == null) return "Not graded";
    return `${score} / ${totalMarks}`;
  };

  if (loading) {
    return <div className="table-container">Loading...</div>;
  }

  if (error && !selectedStudent) {
    return <div className="table-container">Error: {error}</div>;
  }

  if (selectedStudent) {
    return (
      <div className="table-container student-detail-view">
        <button type="button" className="back-btn" onClick={handleBack}>
          ← Back to all students
        </button>

        {detailLoading ? (
          <p>Loading student details...</p>
        ) : detail ? (
          <>
            <div className="student-info-card">
              <h2>{detail.student.name}</h2>
              <div className="student-info-grid">
                <p><strong>Email:</strong> {detail.student.email}</p>
                <p><strong>Student ID:</strong> {detail.student.studentId || "—"}</p>
                <p><strong>Degree:</strong> {detail.student.degree || "—"}</p>
                <p><strong>Batch:</strong> {detail.student.batch || "—"}</p>
                {detail.student.contact && (
                  <p><strong>Contact:</strong> {detail.student.contact}</p>
                )}
              </div>
            </div>

            <h3 className="detail-section-title">Course Progress</h3>
            {detail.courses.length === 0 ? (
              <p className="empty-msg">No courses assigned.</p>
            ) : (
              <div className="detail-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Title</th>
                      <th>Assignments</th>
                      <th>Quizzes</th>
                      <th>Midterm</th>
                      <th>Final</th>
                      <th>Overall Grade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.courses.map((course) => (
                      <tr key={course.courseCode}>
                        <td>{course.courseCode}</td>
                        <td>{course.courseTitle}</td>
                        <td>{formatGrade(course.assignments)}</td>
                        <td>{formatGrade(course.quizzes)}</td>
                        <td>{formatGrade(course.midterm)}</td>
                        <td>{formatGrade(course.final)}</td>
                        <td>{course.overallGrade || "—"}</td>
                        <td>{course.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="detail-section-title">Quizzes & Grades</h3>
            {detail.quizzes.length === 0 ? (
              <p className="empty-msg">No quiz submissions yet.</p>
            ) : (
              <div className="detail-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Course</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.quizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td>{quiz.title}</td>
                        <td>{quiz.courseCode}</td>
                        <td>{formatScore(quiz.score, quiz.totalMarks)}</td>
                        <td>
                          {quiz.scorePercent != null ? (
                            <span className={quiz.scorePercent < 70 ? "score-low" : "score-ok"}>
                              {quiz.scorePercent}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{quiz.status}</td>
                        <td>{formatDate(quiz.submittedAt)}</td>
                        <td>{quiz.remarks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="detail-section-title">Assignments & Grades</h3>
            {detail.assignments.length === 0 ? (
              <p className="empty-msg">No assignments found for enrolled courses.</p>
            ) : (
              <div className="detail-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Course</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Submitted</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.assignments.map((a) => (
                      <tr key={a.id}>
                        <td>{a.title || a.assignmentNumber}</td>
                        <td>{a.courseCode}</td>
                        <td>{formatDate(a.dueDate)}</td>
                        <td>{a.status}</td>
                        <td>{formatScore(a.score, a.totalMarks)}</td>
                        <td>{formatDate(a.submittedDate)}</td>
                        <td>{a.remarks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="detail-section-title">AI Learning Recommendations</h3>
            <p className="detail-subtitle">Generated when quiz score is below 70%</p>
            {detail.recommendations.length === 0 ? (
              <p className="empty-msg">No AI recommendations yet.</p>
            ) : (
              <div className="detail-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Quiz</th>
                      <th>Score</th>
                      <th>Date</th>
                      <th>Recommended Topic</th>
                      <th>Description</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.recommendations.flatMap((rec) =>
                      (rec.topics.length > 0
                        ? rec.topics
                        : [{ title: "—", description: "—", sourceUrl: "", sourceName: "—" }]
                      ).map((topic, topicIndex) => (
                        <tr key={`${rec._id}-${topicIndex}`}>
                          {topicIndex === 0 ? (
                            <>
                              <td rowSpan={rec.topics.length || 1}>
                                {rec.courseCode}
                                <br />
                                <span className="cell-subtext">{rec.courseTitle}</span>
                              </td>
                              <td rowSpan={rec.topics.length || 1}>{rec.quizTitle}</td>
                              <td rowSpan={rec.topics.length || 1}>
                                <span className="score-low">{rec.scorePercent}%</span>
                              </td>
                              <td rowSpan={rec.topics.length || 1}>
                                {formatDate(rec.generatedAt)}
                              </td>
                            </>
                          ) : null}
                          <td><strong>{topic.title}</strong></td>
                          <td>{topic.description || "—"}</td>
                          <td>
                            {topic.sourceUrl ? (
                              <a
                                href={topic.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resource-link"
                              >
                                {topic.sourceName || "View resource"}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p className="empty-msg">Could not load student details.</p>
        )}
      </div>
    );
  }

  return (
    <div className="table-container">
      <h2>Student Progress</h2>
      <p className="detail-subtitle">Click a student to view quizzes, assignments, grades, and AI recommendations.</p>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table className="student-list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Degree</th>
              <th>Batch</th>
              <th>Total Courses</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="clickable-row"
                onClick={() => fetchStudentDetail(student)}
              >
                <td className="student-name-cell">{student.name}</td>
                <td>{student.email}</td>
                <td>{student.studentId || "—"}</td>
                <td>{student.degree || "—"}</td>
                <td>{student.batch || "—"}</td>
                <td>{student.totalCourses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
