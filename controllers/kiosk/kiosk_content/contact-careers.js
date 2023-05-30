const apiResponse = require("../../../common/api.response");
const ContactCareersServices = require("../../../services/kiosk/contact-careers");
const CareersServices = require("../../../services/kiosk/career");

const DevicesServices = require("../../../services/device");
const Validator = require("validatorjs");
const helper = require("../../../common/helper")

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Careers (Jobs) Management
 */

exports.create = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/careers/contacts:
   *   post:
   *     security:
   *       - auth: []
   *     description: Create a contact request in which the user selects the medium though which he/she expects the company to contact him/her.
   *     tags: [Kiosk-Courses-Content]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: careerId
   *         description: Career (Job) id
   *         in: formData
   *         required: true
   *         type: integer
   *       - name: phone
   *         description: Phone no of the candidate
   *         in: formData
   *         required: false
   *         type: string
   *       - name: email
   *         description: Email of the candidate
   *         in: formData
   *         required: false
   *         type: string
   *       - name: contactMedium
   *         description: |
   *           The medium through which the candidate wants company to contact him/her - (text or call)
   *           User would need to select this option only if he chose phone no instead of email.
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
      careerId: "required|integer",
      phone: "string",
      email: "email",
      contactMedium: "string|in:text,call",
    });

    if (validation.fails()) return apiResponse.fail(res, validation.errors);

    const { careerId, phone, email, contactMedium } = req.body;

    const deviceId = req.device.id;
    const course = await DevicesServices.getLinkedCourse(deviceId);

    await CareersServices.findOneCareer({
      id: careerId,
      gcId: course.id,
      orgId: course.orgId,
    });
    const reqBody = {
      careerId,
      phone,
      email,
      contactMedium,
      gcId: course.id,
      orgId: course.orgId,
    };
    const contactCareer = await ContactCareersServices.create(reqBody);

    helper.mqtt_publish_message(
      `gc/${contactCareer.gcId}/screens`,
      helper.mqttPayloads.onCareerContactUpdate,
      false,
    );

    return apiResponse.success(res, req, contactCareer);
  } catch (error) {
    return apiResponse.fail(
      res,
      error.message,
      error.statusCode ||
        (error.errors && error.errors[0]?.original?.statusCode) ||
        500,
    );
  }
};
