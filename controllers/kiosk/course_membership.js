const Validator = require("validatorjs");
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
const membershipService = require("../../services/kiosk/membership");

/**
 * @swagger
 * tags:
 *   name: Courses-Membership
 *   description: Web Portal Courses API's
 */

exports.update_membership = async (req, res) => {
  /**
   * @swagger
   *
   * /course-membership/{id}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: update course Membership Link.
   *     tags: [Courses-Membership]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: id
   *         description: id of membership
   *         in: path
   *         required: true
   *         type: integer
   *       - name: link
   *         description: link for Membership
   *         in: formData
   *         required: false
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const loggedInUserOrg = req.user?.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    const id = Number(req.params.id);
    if (!id) {
      return apiResponse.fail(res, "id must be a valid number");
    }
    const membership = await membershipService.getMembershipById(id);

    const isSameOrganizationResource = loggedInUserOrg === membership.orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource) {
      return apiResponse.fail(res, "", 403);
    }
    const validation = new Validator(req.body, {
      link: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const updatedMembership = await membershipService.updateMembershipLink(
      id,
      req.body,
    );
    return apiResponse.success(res, req, updatedMembership);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.get_membership = async (req, res) => {
  /**
   * @swagger
   *
   * /course-membership/courses/{id}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get membership for Course.
   *     tags: [Courses-Membership]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: id of course
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const loggedInUserOrg = req.user?.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;

    const courseId = Number(req.params.id);

    if (!courseId) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }
    const membership = await membershipService.getMembershipByCourseId(
      courseId,
    );

    const isSameOrganizationResource = loggedInUserOrg === membership.orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource) {
      return apiResponse.fail(res, "", 403);
    }
    return apiResponse.success(res, req, membership);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
