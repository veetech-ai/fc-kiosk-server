const apiResponse = require("../common/api.response");
const OrgService = require("../services/organization-fingerprint.service");
const Validator = require("validatorjs");

/**
 * @swagger
 * tags:
 *   name: Organization/fp
 *   description: add organization user with fingerprint device
 */

exports.create = async (req, res) => {
  /**
   * @swagger
   *
   * /organization/fp:
   *   post:
   *     security:
   *       - auth: []
   *     description: add user finger print
   *     tags: [Organization/fp]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: Device ID
   *         in: formData
   *         required: true
   *         type: number
   *       - name: userId
   *         description: user ID
   *         in: formData
   *         required: true
   *         type: number
   *       - name: deviceUserId
   *         description: device user ID
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const { deviceId, userId, deviceUserId } = req.body;
    const validation = new Validator(req.body, {
      deviceId: "required|numeric",
      userId: "required|numeric",
      deviceUserId: "required|numeric",
    });
    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });
    validation.passes(async () => {
      const result = await OrgService.attachUserWithFingerprint(
        userId,
        deviceId,
        deviceUserId,
      );
      apiResponse.success(res, req, result);
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.delete = async (req, res) => {
  /**
   * @swagger
   *
   * /organization/fp:
   *   delete:
   *     security:
   *       - auth: []
   *     description: delete user finger print
   *     tags: [Organization/fp]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: Device ID
   *         in: formData
   *         required: true
   *         type: number
   *       - name: userId
   *         description: user ID
   *         in: formData
   *         required: true
   *         type: number
   *       - name: deviceUserId
   *         description: user id saved in device against fingerprint
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const { deviceId, userId, deviceUserId } = req.body;
    const validation = new Validator(req.body, {
      deviceId: "required|numeric",
      userId: "required|numeric",
      deviceUserId: "required|numeric",
    });
    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });
    validation.passes(async () => {
      const result = await OrgService.deAttachUserFromFingerprint(
        userId,
        deviceId,
        deviceUserId,
      );
      if (result) {
        apiResponse.success(res, req, result);
      } else {
        apiResponse.fail(res, "no record found", 400);
      }
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.getAll = async (req, res) => {
  /**
   * @swagger
   *
   * /organization/fp:
   *   get:
   *     security:
   *       - auth: []
   *     description: get all user finger print
   *     tags: [Organization/fp]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: orgId
   *         description: org ID
   *         in: query
   *         required: false
   *         type: number
   *       - name: deviceId
   *         description: device ID
   *         in: query
   *         required: false
   *         type: number
   *       - name: userId
   *         description: user ID
   *         in: query
   *         required: false
   *         type: number
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const { deviceId, userId } = req.query;
    let orgId = req.user.orgId;
    if (req.user.admin && req.query.orgId) {
      orgId = req.query.orgId;
    } else if (req.user.admin && !req.query.orgId) {
      apiResponse.fail(res, "organization id is required");
    }
    const validation = new Validator(req.query, {
      deviceId: "numeric|numeric",
      userId: "numeric",
    });
    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });
    validation.passes(async () => {
      const result = await OrgService.getUserOfFingerprint(orgId, {
        userId,
        deviceId,
      });
      apiResponse.success(res, req, result);
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};
