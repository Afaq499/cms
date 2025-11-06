const express = require("express");
const router = express.Router();
const LectureVideo = require("../models/LectureVideo");

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// GET all lecture videos
router.get("/", async (req, res) => {
  try {
    const videos = await LectureVideo.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET videos by course code
router.get("/course/:courseCode", async (req, res) => {
  try {
    const videos = await LectureVideo.find({ courseCode: req.params.courseCode })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET video by ID
router.get("/:id", async (req, res) => {
  try {
    const video = await LectureVideo.findById(req.params.id).populate("createdBy", "name email");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new lecture video
router.post("/", async (req, res) => {
  try {
    const { youtubeUrl } = req.body;
    
    // Validate YouTube URL
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    const video = new LectureVideo(req.body);
    const savedVideo = await video.save();
    await savedVideo.populate("createdBy", "name email");
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update lecture video
router.put("/:id", async (req, res) => {
  try {
    if (req.body.youtubeUrl) {
      const videoId = extractYouTubeId(req.body.youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }
    }

    const video = await LectureVideo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE lecture video
router.delete("/:id", async (req, res) => {
  try {
    const video = await LectureVideo.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

