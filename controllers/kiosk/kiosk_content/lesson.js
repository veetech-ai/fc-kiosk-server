const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../../common/api.response");
const deviceService = require("../../../services/device");
const courseService = require("../../../services/kiosk/course");
const upload_file = require("../../../common/upload");
const courseLesson = require("../../../services/kiosk/lessons");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Courses API's for Device
 */
exports.getLessons = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/lessons:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get course-info screen content for linked course.
   *     tags: [Kiosk-Courses-Content]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const deviceId = req.device.id; // device Id
    const courseId = await deviceService.getCourse(deviceId);
    const lessons = await courseLesson.findLessonsByCourseId(courseId);

    return apiResponse.success(res, req, lessons);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.getLesson = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/lessons/{lessonId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get course-info screen content for linked course.
   *     tags: [Kiosk-Courses-Content]
   *     parameters:
   *     - name: lessonId
   *       description: lesson ID
   *       in: path
   *       required: true
   *       type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const lessonId = Number(req.params.lessonId);
    if (!lessonId) {
      return apiResponse.fail(res, "lessonId must be a valid number");
    }
    const lesson = await courseLesson.findLessonById(lessonId);

    return apiResponse.success(res, req, lesson);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
