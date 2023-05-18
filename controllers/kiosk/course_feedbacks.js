const Validator = require("validatorjs");
const apiResponse = require("../../common/api.response");
const courseService = require("../../services/kiosk/course");
const helper = require("../../common/helper");
const FeedbackService = require("../../services/kiosk/feedback");
const ServiceError = require("../../utils/serviceError");

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
   * /course-feedback/courses/{courseId}:
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

    const loggedInUserOrg = req.user?.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    const isSameOrganizationResource = loggedInUserOrg === course.orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource) {
      return apiResponse.fail(res, "", 403);
    }
    const courseFeedbacks = await FeedbackService.getCourseFeedBacks(courseId);
    return apiResponse.success(res, req, courseFeedbacks);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateFeedBack = async (req, res) => {
  /**
   * @swagger
   *
   * /course-feedback/{id}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: update wether the contact of lesson is addressable.
   *     tags: [Course-Feedback]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: id
   *         description: id of course feedback
   *         in: path
   *         required: true
   *         type: string
   *       - name: isAddressed
   *         type: boolean
   *         description: is the feedback of course addressed or not
   *         in: formData
   *         required: false
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const validation = new Validator(req.body, {
      isAddressed: "boolean",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const feedbackId = Number(req.params.id);
    if (!feedbackId) {
      return apiResponse.fail(res, "feedbackId must be a valid number");
    }

    const loggedInUserOrg = req.user?.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    const feedback = await FeedbackService.getFeedBackById(feedbackId);
    const orgId = feedback.orgId;
    const isSameOrganizationResource = loggedInUserOrg === orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource) {
      return apiResponse.fail(res, "", 403);
    }
    let isAddressedBoolean = req.body.isAddressed;
    const isStringBoolean =
      isAddressedBoolean === "true" ||
      isAddressedBoolean === "false" ||
      typeof isAddressedBoolean === "boolean";
    if (!isStringBoolean)
      throw new ServiceError("isAddressed must be a boolean", 400);
    isAddressedBoolean = JSON.parse(req.body.isAddressed);

    const updatedFeedBack = await FeedbackService.updateFeedBackIsAddressable(
      feedbackId,
      isAddressedBoolean,
    );
    return apiResponse.success(res, req, updatedFeedBack);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
