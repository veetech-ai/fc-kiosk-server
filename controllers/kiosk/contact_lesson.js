const Validator = require("validatorjs");
const formidable = require("formidable");
const apiResponse = require("../../common/api.response");
const upload_file = require("../../common/upload");
const courseLesson = require("../../services/kiosk/lessons");
const courseService = require("../../services/kiosk/course");
const contactCoachService = require("../../services/kiosk/contact_lesson");
const helper = require("../../common/helper");

/**
 * @swagger
 * tags:
 *   name: Courses-Lesson
 *   description: Web Portal Courses API's
 */
exports.getLessonContacts = async (req, res) => {
  /**
   * @swagger
   *
   * /course-lesson/{lessonId}/contacts:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get lesson contact for a specific lesson.
   *     tags: [Courses-Lesson]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: lessonId
   *         description: lesson id
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const lessonId = Number(req.params.lessonId);
    if (!lessonId) {
      return apiResponse.fail(res, "lessonId must be a valid number");
    }
    const loggedInUserOrg = req.user?.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    const lesson = await courseLesson.findLessonById(lessonId);
    const orgId = lesson.orgId;
    const isSameOrganizationResource = loggedInUserOrg === orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource) {
      return apiResponse.fail(res, "", 403);
    }
    const contactCoaches =
      await contactCoachService.getContactCoachesByLessonId(lessonId);
    return apiResponse.success(res, req, contactCoaches);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.updateContactLesson = async (req, res) => {
  /**
   * @swagger
   *
   * /course-lesson/contacts/{contactCoachId}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: update wether the contact of lesson is addressable.
   *     tags: [Courses-Lesson]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: contactCoachId
   *         description: id of contact coach
   *         in: path
   *         required: true
   *         type: string
   *       - name: isAddressed
   *         type: boolean
   *         description: is the contact of coach addressed or not
   *         in: formData
   *         required: false
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    console.log("in controller");
    const contactCoachId = Number(req.params.contactCoachId);
    if (!contactCoachId) {
      return apiResponse.fail(res, "contactCoachId must be a valid number");
    }
    const loggedInUserOrg = req.user?.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    const contactCoach = await contactCoachService.getContactCoachbyId(
      contactCoachId,
    );
    const orgId = contactCoach.orgId;
    const isSameOrganizationResource = loggedInUserOrg === orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource) {
      return apiResponse.fail(res, "", 403);
    }
    const validation = new Validator(req.body, {
      isAddressed: "boolean",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const reqBody = { is_addressed: req.body.isAddressed };
    console.log("ssss", reqBody);
    const updatedCoach =
      await contactCoachService.updateContactCoachIsAddressable(
        contactCoachId,
        reqBody,
      );
    return apiResponse.success(res, req, updatedCoach);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
