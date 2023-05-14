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
      const lessons = await courseLesson.findLessonByCourseId(courseId);
      // const logo = upload_file.getFileURL(courseInfo.logo);
      // const images = upload_file.getFileURL(courseInfo.images);
  
      // courseInfo.setDataValue("logo", logo);
      // courseInfo.setDataValue("images", images);
  
      return apiResponse.success(res, req, lessons);
    } catch (error) {
      return apiResponse.fail(res, error.message, error.statusCode || 500);
    }
  };