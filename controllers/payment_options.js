// External Module Imports
const Validator = require("validatorjs");
const formidable = require("formidable");

// Common Imports
const apiResponse = require("../common/api.response");
const upload_file = require("../common/upload");

// Services Imports
const PaymentOptionsModel = require("../services/payment_options");

/**
 * @swagger
 * tags:
 *   name: Payment Options
 *   description: Payment Options management
 */

exports.get_all_available = async (req, res) => {
  /**
   * @swagger
   *
   * /payment-option/all/available:
   *   get:
   *     security: []
   *     description: Get Only available Payment Options
   *     tags: [Payment Options]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const limit =
      req.query.limit && req.query.limit <= 100
        ? parseInt(req.query.limit)
        : 10;
    let page = 0;
    if (req.query) {
      if (req.query.page) {
        req.query.page = parseInt(req.query.page);
        page = Number.isInteger(req.query.page) ? req.query.page : 0;
      }
    }

    const result = await PaymentOptionsModel.list_available(limit, page);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /payment-option/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Payment Options
   *     tags: [Payment Options]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const limit =
      req.query.limit && req.query.limit <= 100
        ? parseInt(req.query.limit)
        : 10;
    let page = 0;
    if (req.query) {
      if (req.query.page) {
        req.query.page = parseInt(req.query.page);
        page = Number.isInteger(req.query.page) ? req.query.page : 0;
      }
    }

    const result = await PaymentOptionsModel.list(limit, page);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /payment-option/get/{id}:
   *   get:
   *     security: []
   *     description: Get Payment Option by ID
   *     tags: [Payment Options]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Payment Option ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await PaymentOptionsModel.findByID(req.params.id);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /payment-option/update/{paymentOptionId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update Payment Option (Only Super Admin)
   *     tags: [Payment Options]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: paymentOptionId
   *         description: Payment Option ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: description
   *         description: description of Payment Option
   *         in: formData
   *         required: false
   *         type: string
   *       - name: image
   *         description: Payment Option Image
   *         in: formData
   *         required: false
   *         type: file
   *     responses:
   *       200:
   *         description: success
   */

  const form = new formidable.IncomingForm();

  form.parse(req, async function (err, fields, files) {
    if (err) return apiResponse.fail(res, err.message);

    const paymentOptionId = req.params.paymentOptionId;
    if (!paymentOptionId)
      return apiResponse.fail(res, "payment option not found");

    try {
      const paymentOption = await PaymentOptionsModel.findByID(paymentOptionId);
      if (!paymentOption)
        return apiResponse.fail(res, "payment option not found");

      if (files.image) {
        // No need to update key logic here as it is not in use in viaphoton server
        const uploadedFilePath = await upload_file.upload_file(
          files.image,
          "payment_options",
          ["jpg", "png", "pneg", "jpeg"],
        );

        fields.image = uploadedFilePath;

        const result = await PaymentOptionsModel.update(
          paymentOptionId,
          fields,
        );

        return apiResponse.success(res, req, result);
      } else {
        const result = await PaymentOptionsModel.update(
          paymentOptionId,
          fields,
        );
        return apiResponse.success(res, req, result);
      }
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.update_status = (req, res) => {
  /**
   * @swagger
   *
   * /payment-option/status/{paymentOptionId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update Payment Option status (Only Super Admin)
   *     tags: [Payment Options]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: paymentOptionId
   *         description: Payment Option ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: status
   *         description: Payment Option status
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    status: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    const paymentOptionId = req.params.paymentOptionId;

    if (!paymentOptionId)
      return apiResponse.fail(res, "Payment Option not found", 404);

    try {
      const paymentOption = await PaymentOptionsModel.findByID(paymentOptionId);
      if (!paymentOption)
        return apiResponse.fail(res, "Payment Option not founddd", 404);

      await PaymentOptionsModel.update(paymentOptionId, req.body);
      return apiResponse.success(res, req, "updated");
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};
