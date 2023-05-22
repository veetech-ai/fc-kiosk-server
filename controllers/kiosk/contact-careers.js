const Validator = require("validatorjs");
const apiResponse = require("../../common/api.response");
const ContactsCareersServices = require("../../services/kiosk/contact-careers");
const helper = require("../../common/helper");

/**
 * @swagger
 * tags:
 *   name: Careers
 *   description: Careers (Jobs) Management
 */
exports.getCareerContacts = async (req, res) => {
  /**
   * @swagger
   *
   * /careers/{careerId}/contacts:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get contact requests for a specific career.
   *     tags: [Careers]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: careerId
   *         description: Career id
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const careerId = Number(req.params.careerId);
    if (!careerId) {
      return apiResponse.fail(res, "The careerId must be an integer.");
    }

    const loggedInUserOrgId = req.user.orgId;
    const contactCareers = await ContactsCareersServices.findCareerContacts(
      { careerId },
      loggedInUserOrgId,
    );

    return apiResponse.success(res, req, contactCareers);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.updateCareerContact = async (req, res) => {
  /**
   * @swagger
   *
   * /careers/contacts/{careerContactId}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: Update career contact record - Currently it will be used to update the isAddressed field.
   *     tags: [Careers]
   *
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: careerContactId
   *         description: id of contact request
   *         in: path
   *         required: true
   *         type: string
   *       - name: isAddressed
   *         type: boolean
   *         description: is the contact request being addressed or not
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

    const careerContactId = Number(req.params.careerContactId);
    if (!careerContactId) {
      return apiResponse.fail(res, "The careerContactId must be an integer.");
    }

    const allowedFields = ["isAddressed"];
    const filteredBody = helper.validateObject(req.body, allowedFields);

    if (filteredBody.isAddressed) {
      filteredBody.isAddressed = JSON.parse(filteredBody.isAddressed);
    }

    const loggedInUserOrg = req.user.orgId;
    await ContactsCareersServices.findOneCareerContact(
      { id: careerContactId },
      loggedInUserOrg,
    );

    const noOfRowsUpdated =
      await ContactsCareersServices.updateCareerContactById(
        careerContactId,
        filteredBody,
      );

    const responseText = noOfRowsUpdated
      ? "Career's contact request updated successfully"
      : "Career's contact request already up to date";
    return apiResponse.success(res, req, responseText);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
