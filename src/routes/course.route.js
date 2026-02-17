import * as coureseController from "../controllers/course.controller.js";
import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", authenticateToken, authorizeRole("create_courses"), coureseController.createCourse);
router.get("/:id", authenticateToken, authorizeRole("view_courses"), coureseController.getCourseById);
router.put("/:id", authenticateToken, authorizeRole("update_courses"), coureseController.updateCourse);
router.delete("/:id", authenticateToken, authorizeRole("delete_courses"), coureseController.deleteCourse);
router.get("/", authenticateToken, authorizeRole("view_courses"), coureseController.listCourses);
export default router;  