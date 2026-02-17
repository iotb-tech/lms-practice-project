import Lesson from "../models/Lesson.js";
import { AppError } from "../utils/AppError.js";

export const createLesson = async (courseId, lessonData) => {
  const lesson = new Lesson({
    ...lessonData,
    course: courseId,
  });
  return await lesson.save();
};

export const getLessonById = async (lessonId) => {
    const lesson = await Lesson.findById(lessonId).where({ isDeleted: false });
    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }
  return lesson;
};

export const updateLesson = async (lessonId, lessonData) => {
  const lesson = await Lesson.findByIdAndUpdate(lessonId, lessonData, { new: true }).where({ isDeleted: false });
  return lesson;
};

export const deleteLesson = async (lessonId) => {
  const lesson = await Lesson.findByIdAndDelete(lessonId).where({ isDeleted: false });
  return lesson;
};

export const listLessons = async (courseId) => {
  return await Lesson.find({ course: courseId, isDeleted: false }).sort({ order: 1 });
};