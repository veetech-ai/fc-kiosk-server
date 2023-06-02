const Validator = require("validatorjs");
const apiResponse = require("../../common/api.response");
const contactMembershipService = require("../../services/kiosk/contact_membership");
const membershipService = require("../../services/kiosk/membership");
const helper = require("../../common/helper");
const { parseBoolean } = require("../../utils/parseBoolean");

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
   *     description: Get contacts for a specific membership.
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

    await membershipService.getOneMembership(
      { id: membershipId },
      loggedInUserOrg,
    );

    const contactMembership =
      await contactMembershipService.getContactMemberships(membershipId);
    return apiResponse.success(res, req, contactMembership);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.updateContactMembership = async (req, res) => {
  /**
   * @swagger
   *
   * /course-membership/contacts/{id}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: update wether the contact of membership is addressed.
   *     tags: [Courses-Membership]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: id
   *         description: id of contact membership
   *         in: path
   *         required: true
   *         type: string
   *       - name: isAddressed
   *         type: boolean
   *         description: is the contact of membership addressed or not
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

    const contactMembershipId = Number(req.params.id);
    if (!contactMembershipId) {
      return apiResponse.fail(
        res,
        "contactMembershipId must be a valid number",
      );
    }

    const loggedInUserOrg = req.user?.orgId;

    await contactMembershipService.getContactMembershipOne(
      { id: contactMembershipId },
      loggedInUserOrg,
    );

    const allowedFields = ["isAddressed"];
    const filteredBody = helper.validateObject(req.body, allowedFields);

    if (Object.hasOwnProperty.call(filteredBody, "isAddressed")) {
      filteredBody.isAddressed = parseBoolean(
        filteredBody.isAddressed,
        "isAddressed",
      );
    }

    const updatedMemberShipContact =
      await contactMembershipService.updateContactMemberShipIsAddressable(
        contactMembershipId,
        filteredBody,
      );

    return apiResponse.success(
      res,
      req,
      updatedMemberShipContact ? "Updated Successfully" : "Already Updated",
    );
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
