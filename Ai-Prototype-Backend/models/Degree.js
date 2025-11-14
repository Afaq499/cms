const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true,
    trim: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  type: { 
    type: String, 
    enum: ["Required", "Elective"], 
    required: true 
  },
  creditHours: { 
    type: Number, 
    required: true 
  },
  semester: { 
    type: Number, 
    required: true 
  },
  group: { 
    type: String, 
    default: "" 
  },
}, { _id: true });

const degreeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  duration: {
    type: Number, // in years
    required: true,
    default: 4,
  },
  courses: [courseSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
degreeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Degree", degreeSchema);

