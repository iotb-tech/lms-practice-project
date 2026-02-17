import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import { AppError } from "../utils/AppError.js";



export const createCourse = async (courseData, userId) => {
  
    const course = new Course({
      ...courseData,
      instructor: userId,
    });
    return await course.save();
  
};

export const getCourseById = async (courseId, includeLessons = false) => {
  
  const course = await Course.findById(courseId).where({ isDeleted: false }).populate("instructor", "firstName lastName email");
  if (!course) {
    throw new AppError("Course not found", 404);
  }
  if (includeLessons) {
    const lessons = await Lesson.find({ course: courseId, isDeleted: false }).sort({ order: 1 });

    return {...course.toObject(), lessons };
  }
  return course;
};

export const updateCourse = async (courseId, courseData) => {
  const course = await Course.findByIdAndUpdate(courseId, courseData, { new: true }).where({ isDeleted: false });
  if (!course ) {
    throw new AppError("Course not found", 404);
  }
    
  return course
};

export const deleteCourse = async (courseId ) => {
  const course = await Course.findByIdAndDelete(courseId).where({ isDeleted: false });
    if (!course) {
        throw new AppError("Course not found", 404);
    }
    return course
};

export const listCourses = async (query) => {
  const {
    category,
    level,
    status,
    instructor,
    page = 1,
    limit = 10
  } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const filter = { isDeleted: false };

  if (category) filter.category = category;
  if (level) filter.level = level;
  if (status) filter.status = status;
  if (instructor) filter.instructor = instructor;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Course.countDocuments(filter),
  ]);

  return {
    courses,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};
