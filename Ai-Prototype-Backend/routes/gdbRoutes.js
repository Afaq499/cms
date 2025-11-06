const express = require("express");
const router = express.Router();
const Gdb = require("../models/Gdb");

// GET all GDBs
router.get("/", async (req, res) => {
  try {
    const gdbs = await Gdb.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(gdbs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET GDBs by course code
router.get("/course/:courseCode", async (req, res) => {
  try {
    const gdbs = await Gdb.find({ courseCode: req.params.courseCode })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(gdbs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET GDB by ID
router.get("/:id", async (req, res) => {
  try {
    const gdb = await Gdb.findById(req.params.id).populate("createdBy", "name email");
    if (!gdb) {
      return res.status(404).json({ message: "GDB not found" });
    }
    res.json(gdb);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new GDB
router.post("/", async (req, res) => {
  try {
    const gdb = new Gdb(req.body);
    const savedGdb = await gdb.save();
    await savedGdb.populate("createdBy", "name email");
    res.status(201).json(savedGdb);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update GDB
router.put("/:id", async (req, res) => {
  try {
    const gdb = await Gdb.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");
    if (!gdb) {
      return res.status(404).json({ message: "GDB not found" });
    }
    res.json(gdb);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE GDB
router.delete("/:id", async (req, res) => {
  try {
    const gdb = await Gdb.findByIdAndDelete(req.params.id);
    if (!gdb) {
      return res.status(404).json({ message: "GDB not found" });
    }
    res.json({ message: "GDB deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

