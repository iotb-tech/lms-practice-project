import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    questionText: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
      validate: (v) => v.length >= 2,
    },

    correctAnswerIndex: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
