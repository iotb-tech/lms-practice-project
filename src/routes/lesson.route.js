import * as lesssonController from "../controllers/lesson.controller.js";
import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";

const router = express.Router()

router.post("/courses/:courseId/lessons", authenticateToken, authorizeRole("create_lessons"), lesssonController.createLesson);
router.get("/lessons/:id", authenticateToken, authorizeRole("view_lessons"), lesssonController.getLessonById);
router.put("/lessons/:id", authenticateToken, authorizeRole("update_lessons"), lesssonController.updateLesson);
router.delete("/lessons/:id", authenticateToken, authorizeRole("delete_lessons"), lesssonController.deleteLesson);
router.get("/courses/:courseId/lessons", authenticateToken, authorizeRole("view_lessons"), lesssonController.listLessons);

export default router;