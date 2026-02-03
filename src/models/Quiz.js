import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    passingScore: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true },
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
