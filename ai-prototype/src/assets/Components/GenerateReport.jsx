import React, { useState, useEffect } from "react";
import { API_URL } from "./constants";

export function GenerateReport() {
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await fetch(`${API_URL}/reports/all-students`);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!studentId) {
      setError("Please select a student");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/reports/student/${studentId}`);
      if (!response.ok) {
        throw new Error("Failed to generate report");
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="form-container report-page">
      <h2>Generate Student Report</h2>
      <p className="detail-subtitle">
        Select a student to generate a report with scores, quizzes, and assignments per subject.
      </p>

      <form onSubmit={handleGenerateReport} className="report-form">
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          disabled={loadingStudents}
          required
          className="report-select"
        >
          <option value="">Select a student...</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.email})
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading || loadingStudents}>
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </form>

      {error && <div className="report-error">{error}</div>}

      {report && (
        <div className="report-output">
          <div className="report-actions">
            <button type="button" className="print-btn" onClick={handlePrint}>
              Print Report
            </button>
          </div>

          <div className="report-header">
            <h3>Academic Performance Report</h3>
            <p className="report-date">
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>

          <div className="student-info-card">
            <h4>Student Information</h4>
            <div className="student-info-grid">
              <p><strong>Name:</strong> {report.student.name}</p>
              <p><strong>Email:</strong> {report.student.email}</p>
              <p><strong>Student ID:</strong> {report.student.studentId || "—"}</p>
              <p><strong>Degree:</strong> {report.student.degree || "—"}</p>
              <p><strong>Batch:</strong> {report.student.batch || "—"}</p>
            </div>
          </div>

          <div className="report-summary-grid">
            <div className="summary-stat">
              <span className="stat-value">{report.summary.totalCourses}</span>
              <span className="stat-label">Total Subjects</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{report.summary.completedCourses}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{report.summary.inProgressCourses}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{report.summary.averageGrade}</span>
              <span className="stat-label">Avg GPA</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{report.summary.gradedQuizzes}/{report.summary.totalQuizzes}</span>
              <span className="stat-label">Quizzes Graded</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{report.summary.submittedAssignments}</span>
              <span className="stat-label">Assignments Submitted</span>
            </div>
          </div>

          <h4 className="detail-section-title">Scores Overview by Subject</h4>
          {report.subjects.length === 0 ? (
            <p className="empty-msg">No subjects enrolled.</p>
          ) : (
            <div className="detail-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Title</th>
                    <th>Assignments</th>
                    <th>Quizzes</th>
                    <th>Midterm</th>
                    <th>Final</th>
                    <th>Overall Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.subjects.map((subject) => (
                    <tr key={subject.courseCode}>
                      <td>{subject.courseCode}</td>
                      <td>{subject.courseTitle}</td>
                      <td>{formatGrade(subject.scores.assignments)}</td>
                      <td>{formatGrade(subject.scores.quizzes)}</td>
                      <td>{formatGrade(subject.scores.midterm)}</td>
                      <td>{formatGrade(subject.scores.final)}</td>
                      <td>{subject.scores.overallGrade || "—"}</td>
                      <td>{subject.scores.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report.subjects.map((subject) => (
            <div key={subject.courseCode} className="subject-report-block">
              <h4 className="subject-report-title">
                {subject.courseCode} — {subject.courseTitle}
              </h4>
              <p className="subject-report-meta">
                {subject.semester} · {subject.year} · Overall: {subject.scores.overallGrade || "—"}
              </p>

              <h5 className="subject-subheading">Quizzes</h5>
              {subject.quizzes.length === 0 ? (
                <p className="empty-msg">No quiz submissions for this subject.</p>
              ) : (
                <div className="detail-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Quiz</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subject.quizzes.map((quiz) => (
                        <tr key={quiz.id}>
                          <td>{quiz.title}</td>
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

              <h5 className="subject-subheading">Assignments</h5>
              {subject.assignments.length === 0 ? (
                <p className="empty-msg">No assignments for this subject.</p>
              ) : (
                <div className="detail-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Submitted</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subject.assignments.map((a) => (
                        <tr key={a.id}>
                          <td>{a.title || a.assignmentNumber}</td>
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

              {subject.recommendations.length > 0 && (
                <>
                  <h5 className="subject-subheading">AI Learning Recommendations</h5>
                  <div className="detail-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Quiz</th>
                          <th>Score</th>
                          <th>Topic</th>
                          <th>Description</th>
                          <th>Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subject.recommendations.flatMap((rec) =>
                          rec.topics.map((topic, i) => (
                            <tr key={`${rec._id}-${i}`}>
                              {i === 0 ? (
                                <>
                                  <td rowSpan={rec.topics.length}>{rec.quizTitle}</td>
                                  <td rowSpan={rec.topics.length}>
                                    <span className="score-low">{rec.scorePercent}%</span>
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
                                    {topic.sourceName || "View"}
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
