const Validator = require("validatorjs");
const apiResponse = require("../../common/api.response");
const courseService = require("../../services/kiosk/course");
const helper = require("../../common/helper");
const FeedbackService = require("../../services/kiosk/feedback");

/**
 * @swagger
 * tags:
 *   name: Course-Feedback
 *   description: Web Portal Courses API's
 */
exports.getCourseFeedBacks = async (req, res) => {
  /**
   * @swagger
   *
   * /course-feedback/{courseId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get All Feedbacks for Course.
   *     tags: [Course-Feedback]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: courseId
   *         description: id of course
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }
    const course = await courseService.getCourseById(courseId);
    const orgId = course.orgId;
    const loggedInUserOrg = req.user?.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    const isSameOrganizationResource = loggedInUserOrg === orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource) {
      return apiResponse.fail(res, "", 403);
    }
    const courseFeedbacks = await FeedbackService.getCourseFeedBacks(courseId);
    return apiResponse.success(res, req, courseFeedbacks);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
