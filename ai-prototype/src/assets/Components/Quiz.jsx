import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidbar";
import { API_URL } from "./constants";
import "./Assignment.css";

export function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    const courseCode = searchParams.get("course");
    if (courseCode) {
      setSelectedCourse(courseCode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentQuiz && submission && submission.status === "In Progress") {
      const startTime = new Date(submission.startedAt).getTime();
      const durationMs = currentQuiz.duration * 60 * 1000;
      const endTime = startTime + durationMs;

      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(Math.floor(remaining / 1000));

        if (remaining === 0) {
          handleAutoSubmit();
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentQuiz, submission]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser || !currentUser._id) {
        setError("User not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/dashboard/student/${currentUser._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }
      const data = await response.json();

      // Collect all quizzes from all courses
      const allQuizzes = [];
      if (data.courses && Array.isArray(data.courses)) {
        data.courses.forEach(course => {
          if (course.quizzes && Array.isArray(course.quizzes)) {
            course.quizzes.forEach(quiz => {
              allQuizzes.push({
                ...quiz,
                courseCode: course.courseCode,
                courseTitle: course.courseTitle,
              });
            });
          }
        });
      }

      setQuizzes(allQuizzes);

      // Fetch submissions for all quizzes
      const submissionPromises = allQuizzes.map(async (quiz) => {
        const quizId = quiz.id || quiz._id;
        try {
          const subResponse = await fetch(`${API_URL}/quizzes/${quizId}/submission/${currentUser._id}`);
          if (subResponse.ok) {
            const subData = await subResponse.json();
            return { quizId, submission: subData };
          }
        } catch (err) {
          // No submission found, that's okay
        }
        return { quizId, submission: null };
      });

      const submissionResults = await Promise.all(submissionPromises);
      const submissionsMap = {};
      submissionResults.forEach(({ quizId, submission }) => {
        if (submission) {
          submissionsMap[quizId] = submission;
        }
      });
      setSubmissions(submissionsMap);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError(err.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const quizId = quiz.id || quiz._id;
      
      // First fetch the full quiz with questions
      const quizResponse = await fetch(`${API_URL}/quizzes/${quizId}`);
      if (!quizResponse.ok) {
        throw new Error("Failed to fetch quiz details");
      }
      const fullQuiz = await quizResponse.json();

      // Check if submission exists
      const existingSubmission = submissions[quizId];
      if (existingSubmission && existingSubmission.status === "In Progress") {
        // Continue existing quiz
        setSubmission(existingSubmission);
        // Load existing answers
        const existingAnswers = {};
        if (existingSubmission.answers && Array.isArray(existingSubmission.answers)) {
          existingSubmission.answers.forEach(ans => {
            existingAnswers[ans.questionId] = ans.answer;
          });
        }
        setAnswers(existingAnswers);
      } else {
        // Start new quiz
        const response = await fetch(`${API_URL}/quizzes/${quizId}/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentId: currentUser._id }),
        });

        if (response.ok) {
          const submissionData = await response.json();
          setSubmission(submissionData);
          setAnswers({});
          // Update submissions map
          setSubmissions({ ...submissions, [quizId]: submissionData });
        }
      }
      setCurrentQuiz({ ...fullQuiz, courseCode: quiz.courseCode, courseTitle: quiz.courseTitle });
      setViewMode(false);
    } catch (err) {
      alert("Failed to start quiz: " + err.message);
    }
  };

  const viewQuiz = async (quiz) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const quizId = quiz.id || quiz._id;
      
      // Fetch the full quiz with questions
      const quizResponse = await fetch(`${API_URL}/quizzes/${quizId}`);
      if (!quizResponse.ok) {
        throw new Error("Failed to fetch quiz details");
      }
      const fullQuiz = await quizResponse.json();

      // Get submission
      const existingSubmission = submissions[quizId];
      if (existingSubmission) {
        setSubmission(existingSubmission);
        // Load answers
        const existingAnswers = {};
        if (existingSubmission.answers && Array.isArray(existingSubmission.answers)) {
          existingSubmission.answers.forEach(ans => {
            existingAnswers[ans.questionId] = ans.answer;
          });
        }
        setAnswers(existingAnswers);
        setCurrentQuiz({ ...fullQuiz, courseCode: quiz.courseCode, courseTitle: quiz.courseTitle });
        setViewMode(true);
      }
    } catch (err) {
      alert("Failed to load quiz: " + err.message);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit the quiz? You cannot change your answers after submission.")) {
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const quizId = currentQuiz._id || currentQuiz.id;
      const answerArray = Object.keys(answers).map(questionId => ({
        questionId,
        answer: answers[questionId],
      }));

      const response = await fetch(`${API_URL}/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: currentUser._id,
          answers: answerArray,
        }),
      });

      if (response.ok) {
        const updatedSubmission = await response.json();
        setSubmission(updatedSubmission);
        // Update submissions map
        const quizId = currentQuiz._id || currentQuiz.id;
        setSubmissions({ ...submissions, [quizId]: updatedSubmission });
        fetchQuizzes();
      }
    } catch (err) {
      alert("Failed to submit quiz");
    }
  };

  const handleAutoSubmit = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const quizId = currentQuiz._id || currentQuiz.id;
      const answerArray = Object.keys(answers).map(questionId => ({
        questionId,
        answer: answers[questionId],
      }));

      const response = await fetch(`${API_URL}/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: currentUser._id,
          answers: answerArray,
        }),
      });

      if (response.ok) {
        const updatedSubmission = await response.json();
        setSubmission(updatedSubmission);
        // Update submissions map
        const quizId = currentQuiz._id || currentQuiz.id;
        setSubmissions({ ...submissions, [quizId]: updatedSubmission });
        alert("Time's up! Quiz has been automatically submitted.");
        fetchQuizzes();
      }
    } catch (err) {
      console.error("Failed to auto-submit quiz");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getQuizStatus = (quiz) => {
    // This would need to check submission status - simplified for now
    return "Pending";
  };

  const filteredQuizzes = selectedCourse
    ? quizzes.filter(q => q.courseCode === selectedCourse)
    : quizzes;

  const quizzesByCourse = {};
  filteredQuizzes.forEach(quiz => {
    if (!quizzesByCourse[quiz.courseCode]) {
      quizzesByCourse[quiz.courseCode] = [];
    }
    quizzesByCourse[quiz.courseCode].push(quiz);
  });

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="assignmentmain">
          <h3>Loading quizzes...</h3>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="assignmentmain">
          <h3>Error: {error}</h3>
        </div>
      </>
    );
  }

  // Quiz taking/viewing interface
  if (currentQuiz && submission) {
    const quiz = currentQuiz;
    const isViewMode = viewMode || submission.status !== "In Progress";
    
    return (
      <>
        <Sidebar />
        <div className="assignmentmain" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>{quiz.title} {isViewMode && <span style={{ fontSize: "14px", color: "#666" }}>(View Mode)</span>}</h2>
            {timeRemaining !== null && submission.status === "In Progress" && !isViewMode && (
              <div style={{ fontSize: "20px", fontWeight: "bold", color: timeRemaining < 300 ? "red" : "black" }}>
                Time: {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          <p><strong>Course:</strong> {quiz.courseCode} - {quiz.courseTitle}</p>
          {quiz.description && <p>{quiz.description}</p>}
          {quiz.instructions && <p><strong>Instructions:</strong> {quiz.instructions}</p>}

          {quiz.questions && quiz.questions.length > 0 ? (
            <div style={{ marginTop: "20px" }}>
              {quiz.questions.map((question, index) => (
                <div key={question.questionId} style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px" }}>
                  <h4>Question {index + 1} ({question.marks} marks)</h4>
                  <p style={{ marginBottom: "15px", fontSize: "16px" }}>{question.question}</p>

                  {question.type === "multiple-choice" && (
                    <div>
                      {question.options.map((option, optIndex) => (
                        <label key={optIndex} style={{ display: "block", marginBottom: "10px", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name={`question-${question.questionId}`}
                            value={option}
                            checked={answers[question.questionId] === option}
                            onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                            disabled={isViewMode || submission.status !== "In Progress"}
                          />
                          <span style={{ marginLeft: "10px" }}>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === "true-false" && (
                    <div>
                      {question.options.map((option, optIndex) => (
                        <label key={optIndex} style={{ display: "block", marginBottom: "10px", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name={`question-${question.questionId}`}
                            value={option}
                            checked={answers[question.questionId] === option}
                            onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                            disabled={isViewMode || submission.status !== "In Progress"}
                          />
                          <span style={{ marginLeft: "10px" }}>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {(question.type === "short-answer" || question.type === "essay") && (
                    <textarea
                      value={answers[question.questionId] || ""}
                      onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                      disabled={isViewMode || submission.status !== "In Progress"}
                      rows={question.type === "essay" ? 6 : 3}
                      style={{ width: "100%", padding: "10px", fontSize: "14px" }}
                      placeholder="Enter your answer here"
                    />
                  )}

                  {(isViewMode || submission.status === "Graded") && (
                    <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
                      <p><strong>Your Answer:</strong> {answers[question.questionId] || "Not answered"}</p>
                      {submission.status === "Graded" && (
                        <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                      )}
                      {question.type === "multiple-choice" || question.type === "true-false" ? (
                        <div style={{ marginTop: "5px" }}>
                          {String(answers[question.questionId] || "").trim() === String(question.correctAnswer).trim() ? (
                            <span style={{ color: "#28a745", fontWeight: "bold" }}>✓ Correct</span>
                          ) : (
                            <span style={{ color: "#dc3545", fontWeight: "bold" }}>✗ Incorrect</span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}

              {submission.status === "In Progress" && !isViewMode && (
                <div style={{ marginTop: "30px", textAlign: "center" }}>
                  <button
                    onClick={handleSubmit}
                    style={{
                      padding: "12px 30px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    Submit Quiz
                  </button>
                </div>
              )}

              {submission.status === "Submitted" && (
                <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#d4edda", borderRadius: "5px", textAlign: "center" }}>
                  <p>Quiz submitted successfully! Waiting for grading.</p>
                </div>
              )}

              {submission.status === "Graded" && (
                <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#d1ecf1", borderRadius: "5px" }}>
                  <h3>Results</h3>
                  <p><strong>Score:</strong> {submission.score} / {submission.totalMarks}</p>
                  <p><strong>Percentage:</strong> {((submission.score / submission.totalMarks) * 100).toFixed(2)}%</p>
                  {submission.remarks && <p><strong>Remarks:</strong> {submission.remarks}</p>}
                </div>
              )}

              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={() => {
                    setCurrentQuiz(null);
                    setSubmission(null);
                    setAnswers({});
                    setTimeRemaining(null);
                    setViewMode(false);
                    fetchQuizzes();
                  }}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Back to Quiz List
                </button>
              </div>
            </div>
          ) : (
            <p>No questions available for this quiz.</p>
          )}
        </div>
      </>
    );
  }

  // Quiz list interface
  return (
    <>
      <Sidebar />
      <div className="assignmentmain">
        {selectedCourse && (
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => {
                setSelectedCourse(null);
                navigate('/quiz');
              }}
              style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              Show All Quizzes
            </button>
            <p style={{ marginTop: "10px" }}>Showing quizzes for: <strong>{selectedCourse}</strong></p>
          </div>
        )}

        {Object.keys(quizzesByCourse).length === 0 ? (
          <div className="assignmentcolor">
            <h3>No quizzes available</h3>
          </div>
        ) : (
          Object.keys(quizzesByCourse).map(courseCode => (
            <div key={courseCode} className="assignmentcolor" style={{ marginBottom: "30px" }}>
              <h3>{courseCode} - {quizzesByCourse[courseCode][0]?.courseTitle}</h3>
              <div className="assignmentdiv">
                <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Duration</th>
                      <th>Total Marks</th>
                      <th>Status</th>
                      <th>Result</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzesByCourse[courseCode].map((quiz) => {
                      const endDate = new Date(quiz.scheduledDate);
                      endDate.setMinutes(endDate.getMinutes() + quiz.duration);
                      const quizId = quiz.id || quiz._id;
                      const quizSubmission = submissions[quizId];
                      const submissionStatus = quizSubmission?.status || "Not Started";
                      const submissionScore = quizSubmission?.score;
                      
                      const getStatusDisplay = () => {
                        switch (submissionStatus) {
                          case "In Progress":
                            return { text: "In Progress", color: "#ffc107" };
                          case "Submitted":
                            return { text: "Submitted", color: "#17a2b8" };
                          case "Graded":
                            return { text: "Graded", color: "#28a745" };
                          default:
                            return { text: "Not Started", color: "#6c757d" };
                        }
                      };

                      const statusInfo = getStatusDisplay();
                      
                      const getActionButton = () => {
                        if (!quizSubmission) {
                          return (
                            <button
                              onClick={() => startQuiz(quiz)}
                              style={{
                                padding: "5px 10px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                              }}
                            >
                              Start Quiz
                            </button>
                          );
                        } else if (submissionStatus === "In Progress") {
                          return (
                            <button
                              onClick={() => startQuiz(quiz)}
                              style={{
                                padding: "5px 10px",
                                backgroundColor: "#ffc107",
                                color: "black",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                              }}
                            >
                              Continue Quiz
                            </button>
                          );
                        } else if (submissionStatus === "Submitted") {
                          return (
                            <button
                              onClick={() => viewQuiz(quiz)}
                              style={{
                                padding: "5px 10px",
                                backgroundColor: "#17a2b8",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                              }}
                            >
                              View Submission
                            </button>
                          );
                        } else if (submissionStatus === "Graded") {
                          return (
                            <button
                              onClick={() => viewQuiz(quiz)}
                              style={{
                                padding: "5px 10px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                              }}
                            >
                              View Results
                            </button>
                          );
                        }
                        return null;
                      };
                      
                      return (
                        <tr key={quizId}>
                          <td>{quiz.title}</td>
                          <td>{new Date(quiz.scheduledDate).toLocaleDateString()}</td>
                          <td>{endDate.toLocaleDateString()}</td>
                          <td>{quiz.duration} minutes</td>
                          <td>{quiz.totalMarks} Marks</td>
                          <td>
                            <span style={{ 
                              padding: "3px 8px", 
                              borderRadius: "3px", 
                              backgroundColor: statusInfo.color,
                              color: statusInfo.color === "#ffc107" ? "black" : "white",
                              fontSize: "12px"
                            }}>
                              {statusInfo.text}
                            </span>
                          </td>
                          <td>
                            {submissionScore !== null && submissionScore !== undefined 
                              ? `${submissionScore}/${quiz.totalMarks}` 
                              : "-"}
                          </td>
                          <td>
                            {getActionButton()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
