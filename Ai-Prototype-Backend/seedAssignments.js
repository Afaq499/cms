const mongoose = require("mongoose");
const Assignment = require("./models/Assignment");
require("dotenv").config();

const connectDB = require("./config/db");

const sampleAssignments = [
  // CS505 - Virtual Systems and Services
  {
    assignmentNumber: "Assignment # 01",
    title: "Cloud Infrastructure Design",
    dueDate: new Date("2025-09-15"),
    totalMarks: 20,
    status: "Submitted",
    submittedDate: new Date("2025-09-14"),
    score: 15.0,
    remarks: "Good work, minor improvements needed",
    courseCode: "CS505",
    courseName: "Virtual Systems and Services",
    description: "Design a scalable cloud infrastructure for a web application",
    instructions: "Create a detailed architecture diagram and explain your design choices"
  },
  {
    assignmentNumber: "Assignment # 02",
    title: "Docker Containerization",
    dueDate: new Date("2025-09-25"),
    totalMarks: 20,
    status: "Submitted",
    submittedDate: new Date("2025-09-24"),
    score: 17.0,
    remarks: "Excellent implementation",
    courseCode: "CS505",
    courseName: "Virtual Systems and Services",
    description: "Containerize a multi-tier application using Docker",
    instructions: "Create Dockerfiles and docker-compose.yml for the application"
  },
  {
    assignmentNumber: "Assignment # 03",
    title: "Kubernetes Deployment",
    dueDate: new Date("2025-10-05"),
    totalMarks: 20,
    status: "Pending",
    submittedDate: null,
    score: null,
    remarks: "",
    courseCode: "CS505",
    courseName: "Virtual Systems and Services",
    description: "Deploy containerized application on Kubernetes cluster",
    instructions: "Create deployment manifests and service configurations"
  },
  {
    assignmentNumber: "Assignment # 04",
    title: "Microservices Architecture",
    dueDate: new Date("2025-10-20"),
    totalMarks: 25,
    status: "Not Started",
    submittedDate: null,
    score: null,
    remarks: "",
    courseCode: "CS505",
    courseName: "Virtual Systems and Services",
    description: "Design and implement a microservices-based system",
    instructions: "Break down monolithic application into microservices"
  },

  // CS301 - Data Structures and Algorithms
  {
    assignmentNumber: "Assignment # 01",
    title: "Binary Search Tree Implementation",
    dueDate: new Date("2025-09-10"),
    totalMarks: 15,
    status: "Submitted",
    submittedDate: new Date("2025-09-09"),
    score: 14.0,
    remarks: "Perfect implementation",
    courseCode: "CS301",
    courseName: "Data Structures and Algorithms",
    description: "Implement BST with insert, delete, and search operations",
    instructions: "Use Java or C++ to implement the data structure"
  },
  {
    assignmentNumber: "Assignment # 02",
    title: "Graph Algorithms",
    dueDate: new Date("2025-09-30"),
    totalMarks: 20,
    status: "Submitted",
    submittedDate: new Date("2025-09-29"),
    score: 18.0,
    remarks: "Good understanding of algorithms",
    courseCode: "CS301",
    courseName: "Data Structures and Algorithms",
    description: "Implement BFS, DFS, and shortest path algorithms",
    instructions: "Solve the given graph problems using appropriate algorithms"
  },
  {
    assignmentNumber: "Assignment # 03",
    title: "Dynamic Programming",
    dueDate: new Date("2025-10-15"),
    totalMarks: 25,
    status: "Pending",
    submittedDate: null,
    score: null,
    remarks: "",
    courseCode: "CS301",
    courseName: "Data Structures and Algorithms",
    description: "Solve optimization problems using dynamic programming",
    instructions: "Implement solutions for knapsack and coin change problems"
  },

  // CS401 - Software Engineering
  {
    assignmentNumber: "Assignment # 01",
    title: "Requirements Analysis",
    dueDate: new Date("2025-09-12"),
    totalMarks: 18,
    status: "Submitted",
    submittedDate: new Date("2025-09-11"),
    score: 16.0,
    remarks: "Comprehensive analysis",
    courseCode: "CS401",
    courseName: "Software Engineering",
    description: "Analyze requirements for a library management system",
    instructions: "Create use case diagrams and requirement specifications"
  },
  {
    assignmentNumber: "Assignment # 02",
    title: "System Design Document",
    dueDate: new Date("2025-09-28"),
    totalMarks: 22,
    status: "Submitted",
    submittedDate: new Date("2025-09-27"),
    score: 20.0,
    remarks: "Well-structured design",
    courseCode: "CS401",
    courseName: "Software Engineering",
    description: "Create detailed system design for the library management system",
    instructions: "Include architecture diagrams and database schema"
  },
  {
    assignmentNumber: "Assignment # 03",
    title: "Testing Strategy",
    dueDate: new Date("2025-10-12"),
    totalMarks: 20,
    status: "Pending",
    submittedDate: null,
    score: null,
    remarks: "",
    courseCode: "CS401",
    courseName: "Software Engineering",
    description: "Develop comprehensive testing strategy",
    instructions: "Create test cases and testing documentation"
  },

  // CS201 - Programming Fundamentals
  {
    assignmentNumber: "Assignment # 01",
    title: "Basic Programming Concepts",
    dueDate: new Date("2025-09-08"),
    totalMarks: 12,
    status: "Submitted",
    submittedDate: new Date("2025-09-07"),
    score: 11.0,
    remarks: "Good understanding of basics",
    courseCode: "CS201",
    courseName: "Programming Fundamentals",
    description: "Solve basic programming problems using loops and conditions",
    instructions: "Write programs for given problem statements"
  },
  {
    assignmentNumber: "Assignment # 02",
    title: "Object-Oriented Programming",
    dueDate: new Date("2025-09-22"),
    totalMarks: 15,
    status: "Submitted",
    submittedDate: new Date("2025-09-21"),
    score: 13.0,
    remarks: "Good OOP concepts",
    courseCode: "CS201",
    courseName: "Programming Fundamentals",
    description: "Implement classes and objects for a student management system",
    instructions: "Create classes with proper encapsulation and inheritance"
  },
  {
    assignmentNumber: "Assignment # 03",
    title: "File Handling",
    dueDate: new Date("2025-10-08"),
    totalMarks: 18,
    status: "Pending",
    submittedDate: null,
    score: null,
    remarks: "",
    courseCode: "CS201",
    courseName: "Programming Fundamentals",
    description: "Implement file I/O operations for data persistence",
    instructions: "Create programs to read from and write to files"
  },

  // CS601 - Machine Learning
  {
    assignmentNumber: "Assignment # 01",
    title: "Linear Regression Implementation",
    dueDate: new Date("2025-09-18"),
    totalMarks: 25,
    status: "Submitted",
    submittedDate: new Date("2025-09-17"),
    score: 22.0,
    remarks: "Excellent implementation with good accuracy",
    courseCode: "CS601",
    courseName: "Machine Learning",
    description: "Implement linear regression from scratch using Python",
    instructions: "Use gradient descent and compare with sklearn implementation"
  },
  {
    assignmentNumber: "Assignment # 02",
    title: "Classification Algorithms",
    dueDate: new Date("2025-10-02"),
    totalMarks: 30,
    status: "Submitted",
    submittedDate: new Date("2025-10-01"),
    score: 27.0,
    remarks: "Good comparison of different algorithms",
    courseCode: "CS601",
    courseName: "Machine Learning",
    description: "Compare different classification algorithms on a dataset",
    instructions: "Implement and compare SVM, Random Forest, and Neural Networks"
  },
  {
    assignmentNumber: "Assignment # 03",
    title: "Deep Learning Project",
    dueDate: new Date("2025-10-25"),
    totalMarks: 35,
    status: "Pending",
    submittedDate: null,
    score: null,
    remarks: "",
    courseCode: "CS601",
    courseName: "Machine Learning",
    description: "Build a deep learning model for image classification",
    instructions: "Use CNN architecture and train on CIFAR-10 dataset"
  },

  // CS501 - Database Systems
  {
    assignmentNumber: "Assignment # 01",
    title: "Database Design",
    dueDate: new Date("2025-09-14"),
    totalMarks: 20,
    status: "Submitted",
    submittedDate: new Date("2025-09-13"),
    score: 18.0,
    remarks: "Well-normalized database design",
    courseCode: "CS501",
    courseName: "Database Systems",
    description: "Design database schema for an e-commerce system",
    instructions: "Create ER diagram and normalized tables"
  },
  {
    assignmentNumber: "Assignment # 02",
    title: "SQL Queries",
    dueDate: new Date("2025-09-30"),
    totalMarks: 18,
    status: "Submitted",
    submittedDate: new Date("2025-09-29"),
    score: 16.0,
    remarks: "Good understanding of complex queries",
    courseCode: "CS501",
    courseName: "Database Systems",
    description: "Write complex SQL queries for data analysis",
    instructions: "Solve given business problems using SQL"
  },
  {
    assignmentNumber: "Assignment # 03",
    title: "Database Optimization",
    dueDate: new Date("2025-10-18"),
    totalMarks: 22,
    status: "Pending",
    submittedDate: null,
    score: null,
    remarks: "",
    courseCode: "CS501",
    courseName: "Database Systems",
    description: "Optimize database performance using indexing and query optimization",
    instructions: "Analyze query performance and implement optimizations"
  }
];

const seedAssignments = async () => {
  try {
    await connectDB();
    
    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log("Cleared existing assignments");
    
    // Insert sample assignments
    await Assignment.insertMany(sampleAssignments);
    console.log("Sample assignments inserted successfully");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding assignments:", error);
    process.exit(1);
  }
};

seedAssignments();
