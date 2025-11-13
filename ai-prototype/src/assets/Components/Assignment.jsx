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
  const [selectedCourse, setSelectedCourse] = useState('CS505');
  const [filter, setFilter] = useState('all'); // 'all', 'submitted', 'pending', 'not-started'

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, selectedCourse, filter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/assignments`);
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      const data = await response.json();
      setAssignments(data);
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
    let filtered = assignments.filter(assignment => 
      assignment.courseCode === selectedCourse
    );

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
    const courseAssignments = assignments.filter(a => a.courseCode === courseCode);
    const total = courseAssignments.length;
    const submitted = courseAssignments.filter(a => a.status.toLowerCase() === 'submitted').length;
    const pending = courseAssignments.filter(a => a.status.toLowerCase() === 'pending').length;
    const notStarted = courseAssignments.filter(a => a.status.toLowerCase() === 'not started').length;
    
    return { total, submitted, pending, notStarted };
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
          <h3>Assignments - {selectedCourse}</h3>

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
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">No assignments found</td>
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
                        {assignment.score !== null ? `Score: ${assignment.score}` : '-'}
                      </td>
                      <td>{assignment.remarks || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Sidebar />
    </>
  );
};