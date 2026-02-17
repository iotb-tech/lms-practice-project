import Lesson from "../models/Lesson.js";
import { AppError } from "../utils/AppError.js";
import Course from "../models/Course.js";



export const createLesson = async (courseId, lessonData) => {


  const course = await Course.findOne({
    _id: courseId,
    isDeleted: false,
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

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
    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }
  return lesson;
};

export const deleteLesson = async (lessonId) => {
  const lesson = await Lesson.findByIdAndDelete(lessonId).where({ isDeleted: false });
    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    } 
  return lesson;
};

export const listLessons = async (courseId) => {
   const lessons = await Lesson.find({ course: courseId, isDeleted: false }).sort({ order: 1 });
   if (!lessons || lessons.length === 0) {
    throw new AppError("No lessons found for this course", 404);
  }
   return lessons;
};