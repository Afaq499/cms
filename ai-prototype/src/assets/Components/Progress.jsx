import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidbar";
import "./Progress.css";
import { API_URL } from "./constants";

export function Progress() {
  const [progressData, setProgressData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser || !currentUser._id) {
        setError("User not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/progress/student/${currentUser._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch progress data");
      }

      const data = await response.json();
      setStudentInfo(data.student || null);
      setProgressData(data.courses || []);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching progress data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatGrade = (grade) => {
    if (grade == null) return "Pending";
    return `${grade}%`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "In Progress":
        return "status-in-progress";
      case "Dropped":
        return "status-dropped";
      default:
        return "";
    }
  };

  const getHeaderSubtitle = () => {
    if (!studentInfo) return "";
    const parts = [];
    if (studentInfo.degree) parts.push(`Degree: ${studentInfo.degree}`);
    if (studentInfo.batch) parts.push(`Batch: ${studentInfo.batch}`);
    return parts.join(" | ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="progressPage">
          <div className="progressHeader">
            <h2>Student Progress Report</h2>
            <p>Loading progress data...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="progressPage">
          <div className="progressHeader">
            <h2>Student Progress Report</h2>
            <p style={{ color: "red" }}>Error: {error}</p>
            <button
              onClick={fetchProgressData}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="progressPage">
        <div className="progressHeader">
          <h2>Student Progress Report</h2>
          {studentInfo && (
            <>
              <p>
                {studentInfo.name}{" "}
                {studentInfo.studentId ? `(${studentInfo.studentId})` : ""}
              </p>
              {getHeaderSubtitle() && <p>{getHeaderSubtitle()}</p>}
            </>
          )}
        </div>

        <div className="progressTableSection">
          <h3 className="sectionTitle">Course Progress</h3>
          {progressData.length === 0 ? (
            <p>No courses assigned yet. Please contact your administrator.</p>
          ) : (
            <table className="progressTable">
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
                {progressData.map((course) => (
                  <tr key={course._id || course.courseCode}>
                    <td>{course.courseCode}</td>
                    <td>{course.courseTitle}</td>
                    <td>{formatGrade(course.assignments)}</td>
                    <td>{formatGrade(course.quizzes)}</td>
                    <td>{formatGrade(course.midterm)}</td>
                    <td>{formatGrade(course.final)}</td>
                    <td>{course.overallGrade || "—"}</td>
                    <td className={getStatusClass(course.status)}>
                      {course.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="recommendationsSection">
          <h3 className="sectionTitle">AI Learning Recommendations</h3>
          <p className="recommendationsSubtitle">
            Study topics suggested when a quiz score is below 70%.
          </p>

          {recommendations.length === 0 ? (
            <p className="noRecommendations">
              No recommendations yet. Complete a quiz — if your score is below 70%,
              AI will suggest topics and resources here.
            </p>
          ) : (
            <div className="progressTableSection recommendationsTableWrap">
              <table className="progressTable recommendationsTable">
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
                  {recommendations.flatMap((rec) =>
                    (rec.topics.length > 0 ? rec.topics : [{ title: "—", description: "—", sourceUrl: "#", sourceName: "—" }]).map(
                      (topic, topicIndex) => (
                        <tr key={`${rec._id}-${topicIndex}`}>
                          {topicIndex === 0 ? (
                            <>
                              <td rowSpan={rec.topics.length || 1}>
                                {rec.courseCode}
                                <br />
                                <span className="cellSubtext">{rec.courseTitle}</span>
                              </td>
                              <td rowSpan={rec.topics.length || 1}>{rec.quizTitle}</td>
                              <td rowSpan={rec.topics.length || 1}>
                                <span className="scoreBadge">{rec.scorePercent}%</span>
                              </td>
                              <td rowSpan={rec.topics.length || 1}>
                                {formatDate(rec.generatedAt)}
                              </td>
                            </>
                          ) : null}
                          <td className="topicCell">{topic.title}</td>
                          <td className="descCell">{topic.description || "—"}</td>
                          <td>
                            {topic.sourceUrl && topic.sourceUrl !== "#" ? (
                              <a
                                href={topic.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="topicLink"
                              >
                                {topic.sourceName || "View resource"}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
