const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    feeType: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    paidDate: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);
