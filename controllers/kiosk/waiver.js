const Validator = require("validatorjs");
const formidable = require("formidable");
const { uuid } = require("uuidv4");
const fs = require("node:fs");
const ejs = require("ejs");
const path = require("path");

const apiResponse = require("../../common/api.response");
const ServiceError = require("../../utils/serviceError");
const waiverService = require("../../services/kiosk/waiver");
const fileUploader = require("../../common/upload");
const helper = require("../../common/helper");
const email = require("../../common/email");
const courseService = require("../../services/kiosk/course");
const otpService = require("../../services/otp");

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
   *         required: true
   *         type: string
   *
   *       - in: formData
   *         name: otp
   *         description: OTP sent in the verification email
   *         required: true
   *         type: number
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
      otp: "required|integer",
      email: ["required", `regex:${helper.emailRegex}`],
    });

    if (validation.fails()) throw new ServiceError(validation.firstError());

    if (!files.signature) {
      throw new ServiceError("The signature image is required");
    }

    try {
      const otp = await otpService.getByEmail({ email: fields.email });
      await otpService.verifyCode(otp);
    } catch (err) {
      throw new ServiceError(err.message, 400);
    }

    const imageFormats = ["jpg", "jpeg", "png", "webp"];
    const uploadPath = "uploads/waiver";

    // 1. getting signature image
    fileUploader.validateFile(files.signature, imageFormats, 5);

    fields.signaturePath =
      `data:${files.signature.type};base64,` +
      (await new Promise((resolve, reject) => {
        fs.readFile(files.signature.path, (err, data) => {
          if (err)
            reject(new ServiceError("Unable to read signature file", 500));

          resolve(data.toString("base64"));
        });
      }));

    // 2. generating waiver html content
    const course = await courseService.getCourseById(fields.gcId);

    const html = await waiverService.getSignedWaiverHTML(
      course,
      fields.email,
      fields.signaturePath,
    );

    // 3. generating pdf
    const localPath = "./public/" + `${uploadPath}/${uuid()}.pdf`;
    await helper.printPDF(html, {
      pdf: {
        path: localPath,
        printBackground: true,
        margin: {
          top: "10mm",
          bottom: "0",
          left: "0",
          right: "0",
        },
      },
    });

    // 4. uploading on cloud
    fields.signaturePath = await fileUploader.upload_file(
      { path: localPath, name: localPath },
      uploadPath,
      ["pdf"],
    );

    // 5. inserting new waiver sign record
    const waiver = await waiverService.sign(
      fields.gcId,
      fields.email,
      fields.signaturePath,
    );

    // 6. sending emails to both parties
    const mailOptions = {
      subject: "Rent A Cart (Agreement)",
      message: html,
      attachments: [
        { name: "Rent A Cart (Agreement)", path: fields.signaturePath },
      ],
    };

    await Promise.allSettled([
      // 5a. sending email to signatory
      email.send({ to: fields.email, ...mailOptions }),

      // 5b. sending email to course owner
      email.send({ to: course.email, ...mailOptions }),
    ]);

    waiver.signature = fileUploader.getFileURL(fields.signaturePath);

    return apiResponse.success(res, req, waiver, 201);
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
   * /waiver/signed/course/{id}:
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
   *         description: The signingId of the waiver
   *         required: true
   *         type: integer
   *
   *     produces:
   *       - application/json
   *     responses:
   *       204:
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

exports.getWaiverContent = async (req, res) => {
  /**
   * @swagger
   *
   * /waiver/course/{id}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get the waiver content of a particular golf course.
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
    const waiver = await waiverService.getContent(req.params.id);

    return apiResponse.success(res, req, waiver, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.verifyEmail = async (req, res) => {
  /**
   * @swagger
   *
   * /email/verify:
   *   post:
   *     security:
   *       - auth: []
   *     description: Send email verification email containing the OTP, to the user
   *     tags: [Email]
   *
   *     parameters:
   *       - in: body
   *         name: body
   *         description: >
   *            `email`: Email of the user.
   *         schema:
   *             type: object
   *             required:
   *                - email
   *             properties:
   *                email:
   *                   type: string
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const validation = new Validator(req.body, {
      email: ["required", `regex:${helper.emailRegex}`],
    });

    if (validation.fails()) throw new ServiceError(validation.firstError());

    const template = fs.readFileSync(
      path.join(__dirname, "../../views/emails/email_verification.ejs"),
      {
        encoding: "utf-8",
      },
    );

    const expiry = 50000;
    const otpNumber = Math.floor(1000 + Math.random() * 9000);

    await otpService.createForEmail({
      email: req.body.email,
      code: otpNumber,
    });

    const html = ejs.render(template, {
      otp: otpNumber,
      expiration_minutes: expiry,
    });

    const mailOptions = {
      subject: "Email Verification",
      message: html,
      to: req.body.email,
    };

    await email.send(mailOptions);

    return apiResponse.success(res, req, "Verification email is sent", 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
