import React, { useState, useEffect } from "react";
import { API_URL } from "./constants";

export function ScheduleQuiz() {
  const [formData, setFormData] = useState({
    title: "",
    courseCode: "",
    courseName: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    totalMarks: 100,
    description: "",
    instructions: "",
  });
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Get current teacher
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user._id) {
        return;
      }

      // Fetch teacher's courses from degrees
      const response = await fetch(`${API_URL}/degrees`);
      if (response.ok) {
        const data = await response.json();
        const degreesList = data.degrees || [];
        
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
                    title: course.title,
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

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_URL}/quizzes`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    }
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
        courseName: selectedCourse.title,
      });
    } else {
      setFormData({
        ...formData,
        courseCode: "",
        courseName: "",
      });
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      questionId: `q${Date.now()}`,
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (questions.length === 0) {
      setError("Please add at least one question");
      setLoading(false);
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1}: Question text is required`);
        setLoading(false);
        return;
      }
      if (q.type === "multiple-choice" && q.options.filter(o => o.trim()).length < 2) {
        setError(`Question ${i + 1}: At least 2 options are required for multiple choice`);
        setLoading(false);
        return;
      }
      if (!q.correctAnswer) {
        setError(`Question ${i + 1}: Correct answer is required`);
        setLoading(false);
        return;
      }
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user._id) {
        throw new Error("User not logged in");
      }

      const totalMarks = calculateTotalMarks();
      const quizData = {
        ...formData,
        createdBy: user._id,
        duration: parseInt(formData.duration),
        totalMarks: totalMarks || parseInt(formData.totalMarks),
        questions: questions.map(q => ({
          ...q,
          marks: parseInt(q.marks) || 1,
          options: q.type === "multiple-choice" || q.type === "true-false" 
            ? q.options.filter(o => o.trim()) 
            : [],
        })),
      };

      const response = await fetch(`${API_URL}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to schedule quiz");
      }

      const newQuiz = await response.json();
      setSuccess("Quiz scheduled successfully!");
      setFormData({
        title: "",
        courseCode: "",
        courseName: "",
        scheduledDate: "",
        scheduledTime: "",
        duration: 60,
        totalMarks: 100,
        description: "",
        instructions: "",
      });
      setQuestions([]);
      fetchQuizzes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (quizId) => {
    try {
      const quiz = quizzes.find(q => q._id === quizId);
      setSelectedQuiz(quiz);
      const response = await fetch(`${API_URL}/quizzes/${quizId}/submissions`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
        setShowSubmissions(true);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const handleGrade = async (quizId, submissionId, score, remarks) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}/grade/${submissionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score: parseFloat(score), remarks }),
      });

      if (response.ok) {
        fetchSubmissions(quizId);
        setSuccess("Quiz graded successfully!");
      }
    } catch (err) {
      setError("Failed to grade quiz");
    }
  };

  return (
    <div className="form-container" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Schedule a Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
          <input
            type="text"
            name="title"
            placeholder="Quiz Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <select
            name="course"
            value={formData.courseCode}
            onChange={handleCourseChange}
            required
            style={{ padding: "10px", fontSize: "14px", borderRadius: "5px", border: "1px solid #ddd" }}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.code} value={course.code}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            required
          />
          <input
            type="time"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="duration"
            placeholder="Duration (minutes)"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          rows="2"
          style={{ width: "100%", marginBottom: "15px" }}
        />
        <textarea
          name="instructions"
          placeholder="Instructions (optional)"
          value={formData.instructions}
          onChange={handleChange}
          rows="2"
          style={{ width: "100%", marginBottom: "15px" }}
        />

        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3>Questions ({questions.length})</h3>
            <button type="button" onClick={addQuestion} style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Add Question
            </button>
          </div>
          <p style={{ color: "#666", fontSize: "14px" }}>Total Marks: {calculateTotalMarks()}</p>

          {questions.map((question, qIndex) => (
            <div key={question.questionId} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "15px", borderRadius: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <strong>Question {qIndex + 1}</strong>
                <button type="button" onClick={() => removeQuestion(qIndex)} style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>
                  Remove
                </button>
              </div>
              
              <textarea
                placeholder="Enter question"
                value={question.question}
                onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                rows="2"
                style={{ width: "100%", marginBottom: "10px" }}
                required
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <select
                  value={question.type}
                  onChange={(e) => {
                    updateQuestion(qIndex, "type", e.target.value);
                    if (e.target.value === "true-false") {
                      updateQuestion(qIndex, "options", ["True", "False"]);
                    }
                  }}
                  style={{ padding: "5px" }}
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="essay">Essay</option>
                </select>
                <input
                  type="number"
                  placeholder="Marks"
                  value={question.marks}
                  onChange={(e) => updateQuestion(qIndex, "marks", e.target.value)}
                  min="1"
                  style={{ padding: "5px" }}
                  required
                />
              </div>

              {(question.type === "multiple-choice" || question.type === "true-false") && (
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Options:</label>
                  {question.options.map((option, oIndex) => (
                    <input
                      key={oIndex}
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                      style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
                      required={question.type === "true-false"}
                    />
                  ))}
                  {question.type === "multiple-choice" && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...questions];
                        updated[qIndex].options.push("");
                        setQuestions(updated);
                      }}
                      style={{ padding: "5px 10px", marginTop: "5px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                    >
                      Add Option
                    </button>
                  )}
                </div>
              )}

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Correct Answer:</label>
                {question.type === "multiple-choice" || question.type === "true-false" ? (
                  <select
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                    style={{ width: "100%", padding: "5px" }}
                    required
                  >
                    <option value="">Select correct answer</option>
                    {question.options.filter(o => o.trim()).map((option, oIndex) => (
                      <option key={oIndex} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    placeholder="Enter correct answer"
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                    rows="2"
                    style={{ width: "100%", padding: "5px" }}
                    required
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading || questions.length === 0} style={{ width: "100%", padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: loading ? "not-allowed" : "pointer", fontSize: "16px" }}>
          {loading ? "Scheduling..." : "Schedule Quiz"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: "10px", padding: "10px", backgroundColor: "#f8d7da", borderRadius: "5px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: "10px", padding: "10px", backgroundColor: "#d4edda", borderRadius: "5px" }}>{success}</div>}

      {quizzes.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Scheduled Quizzes</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Title</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Course</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Date</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Time</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Duration</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Marks</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Questions</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{quiz.title}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{quiz.courseCode}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {new Date(quiz.scheduledDate).toLocaleDateString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{quiz.scheduledTime}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{quiz.duration} min</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{quiz.totalMarks}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{quiz.questions?.length || 0}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{quiz.status}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <button
                      onClick={() => fetchSubmissions(quiz._id)}
                      style={{ padding: "5px 10px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                    >
                      View Submissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSubmissions && (
        <div style={{ marginTop: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3>Quiz Submissions {selectedQuiz && `- ${selectedQuiz.title}`}</h3>
            <button
              onClick={() => {
                setShowSubmissions(false);
                setSelectedQuiz(null);
                setSubmissions([]);
              }}
              style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
          {submissions.length === 0 ? (
            <p>No submissions yet.</p>
          ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Student</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Submitted At</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Score</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission._id}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {submission.studentId?.name || "Unknown"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{submission.status}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "-"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {submission.score !== null ? `${submission.score}/${submission.totalMarks}` : "-"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {submission.status === "Submitted" && (
                      <GradeQuizModal
                        submission={submission}
                        quizId={selectedQuiz?._id || submission.quizId}
                        onGrade={handleGrade}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}
    </div>
  );
}

function GradeQuizModal({ submission, quizId, onGrade }) {
  const [score, setScore] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuizDetails = async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/quizzes/${quizId}`);
      if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData);
      }
    } catch (err) {
      console.error("Error fetching quiz details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    if (!quiz) {
      fetchQuizDetails();
    }
  };

  const handleSubmit = () => {
    if (score && !isNaN(score)) {
      onGrade(quizId, submission._id, score, remarks);
      setShowModal(false);
      setScore("");
      setRemarks("");
    }
  };

  const getStudentAnswer = (questionId) => {
    const answerObj = submission.answers?.find(a => a.questionId === questionId);
    return answerObj ? answerObj.answer : "Not answered";
  };

  const calculateAutoScore = () => {
    if (!quiz || !quiz.questions) return 0;
    let totalScore = 0;
    quiz.questions.forEach(question => {
      const studentAnswer = getStudentAnswer(question.questionId);
      if (studentAnswer && studentAnswer !== "Not answered") {
        // For multiple choice and true/false, check if answer matches
        if (question.type === "multiple-choice" || question.type === "true-false") {
          if (String(studentAnswer).trim() === String(question.correctAnswer).trim()) {
            totalScore += question.marks;
          }
        }
        // For short-answer and essay, teacher needs to grade manually
      }
    });
    return totalScore;
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
      >
        Grade
      </button>
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "20px" }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "5px", maxWidth: "900px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>Grade Quiz - {submission.studentId?.name || "Student"}</h3>
              <button onClick={() => setShowModal(false)} style={{ padding: "5px 10px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            {loading ? (
              <p>Loading quiz details...</p>
            ) : quiz && quiz.questions ? (
              <>
                <div style={{ marginBottom: "20px" }}>
                  <h4>Quiz: {quiz.title}</h4>
                  <p><strong>Course:</strong> {quiz.courseCode} - {quiz.courseName}</p>
                  <p><strong>Total Marks:</strong> {quiz.totalMarks}</p>
                </div>

                <div style={{ marginBottom: "30px", maxHeight: "400px", overflowY: "auto", border: "1px solid #ddd", padding: "15px", borderRadius: "5px" }}>
                  <h4 style={{ marginBottom: "15px" }}>Questions and Answers:</h4>
                  {quiz.questions.map((question, index) => {
                    const studentAnswer = getStudentAnswer(question.questionId);
                    const isCorrect = question.type === "multiple-choice" || question.type === "true-false"
                      ? String(studentAnswer).trim() === String(question.correctAnswer).trim()
                      : null;

                    return (
                      <div key={question.questionId} style={{ marginBottom: "20px", padding: "15px", border: "1px solid #eee", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                          <h5 style={{ margin: 0 }}>Question {index + 1} ({question.marks} marks)</h5>
                          {isCorrect !== null && (
                            <span style={{ 
                              padding: "3px 8px", 
                              borderRadius: "3px", 
                              backgroundColor: isCorrect ? "#d4edda" : "#f8d7da",
                              color: isCorrect ? "#155724" : "#721c24",
                              fontSize: "12px"
                            }}>
                              {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                            </span>
                          )}
                        </div>
                        <p style={{ marginBottom: "10px", fontWeight: "bold" }}>{question.question}</p>

                        {question.type === "multiple-choice" && question.options && question.options.length > 0 && (
                          <div style={{ marginBottom: "10px" }}>
                            <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Options:</p>
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} style={{ 
                                padding: "5px", 
                                marginBottom: "3px",
                                backgroundColor: option === question.correctAnswer ? "#d4edda" : "transparent",
                                border: option === question.correctAnswer ? "1px solid #28a745" : "1px solid transparent"
                              }}>
                                {option}
                                {option === question.correctAnswer && <span style={{ marginLeft: "10px", color: "#28a745" }}>✓ Correct Answer</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "white", borderRadius: "3px" }}>
                          <p style={{ marginBottom: "5px", fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                            Student's Answer:
                          </p>
                          <p style={{ 
                            padding: "8px", 
                            backgroundColor: studentAnswer === "Not answered" ? "#fff3cd" : "#e7f3ff",
                            borderRadius: "3px",
                            margin: 0,
                            whiteSpace: "pre-wrap"
                          }}>
                            {studentAnswer}
                          </p>
                        </div>

                        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "3px" }}>
                          <p style={{ marginBottom: "5px", fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                            Correct Answer:
                          </p>
                          <p style={{ padding: "8px", backgroundColor: "white", borderRadius: "3px", margin: 0, whiteSpace: "pre-wrap" }}>
                            {question.correctAnswer}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop: "2px solid #ddd", paddingTop: "20px" }}>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                      Score (out of {submission.totalMarks}):
                    </label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        type="number"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        max={submission.totalMarks}
                        min="0"
                        step="0.5"
                        style={{ width: "150px", padding: "8px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "3px" }}
                        placeholder="Enter score"
                      />
                      <button
                        type="button"
                        onClick={() => setScore(calculateAutoScore())}
                        style={{ padding: "8px 12px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}
                        title="Auto-calculate score for multiple choice/true-false questions"
                      >
                        Auto Score
                      </button>
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        (Auto score: {calculateAutoScore()} - only for multiple choice/true-false)
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Remarks:</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows="3"
                      style={{ width: "100%", padding: "8px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "3px" }}
                      placeholder="Enter remarks or feedback..."
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={!score || isNaN(score)}
                      style={{ 
                        padding: "10px 20px", 
                        backgroundColor: score && !isNaN(score) ? "#28a745" : "#ccc", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "3px", 
                        cursor: score && !isNaN(score) ? "pointer" : "not-allowed" 
                      }}
                    >
                      Submit Grade
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p>No quiz details available.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
