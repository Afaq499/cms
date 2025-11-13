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
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

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

      const quizData = {
        ...formData,
        createdBy: user._id,
        duration: parseInt(formData.duration),
        totalMarks: parseInt(formData.totalMarks),
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
      fetchQuizzes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Schedule a Quiz</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Quiz Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="courseCode"
          placeholder="Course Code"
          value={formData.courseCode}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="courseName"
          placeholder="Course Name"
          value={formData.courseName}
          onChange={handleChange}
          required
        />
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
        <button type="submit" disabled={loading}>
          {loading ? "Scheduling..." : "Schedule Quiz"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: "10px" }}>{success}</div>}

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
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
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
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{quiz.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
