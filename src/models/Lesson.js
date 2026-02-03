import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    contentUrl: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
