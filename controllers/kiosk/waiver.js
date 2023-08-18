const Validator = require("validatorjs");
const formidable = require("formidable");
const apiResponse = require("../../common/api.response");
const ServiceError = require("../../utils/serviceError");
const waiverService = require("../../services/kiosk/waiver");
const fileUploader = require("../../common/upload");
const helper = require("../../common/helper");
Validator.prototype.firstError = function () {
  const fields = Object.keys(this.rules);
  for (let i = 0; i < fields.length; i++) {
    const err = this.errors.first(fields[i]);
    if (err) return err;
  }
};

const UPLOAD_PATH = "uploads/waiver";

/**
 * @swagger
 * tags:
 *   name: Waiver
 *   description: Web Portal Courses API's
 */

exports.sign = async (req, res) => {
  /**
   * @swagger
   *
   * /waiver/sign:
   *   post:
   *     security:
   *       - auth: []
   *     description: Sign a waiver.
   *     tags: [Waiver]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - in: formData
   *         name: gcId
   *         description: id of golf course
   *         required: true
   *         type: integer
   *
   *       - in: formData
   *         name: email
   *         description: Email of the signatory
   *         required: true
   *         type: string
   *
   *       - in: formData
   *         name: signature
   *         description: Upload image of the user signaure
   *         required: true
   *         type: file
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const form = new formidable.IncomingForm();

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const validation = new Validator(fields, {
      gcId: "required|integer",
      email: ["required", `regex:${helper.emailRegex}`],
    });

    if (validation.fails()) throw new ServiceError(validation.firstError());

    if (!files.signature) {
      throw new ServiceError("The signature image is required");
    }

    const imageFormats = ["jpg", "jpeg", "png", "webp"];

    fields.signaturePath = await fileUploader.upload_file(
      files.signature,
      UPLOAD_PATH,
      imageFormats,
    );

    // 1. insert new row, email, waiverId, signature
    // 2. create a pdf of content + signature
    // 3. send an email to signatory
    // 4. send an emial to course owner

    const waiver = await waiverService.sign(
      fields.gcId,
      fields.email,
      fields.signaturePath,
    );

    waiver.signature = fileUploader.getFileURL(fields.signaturePath);

    return apiResponse.success(res, req, waiver);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.update = async (req, res) => {
  /**
   * @swagger
   *
   * /waiver/{id}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: Update the contents of waiver.
   *     tags: [Waiver]
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: path
   *         name: id
   *         description: id of the waiver
   *         required: true
   *         type: integer
   *
   *       - in: body
   *         name: body
   *         description: >
   *            * `content`: New content of the waiver.
   *
   *         schema:
   *             type: object
   *             required:
   *                - content
   *             properties:
   *                content:
   *                   type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const paramValidation = new Validator(req.params, {
      id: "required|integer",
    });

    const validation = new Validator(req.body, {
      content: "required|string",
    });

    if (paramValidation.fails()) {
      throw new ServiceError(paramValidation.firstError());
    }

    if (validation.fails()) throw new ServiceError(validation.firstError());

    // update the waiver with given id
    const data = await waiverService.updateContent(
      req.params.id,
      req.body.content,
    );

    return apiResponse.success(res, req, data);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getCourseSignedWaivers = async (req, res) => {
  /**
   * @swagger
   *
   * /waiver/course/{id}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get the paginated list of signed waivers against a course id.
   *     tags: [Waiver]
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The id of the golf course
   *         required: true
   *         type: integer
   *
   *       - in: query
   *         name: page
   *         description: Page number
   *         required: false
   *         default: 1
   *         type: integer
   *
   *       - in: query
   *         name: size
   *         description: Number of records per page
   *         required: false
   *         default: 10
   *         type: integer
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const queryValidation = new Validator(req.query, {
      page: "integer",
      size: "integer",
    });

    if (queryValidation.fails()) {
      throw new ServiceError(queryValidation.firstError());
    }

    const validation = new Validator(req.params, {
      id: "required|integer",
    });

    if (validation.fails()) throw new ServiceError(validation.firstError());

    const pagination = helper.get_pagination_params({
      limit: req.query.size,
      page: req.query.page,
    });

    // get pagingated list of signed waivers against given course
    const data = await waiverService.getSigned(req.params.id, pagination);

    // get file urls
    data.waivers.forEach(
      (wv) => (wv.signature = fileUploader.getFileURL(wv.signature)),
    );

    return apiResponse.success(res, req, { ...data, pagination });
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.deleteSignedWaiver = async (req, res) => {
  /**
   * @swagger
   *
   * /waiver/signed/{id}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete a particular signature entry.
   *     tags: [Waiver]
   *
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The id of the golf course
   *         required: true
   *         type: integer
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const validation = new Validator(req.params, {
      id: "required|integer",
    });

    if (validation.fails()) throw new ServiceError(validation.firstError());

    // delete the record
    await waiverService.deleteSigned(req.params.id);

    return apiResponse.success(res, req, null, 204);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
