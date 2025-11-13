import React, { useState, useEffect } from "react";
import { API_URL } from "./constants";

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Helper function to get embed URL
const getEmbedUrl = (url) => {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

export function LectureVideos() {
  const [formData, setFormData] = useState({
    title: "",
    youtubeUrl: "",
    courseCode: "",
    courseName: "",
    description: "",
  });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/videos`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
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
      // Validate YouTube URL
      const videoId = extractYouTubeId(formData.youtubeUrl);
      if (!videoId) {
        throw new Error("Please enter a valid YouTube URL");
      }

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user._id) {
        throw new Error("User not logged in");
      }

      const videoData = {
        ...formData,
        createdBy: user._id,
      };

      const response = await fetch(`${API_URL}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(videoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload video");
      }

      const newVideo = await response.json();
      setSuccess("Video uploaded successfully!");
      setFormData({
        title: "",
        youtubeUrl: "",
        courseCode: "",
        courseName: "",
        description: "",
      });
      fetchVideos();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="table-container">
      <h2>Lecture Videos</h2>

      {/* Upload Form */}
      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "5px" }}>
        <h3>Upload YouTube Video</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Video Title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
          <input
            type="url"
            name="youtubeUrl"
            placeholder="YouTube Video URL (e.g., https://www.youtube.com/watch?v=...)"
            value={formData.youtubeUrl}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
          <input
            type="text"
            name="courseCode"
            placeholder="Course Code"
            value={formData.courseCode}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
          <input
            type="text"
            name="courseName"
            placeholder="Course Name"
            value={formData.courseName}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
          <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
            {loading ? "Uploading..." : "Upload Video"}
          </button>
        </form>

        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
        {success && <div style={{ color: "green", marginTop: "10px" }}>{success}</div>}
      </div>

      {/* Video List */}
      {videos.length === 0 ? (
        <p>No videos uploaded yet.</p>
      ) : (
        <div>
          <h3>Uploaded Videos</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "20px" }}>
            {videos.map((video) => {
              const embedUrl = getEmbedUrl(video.youtubeUrl);
              const thumbnailUrl = embedUrl ? `https://img.youtube.com/vi/${extractYouTubeId(video.youtubeUrl)}/0.jpg` : null;

              return (
                <div
                  key={video._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    overflow: "hidden",
                    backgroundColor: "#f9f9f9",
                    cursor: "pointer",
                  }}
                  onClick={() => handlePlayVideo(video)}
                >
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={video.title}
                      style={{ width: "100%", height: "200px", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "200px", backgroundColor: "#ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      Video Thumbnail
                    </div>
                  )}
                  <div style={{ padding: "15px" }}>
                    <h4 style={{ margin: "0 0 10px 0" }}>{video.title}</h4>
                    <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                      <strong>Course:</strong> {video.courseCode}
                    </p>
                    {video.description && (
                      <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                        {video.description.substring(0, 100)}...
                      </p>
                    )}
                    <button
                      style={{
                        marginTop: "10px",
                        padding: "8px 15px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVideo(video);
                      }}
                    >
                      Play Video
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseVideo}
        >
          <div
            style={{
              position: "relative",
              width: "90%",
              maxWidth: "1200px",
              backgroundColor: "#000",
              padding: "20px",
              borderRadius: "5px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseVideo}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              ×
            </button>
            <h3 style={{ color: "#fff", marginBottom: "15px" }}>{selectedVideo.title}</h3>
            {getEmbedUrl(selectedVideo.youtubeUrl) ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
                <iframe
                  src={getEmbedUrl(selectedVideo.youtubeUrl)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            ) : (
              <p style={{ color: "#fff" }}>Invalid video URL</p>
            )}
            {selectedVideo.description && (
              <p style={{ color: "#fff", marginTop: "15px" }}>{selectedVideo.description}</p>
            )}
            <p style={{ color: "#ccc", marginTop: "10px", fontSize: "14px" }}>
              <strong>Course:</strong> {selectedVideo.courseCode} - {selectedVideo.courseName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
