import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Assignment.css";
import { Sidebar } from "./Sidbar";
import { API_URL } from "./constants";

export function Assignment() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'submitted', 'pending', 'not-started'
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  
  // Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [gradeScore, setGradeScore] = useState('');
  const [gradeRemarks, setGradeRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser) {
      setUser(currentUser);
      const role = currentUser.role || 'Student';
      setUserRole(role);
      // For teachers, default to showing submitted assignments
      if (role === 'Teacher') {
        setFilter('submitted');
      }
    }
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, selectedCourse, filter, user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/assignments`);
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      const data = await response.json();
      
      // Filter assignments based on user role
      const currentUser = JSON.parse(localStorage.getItem("user"));
      let filteredData = data;
      
      if (currentUser && currentUser.role === 'Student') {
        // For students, show all assignments (they can submit any assignment)
        // But we can filter to show only their submissions if needed
        filteredData = data;
      } else if (currentUser && currentUser.role === 'Teacher') {
        // For teachers, show assignments they created
        filteredData = data.filter(assignment => {
          const teacherId = assignment.teacherId?._id || assignment.teacherId;
          return teacherId === currentUser._id;
        });
      }
      
      setAssignments(filteredData);
      
      // Set default course if available
      if (filteredData.length > 0 && !selectedCourse) {
        setSelectedCourse(filteredData[0].courseCode);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
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

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'status-submitted';
      case 'pending':
        return 'status-pending';
      case 'late':
        return 'status-late';
      case 'not started':
        return 'status-not-started';
      default:
        return 'status-pending';
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;
    
    // Filter by course if a course is selected
    if (selectedCourse) {
      filtered = filtered.filter(assignment => 
        assignment.courseCode === selectedCourse
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter(assignment => {
        switch (filter) {
          case 'submitted':
            return assignment.status.toLowerCase() === 'submitted';
          case 'pending':
            return assignment.status.toLowerCase() === 'pending';
          case 'not-started':
            return assignment.status.toLowerCase() === 'not started';
          default:
            return true;
        }
      });
    }

    setFilteredAssignments(filtered);
  };

  const handleCourseChange = (courseCode) => {
    setSelectedCourse(courseCode);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const getUniqueCourses = () => {
    const courses = [...new Set(assignments.map(assignment => assignment.courseCode))];
    return courses.map(courseCode => {
      const course = assignments.find(a => a.courseCode === courseCode);
      return {
        code: courseCode,
        name: course.courseName
      };
    });
  };

  const getCourseStats = (courseCode) => {
    const courseAssignments = courseCode 
      ? assignments.filter(a => a.courseCode === courseCode)
      : assignments;
    const total = courseAssignments.length;
    const submitted = courseAssignments.filter(a => a.status.toLowerCase() === 'submitted').length;
    const pending = courseAssignments.filter(a => a.status.toLowerCase() === 'pending').length;
    const notStarted = courseAssignments.filter(a => a.status.toLowerCase() === 'not started').length;
    
    return { total, submitted, pending, notStarted };
  };

  // Handle assignment submission (for students)
  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !submissionText.trim()) {
      alert('Please provide submission details');
      return;
    }

    try {
      setSubmitting(true);
      const currentUser = JSON.parse(localStorage.getItem("user"));
      
      const response = await fetch(`${API_URL}/assignments/${selectedAssignment._id}/submit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: currentUser._id,
          submissionText: submissionText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit assignment');
      }

      await fetchAssignments();
      setShowSubmitModal(false);
      setSubmissionText('');
      setSelectedAssignment(null);
      alert('Assignment submitted successfully!');
    } catch (err) {
      alert(err.message || 'Error submitting assignment');
      console.error('Error submitting assignment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle assignment grading (for teachers)
  const handleGradeAssignment = async () => {
    if (!selectedAssignment || !gradeScore) {
      alert('Please provide a score');
      return;
    }

    const score = parseFloat(gradeScore);
    if (isNaN(score) || score < 0 || score > selectedAssignment.totalMarks) {
      alert(`Score must be between 0 and ${selectedAssignment.totalMarks}`);
      return;
    }

    try {
      setGrading(true);
      
      const response = await fetch(`${API_URL}/assignments/${selectedAssignment._id}/grade`, {
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

      await fetchAssignments();
      setShowGradeModal(false);
      setGradeScore('');
      setGradeRemarks('');
      setSelectedAssignment(null);
      alert('Assignment graded successfully!');
    } catch (err) {
      alert(err.message || 'Error grading assignment');
      console.error('Error grading assignment:', err);
    } finally {
      setGrading(false);
    }
  };

  // Open submit modal
  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText('');
    setShowSubmitModal(true);
  };

  // Open grade modal
  const openGradeModal = (assignment) => {
    setSelectedAssignment(assignment);
    setGradeScore(assignment.score || '');
    setGradeRemarks(assignment.remarks || '');
    setShowGradeModal(true);
  };

  if (loading) {
    return (
      <div className="assignmentmain">
        <div className="loading">Loading assignments...</div>
        <Sidebar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="assignmentmain">
        <div className="error">Error: {error}</div>
        <button onClick={fetchAssignments} className="retry-btn">Retry</button>
        <Sidebar />
      </div>
    );
  }

  const courses = getUniqueCourses();
  const stats = getCourseStats(selectedCourse);

  return (
    <>
      <div className="assignmentmain">
        <h3>Assignment Management System</h3>
        
        {/* Course Selection */}
        {courses.length > 0 && (
          <div className="course-selection">
            <h2>Select Course:</h2>
            <div className="course-buttons">
              {courses.map(course => (
                <button
                  key={course.code}
                  className={`course-btn ${selectedCourse === course.code ? 'active' : ''}`}
                  onClick={() => handleCourseChange(course.code)}
                >
                  {course.code} - {course.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Course Stats */}
        <div className="assignment-stats">
          <div className="stat-card">
            <h4>Total Assignments</h4>
            <p>{stats.total}</p>
          </div>
          <div className="stat-card submitted">
            <h4>Submitted</h4>
            <p>{stats.submitted}</p>
          </div>
          <div className="stat-card pending">
            <h4>Pending</h4>
            <p>{stats.pending}</p>
          </div>
          <div className="stat-card not-started">
            <h4>Not Started</h4>
            <p>{stats.notStarted}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="assignment-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All ({stats.total})
          </button>
          <button 
            className={`filter-btn ${filter === 'submitted' ? 'active' : ''}`}
            onClick={() => handleFilterChange('submitted')}
          >
            Submitted ({stats.submitted})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => handleFilterChange('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button 
            className={`filter-btn ${filter === 'not-started' ? 'active' : ''}`}
            onClick={() => handleFilterChange('not-started')}
          >
            Not Started ({stats.notStarted})
          </button>
        </div>

        <div className="assignmentcolor">
          <h3>Assignments{selectedCourse ? ` - ${selectedCourse}` : ''}</h3>

          <div className="assignmentdiv">
            <table border="1" cellPadding="8" cellSpacing="0">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Title</th>
                  <th>Due Date</th>
                  <th>Total Marks</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Remarks</th>
                  {userRole === 'Student' && <th>Actions</th>}
                  {userRole === 'Teacher' && <th>Student</th>}
                  {userRole === 'Teacher' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === 'Teacher' ? 9 : 8} className="no-data">No assignments found</td>
                  </tr>
                ) : (
                  filteredAssignments.map((assignment, index) => (
                    <tr key={assignment._id || index}>
                      <td>{assignment.assignmentNumber}</td>
                      <td>{assignment.title}</td>
                      <td>{formatDate(assignment.dueDate)}</td>
                      <td>{assignment.totalMarks} Marks</td>
                      <td>
                        <span className={`status ${getStatusClass(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td>
                        {assignment.score !== null && assignment.score !== undefined 
                          ? `${assignment.score}/${assignment.totalMarks}` 
                          : '-'}
                      </td>
                      <td>{assignment.remarks || '-'}</td>
                      {userRole === 'Student' && (
                        <td>
                          {assignment.status.toLowerCase() !== 'submitted' && (
                            <button
                              className="submit-btn"
                              onClick={() => openSubmitModal(assignment)}
                            >
                              Submit
                            </button>
                          )}
                        </td>
                      )}
                      {userRole === 'Teacher' && (
                        <>
                          <td>
                            {assignment.studentId 
                              ? (assignment.studentId.name || assignment.studentId.email || 'N/A')
                              : 'Unassigned'}
                          </td>
                          <td>
                            {assignment.status.toLowerCase() === 'submitted' && (
                              <button
                                className="grade-btn"
                                onClick={() => openGradeModal(assignment)}
                              >
                                Grade
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Assignment Modal (for Students) */}
        {showSubmitModal && selectedAssignment && (
          <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Submit Assignment</h3>
                <button className="modal-close" onClick={() => setShowSubmitModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p><strong>Assignment:</strong> {selectedAssignment.assignmentNumber} - {selectedAssignment.title}</p>
                <p><strong>Course:</strong> {selectedAssignment.courseCode} - {selectedAssignment.courseName}</p>
                <p><strong>Due Date:</strong> {formatDate(selectedAssignment.dueDate)}</p>
                {selectedAssignment.description && (
                  <div>
                    <strong>Description:</strong>
                    <p>{selectedAssignment.description}</p>
                  </div>
                )}
                {selectedAssignment.instructions && (
                  <div>
                    <strong>Instructions:</strong>
                    <p>{selectedAssignment.instructions}</p>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="submissionText">Submission Details / Notes:</label>
                  <textarea
                    id="submissionText"
                    rows="6"
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Enter your submission details, notes, or file links here..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowSubmitModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-submit" 
                  onClick={handleSubmitAssignment}
                  disabled={submitting || !submissionText.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grade Assignment Modal (for Teachers) */}
        {showGradeModal && selectedAssignment && (
          <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Grade Assignment</h3>
                <button className="modal-close" onClick={() => setShowGradeModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p><strong>Assignment:</strong> {selectedAssignment.assignmentNumber} - {selectedAssignment.title}</p>
                <p><strong>Student:</strong> {
                  selectedAssignment.studentId 
                    ? (selectedAssignment.studentId.name || selectedAssignment.studentId.email || 'N/A')
                    : 'N/A'
                }</p>
                <p><strong>Course:</strong> {selectedAssignment.courseCode} - {selectedAssignment.courseName}</p>
                <p><strong>Total Marks:</strong> {selectedAssignment.totalMarks}</p>
                <p><strong>Submitted Date:</strong> {formatDate(selectedAssignment.submittedDate)}</p>
                {selectedAssignment.submissionText && (
                  <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Student Submission:</strong>
                    <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{selectedAssignment.submissionText}</p>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="gradeScore">Score (out of {selectedAssignment.totalMarks}):</label>
                  <input
                    type="number"
                    id="gradeScore"
                    min="0"
                    max={selectedAssignment.totalMarks}
                    step="0.5"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gradeRemarks">Remarks:</label>
                  <textarea
                    id="gradeRemarks"
                    rows="4"
                    value={gradeRemarks}
                    onChange={(e) => setGradeRemarks(e.target.value)}
                    placeholder="Enter feedback or remarks..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowGradeModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-submit" 
                  onClick={handleGradeAssignment}
                  disabled={grading || !gradeScore}
                >
                  {grading ? 'Grading...' : 'Submit Grade'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Sidebar />
    </>
  );
};