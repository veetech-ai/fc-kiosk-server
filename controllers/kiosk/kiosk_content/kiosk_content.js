// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../../common/api.response");
const screenService = require("../../../services/screenConfig/screens");
const deviceService = require("../../../services/device");
const courseService = require("../../../services/kiosk/course");
const upload_file = require("../../../common/upload");
const FeedbackService = require("../../../services/kiosk/feedback");
// Logger Imports

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Courses API's for Device
 */
exports.get_screens_for_device = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/screens:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get courses for a specific organization.
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
    const screens = await screenService.getScreensByCourses(courseId);
    return apiResponse.success(res, req, screens);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getCourseInfo = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/course-info:
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
    const courseInfo = await courseService.getCourseById(courseId);

    const averageRating = await FeedbackService.getAverageRating(courseId);
    courseInfo.setDataValue("feedback", averageRating);

    if (courseInfo.logo) {
      const logo = upload_file.getFileURL(courseInfo.logo);
      courseInfo.setDataValue("logo", logo);
    }
    if (courseInfo.images) {
      const images = upload_file.getFileURL(courseInfo.images);
      courseInfo.setDataValue("images", images);
    }

    return apiResponse.success(res, req, courseInfo);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
