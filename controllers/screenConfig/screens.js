// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
// Logger Imports
const screenService = require("../../services/screenConfig/screens");

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
   * /screenconfig/courses/{courseId}:
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
    const isSuperOrAdmin = req.user?.role?.super || req.user?.role?.admin;

    const courseId = Number(req.params.courseId);
    if (isNaN(courseId)) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }
    const course = await screenService.getScreensByCourses(courseId);

    // Admin and Super Admin can access the resource
    // Only filtered people by middleware from same org can access the resource
    const isSameOrganizationResource = loggedInUserOrg === course.orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource)
      return apiResponse.fail(res, "", 403);

    return apiResponse.success(res, req, course);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.update_screen_for_course = async (req, res) => {
  /**
   * @swagger
   *
   * /screenconfig/courses/{courseId}:
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
   *       - name: feedbacks
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
    Validator.register('strict-boolean', function (value) {
      return value === true || value === false;
    }, 'The :attribute field must be true or false.');
    const validation = new Validator(req.body, {
      courseInfo: "strict-boolean",
      coupons: "strict-boolean",
      lessons: "strict-boolean",
      statistics: "strict-boolean",
      memberships: "strict-boolean",
      feedbacks: "strict-boolean",
      careers: "strict-boolean",
      shop: "strict-boolean",
      faq: "strict-boolean",
    });
    validation.fails(function () {
      console.log("in validation fails :");
      return apiResponse.fail(res, validation.errors);
    });
    const loggedInUserOrg = req.user?.orgId;
    const isSuperOrAdmin = req.user?.role?.super || req.user?.role?.admin;
    const courseId = Number(req.params.courseId);
    console.log("courseId in controller :", courseId);
    if (isNaN(courseId)) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }

    const course = await screenService.updateScreens(courseId, req.body);
    const isSameOrganizationResource = loggedInUserOrg === course.orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource)
      return apiResponse.fail(res, "", 403);
    return apiResponse.success(res, req, course);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
