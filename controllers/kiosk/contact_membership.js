const Validator = require("validatorjs");
const formidable = require("formidable");
const apiResponse = require("../../common/api.response");
const upload_file = require("../../common/upload");
const courseLesson = require("../../services/kiosk/lessons");
const courseService = require("../../services/kiosk/course");
const contactMembershipService = require("../../services/kiosk/contact_membership");
const helper = require("../../common/helper");

/**
 * @swagger
 * tags:
 *   name: Courses-Membership
 *   description: Web Portal Courses API's
 */
exports.getMembershipContacts = async (req, res) => {
  /**
   * @swagger
   *
   * /course-membership/{id}/contacts:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get lesson contact for a specific lesson.
   *     tags: [Courses-Membership]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: membership id
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const membershipId = Number(req.params.id);
    if (!membershipId) {
      return apiResponse.fail(res, "membershipId must be a valid number");
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
      await contactMembershipService.getContactCoachesByLessonId(lessonId);
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
    const validation = new Validator(req.body, {
      isAddressed: "boolean",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

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

    const isAddressedBoolean = JSON.parse(req.body.isAddressed);
    const updatedCoach =
      await contactCoachService.updateContactCoachIsAddressable(
        contactCoachId,
        isAddressedBoolean,
      );
    return apiResponse.success(res, req, updatedCoach);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
