const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../../common/api.response");

// Logger Imports
const deviceService = require("../../../services/device");
const contactMembershipService = require("../../../services/kiosk/contact_membership");
const membershipService = require("../../../services/kiosk/membership");
const helper = require("../../../common/helper");
const ServiceError = require("../../../utils/serviceError");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Courses API's for Device
 */
exports.create_contact_membership = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/memberships/contacts:
   *   post:
   *     security:
   *       - auth: []
   *     description: contact with lesson of golf course.
   *     tags: [Kiosk-Courses-Content]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: membershipId
   *         description: id of membership
   *         in: formData
   *         required: true
   *         type: integer
   *       - name: phone
   *         description: phone of golfer
   *         in: formData
   *         required: false
   *         type: string
   *       - name: email
   *         description: email of golfer
   *         in: formData
   *         required: false
   *         type: string
   *       - name: contact_medium
   *         description: contact_medium
   *         in: formData
   *         enum: ['text', 'call']
   *         required: false
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      membershipId: "required|integer",
      phone: "string",
      email: "string",
      contact_medium: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const { membershipId, phone, email, contact_medium } = req.body;
    const membership = await membershipService.getMembershipById(membershipId);
    const deviceId = req.device.id; // device Id
    const course = await deviceService.getLinkedCourse(deviceId);

    if (membership.gcId !== course.id) {
      throw new ServiceError("Not found", 404);
    }

    const reqBody = {
      mId: membershipId,
      userPhone: phone,
      userEmail: email,
      contactMedium: contact_medium,
      gcId: course.id,
      orgId: course.id,
    };
    const contactMembership =
      await contactMembershipService.createContactMembership(reqBody);

    // helper.mqtt_publish_message(
    //   `gc/${contactMembership.gcId}/screens`,
    //   helper.mqttPayloads.onMembershipContactUpdate,
    //   false,
    // );

    return apiResponse.success(res, req, contactMembership);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
