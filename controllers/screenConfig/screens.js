// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../common/api.response");

// import service
const screenService = require("../../services/screenConfig/screens");
const courseService = require("../../services/kiosk/course");
const { validateObject } = require("../../common/helper");
/**
 * @swagger
 * tags:
 *   name: Screen-Config
 *   description: Screen-Config API's
 */

exports.get_screens_for_course = async (req, res) => {
  /**
   * @swagger
   *
   * /screen-config/courses/{courseId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get screens configuration for specific course.
   *     tags: [Screen-Config]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: courseId
   *         description: Golf course ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const loggedInUserOrg = req.user?.orgId;

    const courseId = Number(req.params.courseId);
    if (!courseId) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }
    await courseService.getCourse({ id: courseId }, loggedInUserOrg);
    const courseScreens = await screenService.getScreensByCourses(courseId);

    return apiResponse.success(res, req, courseScreens);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.update_screen_for_course = async (req, res) => {
  /**
   * @swagger
   *
   * /screen-config/courses/{courseId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: update screens for specific course.
   *     tags: [Screen-Config]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: courseId
   *         description: Golf course ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: courseInfo
   *         description: course information
   *         in: formData
   *         required: false
   *         type: boolean
   *         default: true
   *       - name: coupons
   *         description: coupons
   *         in: formData
   *         required: false
   *         type: boolean
   *         default: true
   *       - name: lessons
   *         description: Golf course lessons
   *         in: formData
   *         required: false
   *         type: boolean
   *         default: true
   *       - name: statistics
   *         description: Golf course statistics
   *         in: formData
   *         required: false
   *         type: boolean
   *         default: true
   *       - name: memberships
   *         description: Golf course memberships
   *         in: formData
   *         required: false
   *         type: boolean
   *         default: true
   *       - name: feedback
   *         description: Golf course feedbacks
   *         in: formData
   *         required: false
   *         type: boolean
   *         default: true
   *       - name: careers
   *         description: Golf course careers
   *         in: formData
   *         required: false
   *         type: boolean
   *         default: true
   *       - name: shop
   *         description: Golf course shops
   *         in: formData
   *         required: false
   *         type: boolean
   *         default: true
   *       - name: faq
   *         description: Golf course faq
   *         in: formData
   *         required: false
   *         type: boolean
   *         default: true
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const validation = new Validator(req.body, {
      courseInfo: "boolean",
      coupons: "boolean",
      lessons: "boolean",
      statistics: "boolean",
      memberships: "boolean",
      feedback: "boolean",
      careers: "boolean",
      shop: "boolean",
      faq: "boolean",
    });
    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }
    const allowedFields = [
      "courseInfo",
      "coupons",
      "lessons",
      "statistics",
      "memberships",
      "feedback",
      "careers",
      "shop",
      "faq",
    ];
    const filteredBody = validateObject(req.body, allowedFields);
    const loggedInUserOrg = req.user?.orgId;
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }
    await courseService.getCourse({ id: courseId }, loggedInUserOrg);
    const courseWithUpdateScreens = await screenService.updateScreens(
      courseId,
      filteredBody,
    );

    return apiResponse.success(res, req, courseWithUpdateScreens);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
