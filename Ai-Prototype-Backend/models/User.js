const mongoose = require("mongoose");
const bcrypt = require("bcrypt");  // only once

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,    
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,  
  },
  password: {
    type: String,
    required: true,
    minlength: 6,        
  },
  role: {
    type: String,
    enum: ["Student", "Teacher", "Admin"],
    default: "Student",
  },
  // Student specific fields
  degree: {
    type: String,
    trim: true,
  },
  studentId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  address: {
    type: String,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  batch: {
    type: String,
    trim: true,
  },
  // Teacher specific fields
  subject: {
    type: String,
    trim: true,
  },
  courses: {
    type: [String], // Array of course codes
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log("candidatePassword =>", candidatePassword)
  console.log("this.password => ", this.password)
  return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model("User", userSchema);
