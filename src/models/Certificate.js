import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
    },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
    certificateUrl: {
    type: String,
    required: true,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;