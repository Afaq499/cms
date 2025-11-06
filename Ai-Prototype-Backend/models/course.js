const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["Required", "Elective"], required: true },
  creditHours: { type: Number, required: true },
  group: { type: String, default: "" },
  status: { type: String, enum: ["Studied", "Pending", "Fail"], default: "Pending" },
  semester: { type: Number, required: true }, // e.g. 1, 2, 3 ...
});

module.exports = mongoose.model("Course", courseSchema);
