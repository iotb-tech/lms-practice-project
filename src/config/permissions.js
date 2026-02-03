export const ROLE_PERMISSIONS = {
  student: [
    "view_courses",
    "enroll_courses",
    "view_lessons",
    "take_quizzes",
    "view_progress",
    "view_certificates",
  ],
  instructor: [
    "create_courses",
    "update_courses",
    "view_courses",
    "create_lessons",
    "update_lessons",
    "view_lessons",
    "create_quizzes",
    "update_quizzes",
    "view_quizzes",
    "grade_quizzes",
    "view_progress",
  ],
  admin: ["*"],
};
