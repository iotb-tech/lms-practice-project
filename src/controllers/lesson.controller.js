import * as lessonService from "../services/lesson.service.js";
import { sendSuccessResponse } from "../utils/response.js";

export const createLesson = async (req, res, next) => {
    try {
        const lesson = await lessonService.createLesson(req.params.courseId, req.body);
        sendSuccessResponse(res, 201, "Lesson created successfully", lesson);
    } catch (error) {
        next(error);
    }
};

export const getLessonById = async (req, res, next) => {
    try {
        const lesson = await lessonService.getLessonById(req.params.id);
        sendSuccessResponse(res, 200, "Lesson retrieved successfully", lesson);
    } catch (error) {
        next(error);
    }
};

export const updateLesson = async (req, res, next) => {
    try {
        const lesson = await lessonService.updateLesson(req.params.id, req.body);
        sendSuccessResponse(res, 200, "Lesson updated successfully", lesson);
    } catch (error) {
        next(error);
    }
};

export const deleteLesson = async (req, res, next) => {
    try {
        await lessonService.deleteLesson(req.params.id);
        sendSuccessResponse(res, 200, "Lesson deleted successfully");
    } catch (error) {
        next(error);
    }
};

export const listLessons = async (req, res, next) => {
    try {
        const lessons = await lessonService.listLessons(req.params.courseId);
        sendSuccessResponse(res, 200, "Lessons retrieved successfully", lessons);
    } catch (error) {
        next(error);
    }
};