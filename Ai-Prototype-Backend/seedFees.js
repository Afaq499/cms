const mongoose = require("mongoose");
const Fee = require("./models/Fee");
require("dotenv").config();

const connectDB = require("./config/db");

const sampleFees = [
  // Academic Year 2024-2025 Fees
  {
    feeType: "Admission Fee",
    amount: 25000,
    dueDate: new Date("2024-08-15"),
    status: "Paid",
    paidDate: new Date("2024-08-10"),
    remarks: "Confirmed"
  },
  {
    feeType: "Registration Fee",
    amount: 5000,
    dueDate: new Date("2024-08-20"),
    status: "Paid",
    paidDate: new Date("2024-08-18"),
    remarks: "Confirmed"
  },
  {
    feeType: "Library Fee",
    amount: 3000,
    dueDate: new Date("2024-08-25"),
    status: "Paid",
    paidDate: new Date("2024-08-22"),
    remarks: "Confirmed"
  },
  {
    feeType: "Laboratory Fee",
    amount: 8000,
    dueDate: new Date("2024-09-01"),
    status: "Paid",
    paidDate: new Date("2024-08-28"),
    remarks: "Confirmed"
  },
  {
    feeType: "Semester Fee - Fall 2024",
    amount: 50000,
    dueDate: new Date("2024-09-15"),
    status: "Paid",
    paidDate: new Date("2024-09-12"),
    remarks: "Confirmed"
  },
  {
    feeType: "Student Activity Fee",
    amount: 2000,
    dueDate: new Date("2024-09-20"),
    status: "Paid",
    paidDate: new Date("2024-09-18"),
    remarks: "Confirmed"
  },
  {
    feeType: "Health Services Fee",
    amount: 1500,
    dueDate: new Date("2024-10-01"),
    status: "Paid",
    paidDate: new Date("2024-09-28"),
    remarks: "Confirmed"
  },
  {
    feeType: "Technology Fee",
    amount: 4000,
    dueDate: new Date("2024-10-15"),
    status: "Paid",
    paidDate: new Date("2024-10-12"),
    remarks: "Confirmed"
  },
  {
    feeType: "Mid-Term Examination Fee",
    amount: 3000,
    dueDate: new Date("2024-11-01"),
    status: "Paid",
    paidDate: new Date("2024-10-28"),
    remarks: "Confirmed"
  },
  {
    feeType: "Final Examination Fee",
    amount: 5000,
    dueDate: new Date("2024-12-15"),
    status: "Paid",
    paidDate: new Date("2024-12-10"),
    remarks: "Confirmed"
  },
  
  // Academic Year 2025 Fees
  {
    feeType: "Semester Fee - Spring 2025",
    amount: 50000,
    dueDate: new Date("2025-02-20"),
    status: "Paid",
    paidDate: new Date("2025-02-18"),
    remarks: "Confirmed"
  },
  {
    feeType: "Library Fee - Spring",
    amount: 3000,
    dueDate: new Date("2025-02-25"),
    status: "Paid",
    paidDate: new Date("2025-02-22"),
    remarks: "Confirmed"
  },
  {
    feeType: "Laboratory Fee - Spring",
    amount: 8000,
    dueDate: new Date("2025-03-01"),
    status: "Paid",
    paidDate: new Date("2025-02-26"),
    remarks: "Confirmed"
  },
  {
    feeType: "Student Activity Fee - Spring",
    amount: 2000,
    dueDate: new Date("2025-03-10"),
    status: "Paid",
    paidDate: new Date("2025-03-08"),
    remarks: "Confirmed"
  },
  {
    feeType: "Technology Fee - Spring",
    amount: 4000,
    dueDate: new Date("2025-03-15"),
    status: "Paid",
    paidDate: new Date("2025-03-12"),
    remarks: "Confirmed"
  },
  {
    feeType: "Mid-Term Examination Fee - Spring",
    amount: 3000,
    dueDate: new Date("2025-04-01"),
    status: "Paid",
    paidDate: new Date("2025-03-28"),
    remarks: "Confirmed"
  },
  {
    feeType: "Final Examination Fee - Spring",
    amount: 5000,
    dueDate: new Date("2025-05-15"),
    status: "Paid",
    paidDate: new Date("2025-05-10"),
    remarks: "Confirmed"
  },
  
  // Summer Semester 2025
  {
    feeType: "Summer Semester Fee",
    amount: 25000,
    dueDate: new Date("2025-06-15"),
    status: "Paid",
    paidDate: new Date("2025-06-12"),
    remarks: "Confirmed"
  },
  {
    feeType: "Summer Laboratory Fee",
    amount: 4000,
    dueDate: new Date("2025-06-20"),
    status: "Paid",
    paidDate: new Date("2025-06-18"),
    remarks: "Confirmed"
  },
  
  // Fall Semester 2025 (Current/Pending)
  {
    feeType: "Semester Fee - Fall 2025",
    amount: 50000,
    dueDate: new Date("2025-09-25"),
    status: "Pending",
    paidDate: null,
    remarks: "Due Soon"
  },
  {
    feeType: "Library Fee - Fall",
    amount: 3000,
    dueDate: new Date("2025-10-01"),
    status: "Pending",
    paidDate: null,
    remarks: "Not Yet Due"
  },
  {
    feeType: "Laboratory Fee - Fall",
    amount: 8000,
    dueDate: new Date("2025-10-05"),
    status: "Pending",
    paidDate: null,
    remarks: "Not Yet Due"
  },
  {
    feeType: "Student Activity Fee - Fall",
    amount: 2000,
    dueDate: new Date("2025-10-10"),
    status: "Pending",
    paidDate: null,
    remarks: "Not Yet Due"
  },
  {
    feeType: "Technology Fee - Fall",
    amount: 4000,
    dueDate: new Date("2025-10-15"),
    status: "Pending",
    paidDate: null,
    remarks: "Not Yet Due"
  },
  {
    feeType: "Health Services Fee - Fall",
    amount: 1500,
    dueDate: new Date("2025-10-20"),
    status: "Pending",
    paidDate: null,
    remarks: "Not Yet Due"
  },
  {
    feeType: "Mid-Term Examination Fee - Fall",
    amount: 3000,
    dueDate: new Date("2025-11-01"),
    status: "Pending",
    paidDate: null,
    remarks: "Not Yet Due"
  },
  {
    feeType: "Final Examination Fee - Fall",
    amount: 5000,
    dueDate: new Date("2025-12-15"),
    status: "Pending",
    paidDate: null,
    remarks: "Not Yet Due"
  },
  
  // Additional Fees
  {
    feeType: "Graduation Fee",
    amount: 10000,
    dueDate: new Date("2025-12-01"),
    status: "Pending",
    paidDate: null,
    remarks: "For Graduating Students"
  },
  {
    feeType: "Transcript Fee",
    amount: 1000,
    dueDate: new Date("2025-12-10"),
    status: "Pending",
    paidDate: null,
    remarks: "Official Transcript"
  },
  {
    feeType: "Late Registration Fee",
    amount: 2000,
    dueDate: new Date("2025-09-30"),
    status: "Pending",
    paidDate: null,
    remarks: "Late Registration Penalty"
  },
  {
    feeType: "ID Card Replacement Fee",
    amount: 500,
    dueDate: new Date("2025-10-01"),
    status: "Pending",
    paidDate: null,
    remarks: "Lost ID Card"
  }
];

const seedFees = async () => {
  try {
    await connectDB();
    
    // Clear existing fees
    await Fee.deleteMany({});
    console.log("Cleared existing fees");
    
    // Insert sample fees
    await Fee.insertMany(sampleFees);
    console.log("Sample fees inserted successfully");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding fees:", error);
    process.exit(1);
  }
};

seedFees();
