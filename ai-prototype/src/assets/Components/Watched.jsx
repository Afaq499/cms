import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import YouTube from "react-youtube";
import { Sidebar } from "./Sidbar";
import "./Watched.css";
import { API_URL } from "./constants";

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export function Watched() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const opts = {
    height: "315",
    width: "100%",
    playerVars: {
      autoplay: 0,
    },
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    // Get course code from URL query parameter
    const courseCode = searchParams.get("course");
    if (courseCode) {
      setSelectedCourse(courseCode);
      // Filter videos by course code
      const filtered = videos.filter(video => video.courseCode === courseCode);
      setFilteredVideos(filtered);
    } else {
      setSelectedCourse(null);
      setFilteredVideos(videos);
    }
  }, [searchParams, videos]);

  const fetchVideos = async () => {
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

      // Fetch dashboard data to get videos for student's courses
      const response = await fetch(`${API_URL}/dashboard/student/${studentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await response.json();

      // Collect all videos from all courses
      const allVideos = [];
      if (data.courses && Array.isArray(data.courses)) {
        data.courses.forEach(course => {
          if (course.videos && Array.isArray(course.videos)) {
            course.videos.forEach(video => {
              allVideos.push({
                ...video,
                courseCode: course.courseCode,
                courseTitle: course.courseTitle,
              });
            });
          }
        });
      }

      setVideos(allVideos);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(err.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  // Group videos into rows of 2
  const groupVideosIntoRows = (videos) => {
    const rows = [];
    for (let i = 0; i < videos.length; i += 2) {
      rows.push(videos.slice(i, i + 2));
    }
    return rows;
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="watched-page">
          <h1 className="watched-title">Recorded Classes</h1>
          <p>Loading videos...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="watched-page">
          <h1 className="watched-title">Recorded Classes</h1>
          <p style={{ color: "red" }}>Error: {error}</p>
          <button onClick={fetchVideos} style={{
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
      </>
    );
  }

  // Use filtered videos if a course is selected, otherwise use all videos
  const displayVideos = selectedCourse ? filteredVideos : videos;

  if (videos.length === 0) {
    return (
      <>
        <Sidebar />
        <div className="watched-page">
          <h1 className="watched-title">Recorded Classes</h1>
          <p>No lecture videos available at the moment.</p>
        </div>
      </>
    );
  }

  if (selectedCourse && filteredVideos.length === 0) {
    return (
      <>
        <Sidebar />
        <div className="watched-page">
          <h1 className="watched-title">Recorded Classes</h1>
          <p>No videos available for this course.</p>
          <button 
            onClick={() => {
              setSelectedCourse(null);
              setFilteredVideos(videos);
              navigate('/watched');
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Show All Videos
          </button>
        </div>
      </>
    );
  }

  const videoRows = groupVideosIntoRows(displayVideos);

  return (
    <>
      <Sidebar />
      <div className="watched-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 className="watched-title">Recorded Classes</h1>
          {selectedCourse && (
            <button 
              onClick={() => {
                setSelectedCourse(null);
                setFilteredVideos(videos);
                navigate('/watched');
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Show All Videos
            </button>
          )}
        </div>
        {selectedCourse && (
          <p style={{ marginBottom: "20px", color: "#666", fontSize: "14px" }}>
            Showing videos for: <strong>{selectedCourse}</strong>
          </p>
        )}

        {videoRows.map((row, rowIndex) => (
          <div key={rowIndex} className="watchMain cols-two">
            {row.map((video, videoIndex) => {
              const videoId = extractYouTubeId(video.youtubeUrl);
              if (!videoId) {
                return (
                  <div key={`${video.id}-${videoIndex}`} className="watchchild">
                    <p>Invalid video URL: {video.title}</p>
                  </div>
                );
              }

              return (
                <div key={`${video.id}-${videoIndex}`} className="watchchild">
                  <div style={{ marginBottom: "10px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "5px", color: "#2c3e50" }}>
                      {video.title}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
                      {video.courseCode} - {video.courseTitle}
                    </p>
                    {video.description && (
                      <p style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>
                        {video.description}
                      </p>
                    )}
                  </div>
                  <YouTube videoId={videoId} opts={opts} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
