import * as CourseService from "../services/course.service.js";

const sendSuccessResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

export const createCourse = async (req, res, next) => {
  try {
    const course = await CourseService.createCourse(req.body, req.user.id);
    sendSuccessResponse(res, 201, "Course created successfully", course);
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const includeLessons = req.query.syllabus === "true";

    const course = await CourseService.getCourseById(
      req.params.id,
      includeLessons,
    );

    sendSuccessResponse(res, 200, "Course retrieved successfully", course);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await CourseService.updateCourse(req.params.id, req.body);
    sendSuccessResponse(res, 200, "Course updated successfully", course);
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    await CourseService.deleteCourse(req.params.id);
    sendSuccessResponse(res, 200, "Course deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const listCourses = async (req, res, next) => {
  try {
    const result = await CourseService.listCourses(req.query);
    sendSuccessResponse(res, 200, "Courses retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};
