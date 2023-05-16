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
// exports.updateContactLesson = async (req, res) => {
//   /**
//    * @swagger
//    *
//    * /course-feedback/{courseId}:
//    *   get:
//    *     security:
//    *       - auth: []
//    *     description: update wether the contact of lesson is addressable.
//    *     tags: [Course-Feedback]
//    *     consumes:
//    *       - application/x-www-form-urlencoded
//    *     parameters:
//    *       - name: contactCoachId
//    *         description: id of contact coach
//    *         in: path
//    *         required: true
//    *         type: string
//    *       - name: isAddressed
//    *         type: boolean
//    *         description: is the contact of coach addressed or not
//    *         in: formData
//    *         required: false
//    *     produces:
//    *       - application/json
//    *     responses:
//    *       200:
//    *         description: success
//    */

//   try {
//     const validation = new Validator(req.body, {
//       isAddressed: "boolean",
//     });

//     if (validation.fails()) {
//       return apiResponse.fail(res, validation.errors);
//     }

//     const contactCoachId = Number(req.params.contactCoachId);
//     if (!contactCoachId) {
//       return apiResponse.fail(res, "contactCoachId must be a valid number");
//     }

//     const loggedInUserOrg = req.user?.orgId;
//     const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
//       "super",
//       "admin",
//     ]).success;
//     const contactCoach = await contactCoachService.getContactCoachbyId(
//       contactCoachId,
//     );
//     const orgId = contactCoach.orgId;
//     const isSameOrganizationResource = loggedInUserOrg === orgId;
//     if (!isSuperOrAdmin && !isSameOrganizationResource) {
//       return apiResponse.fail(res, "", 403);
//     }

//     const isAddressedBoolean = JSON.parse(req.body.isAddressed);
//     const updatedCoach =
//       await contactCoachService.updateContactCoachIsAddressable(
//         contactCoachId,
//         isAddressedBoolean,
//       );
//     return apiResponse.success(res, req, updatedCoach);
//   } catch (error) {
//     return apiResponse.fail(res, error.message, error.statusCode || 500);
//   }
// };
