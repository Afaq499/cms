const express = require("express");
const router = express.Router();
const Fee = require("../models/Fee");

// GET all fees
router.get("/", async (req, res) => {
  try {
    const fees = await Fee.find().sort({ dueDate: 1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET fee by ID
router.get("/:id", async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new fee
router.post("/", async (req, res) => {
  try {
    const fee = new Fee(req.body);
    const savedFee = await fee.save();
    res.status(201).json(savedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update fee
router.put("/:id", async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }
    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE fee
router.delete("/:id", async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }
    res.json({ message: "Fee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
