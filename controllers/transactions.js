// External Module Imports
const formidable = require("formidable");
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../common/api.response");
const helper = require("../common/helper");
const fileUpload = require("../common/upload");

// Service Imports
const TransactionsModel = require("../services/transactions");
const TransactionsAttachmentsModel = require("../services/transactions_attachments");

// Configuration Imports
const config = require("../config/config");

// Logger Imports
const { logger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transactions management
 */

exports.get = (req, res) => {
  /**
   * @swagger
   *
   * /transactions:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Transactions
   *     tags: [Transactions]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: limit
   *         description: limit of records per request
   *         in: query
   *         required: false
   *         type: number
   *       - name: passport_only
   *         description: get only passport transactions
   *         in: query
   *         required: false
   *         type: boolean
   *       - name: page
   *         description: page number
   *         in: query
   *         required: false
   *         type: number
   *       - name: filters
   *         description: filters, JSON String
   *         in: query
   *         required: false
   *         type: string
   *         example: >
   *           <br>
   *           <code>{ "device_id": "11", "service": "new_sim", "status": "success", "cnic": "8888888888888", "mobile_number": "123456789" }</code><br>
   *           <code>{ "service": "new_sim" }</code><br>
   *           <code>{ "status": "success" }</code><br>
   *           All these keys are optional.
   *       - name: columns
   *         description: Get selected columns only. Comma separated string. e.g cnic,device_id,mobile_number,passport_number
   *         in: query
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    if (req.query.passport_only && req.query.passport_only === "true") {
      req.query.passport_only = true;
    } else {
      req.query.passport_only = false;
    }

    if (req.query.columns) {
      req.query.columns = req.query.columns.split(",");
    } else {
      req.query.columns = false;
    }

    const validation = new Validator(req.query, {
      filters: "json",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const paginationParams = helper.get_pagination_params(req.query);

        let filters = null;
        if (req.query.filters) {
          filters = JSON.parse(req.query.filters);
          logger.info(filters);
        }

        const result = await TransactionsModel.list({
          organizationId: !req.user.admin ? req.user.orgId : false,
          filters,
          pp: paginationParams,
          passport_only: req.query.passport_only,
          columns: req.query.columns,
        });

        return apiResponse.pagination(res, req, result.data, result.count);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.getTransactionById = (req, res) => {
  /**
   * @swagger
   *
   * /transactions/{id}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Transaction by ID
   *     tags: [Transactions]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: transaction ID
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.params, {
    id: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const transaction = await TransactionsModel.getById({
        id: req.params.id,
      });

      return apiResponse.success(res, req, transaction);
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.changeTransactionStatus = (req, res) => {
  /**
   * @swagger
   *
   * /transactions/{id}/status:
   *   post:
   *     security:
   *       - auth: []
   *     description: CHange Transaction status (approve or reject)
   *     tags: [Transactions]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: transaction ID
   *         in: path
   *         required: true
   *         type: number
   *       - name: status
   *         description: status. 1=Approved, 2=Rejected
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    status: "required|in:1,2",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const transaction = await TransactionsModel.updateStatusById({
        sessionId: req.params.id,
        status: req.body.status,
        approvalDecision: req.body.approvalDecisionAt,
        decisionMadeBy: req.body.decidedBy,
        orgId: helper.hasProvidedRoleRights(req.user.role, ["super", "admin"])
          .success
          ? null
          : req.user.orgId,
      });

      const action = { success: true };

      logger.info(typeof req.user.id);

      helper.mqtt_publish_message(
        `u/${req.user.id}/approval`,
        { action },
        false,
      );

      return apiResponse.success(res, req, transaction);
    } catch (err) {
      if (err === "notAllowed")
        return apiResponse.fail(
          res,
          "You can not make decision outside your organization",
          403,
        );
      else if (err === "noForeignTransaction")
        return apiResponse.fail(res, "Operation can not be performed", 400);

      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.transactionAttachment = (req, res) => {
  /**
   * @swagger
   *
   * /transactions/{session_id}/attachment:
   *   post:
   *     security:
   *       - auth: []
   *     description: Transaction attachment
   *     tags: [Transactions]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: session_id
   *         description: Session ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: attachment
   *         description: file in binary
   *         in: formData
   *         required: true
   *         type: file
   *       - name: type
   *         description: type of attachment. e.g (passport1,passport2,passport3,picture,video,document)
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    if (err) return apiResponse.fail(res, err.message);

    const validation = new Validator(fields, {
      type: "required|in:passport1,passport1.1,passport2,passport2.2,passport3,passport3.3,picture,video,document",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const uploadPath = `documents/${req.params.session_id}/${fields.type}`;

        // No need to update key logic here as it is not in use in viaphoton server
        const uploaded_file_url = await fileUpload.upload_file(
          files.attachment,
          uploadPath,
          [],
        );

        const filename = helper.beutify_file_name(files.attachment.name);

        const attachment = await TransactionsAttachmentsModel.save({
          session_id: req.params.session_id,
          type: fields.type,
          host: fileUpload.getHost(),
          path: uploadPath,
          title: filename,
          filename: files.attachment.name,
          url: uploaded_file_url,
          cdn_url:
            config.azure.upload && config.azure.upload === true
              ? config.azure.storageCDN +
                config.azure.storageContainer +
                "/" +
                uploadPath +
                "/" +
                files.attachment.name
              : uploaded_file_url,
        });

        return apiResponse.success(res, req, attachment);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  });
};

exports.getTransactionAttachments = (req, res) => {
  /**
   * @swagger
   *
   * /transactions/{session_id}/attachments:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Transaction attachment by session ID
   *     tags: [Transactions]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: session_id
   *         description: transaction Session ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: type
   *         description: type of attachment. e.g (passport1,passport2,passport3,picture,video,document)
   *         in: query
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.params, {
    session_id: "required",
    type: "in:passport1,passport2,passport3,picture,video,document",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const attachments = await TransactionsAttachmentsModel.getBySessionId({
        session_id: req.params.session_id,
        type: req.query.type || null,
      });

      return apiResponse.success(res, req, attachments);
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};
