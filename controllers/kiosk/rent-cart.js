const Validator = require("validatorjs");
const formidable = require("formidable");
const apiResponse = require("../../common/api.response");
const ServiceError = require("../../utils/serviceError");

Validator.prototype.firstError = function () {
  const fields = Object.keys(this.rules);
  for (let i = 0; i < fields.length; i++) {
    const err = this.errors.first(fields[i]);
    if (err) return err;
  }
};

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
   *         required: false
   *         type: string
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
      email: "required|string",
    });

    if (validation.fails()) throw new ServiceError(validation.firstError());

    if (!files.signature) {
      throw new ServiceError("The signature image is required");
    }

    // get a waiver against current gcId
    // get the id of the waiver
    // insert new row, email, waiverId, signature
    // create a pdf of content + signature
    // send an email to signatory
    // send an emial to course owner

    return apiResponse.success(res, req, {});
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
   *        - in: body
   *          name: body
   *          description: >
   *            * `content`: New content of the waiver.
   *
   *          schema:
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

    return apiResponse.success(res, req, {});
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getCourseSignedWaivers = async (req, res) => {
  /**
   * @swagger
   *
   * /waiver/course/{id}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: Get the paginated list of singed waivers against a course id.
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

    // get pagingated list of signed waivers against given course

    return apiResponse.success(res, req, {});
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.deleteSignedWaiver = async (req, res) => {
  /**
   * @swagger
   *
   * /waiver/signed/{id}:
   *   patch:
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

    return apiResponse.success(res, req, null, 204);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
