const FirmwareModel = require("../services/firmware");
const DeviceMetadataModel = require("../services/device_metadata");
const DeviceVPLogsModel = require("../services/device_vp_logs");
const FvReportsModel = require("../services/fv_reports");

const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");

const formidable = require("formidable");
const upload_file = require("../common/upload");
const helper = require("../common/helper");

/**
 * @swagger
 * tags:
 *   name: Firmware
 *   description: Firmware management (Only for Super Admin)
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /firmware/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get firmware (Only Super Admin)
   *     tags: [Firmware]
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

    const result = await FirmwareModel.list(limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /firmware/get/{id}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get firmware by ID (Only for Super Admin)
   *     tags: [Firmware]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: firmware ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await FirmwareModel.findByID(req.params.id);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_ver = async (req, res) => {
  /**
   * @swagger
   *
   * /firmware/get-by-ver/{ver}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get firmware by Version (Only for Super Admin)
   *     tags: [Firmware]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: firmware version
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await FirmwareModel.findByVer(req.params.ver);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  /**
   * @swagger
   *
   * /firmware/create:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new firmware (Only Super Admin)
   *     tags: [Firmware]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: firmware name (Unique)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: ver
   *         description: Version
   *         in: formData
   *         required: true
   *         type: string
   *       - name: hw_ver
   *         description: Hardware Version
   *         in: formData
   *         required: true
   *         type: string
   *       - name: file
   *         description: Hardware Version
   *         in: formData
   *         required: true
   *         type: file
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      if (err) return apiResponse.fail(res, err.message);

      const validation = new Validator(
        fields,
        {
          name: "required",
          ver: "required",
          hw_ver: "required",
        },
        {
          "required.ver": "The version field is required.",
          "required.hw_ver": "The hardware version field is required.",
        },
      );

      validation.fails(function () {
        return apiResponse.fail(res, validation.errors);
      });

      validation.passes(async function () {
        try {
          // use case changed so no need to update the URL logic with key logic
          const uploaded_file_path = await upload_file.upload_binary(
            files.file,
          );

          fields.file = uploaded_file_path;
          const result = await FirmwareModel.create(fields);
          return apiResponse.success(res, req, result);
        } catch (err) {
          if (err == "exists")
            return apiResponse.fail(res, "Firmware already exists");
          else return apiResponse.fail(res, err.message, 500);
        }
      });
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /firmware/update/{firmwareId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update firmware (Only Super Admin)
   *     tags: [Firmware]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: firmwareId
   *         description: firmware ID
   *         in: path
   *         required: true
   *         type: string
   *
   *       - name: name
   *         description: firmware name (Unique)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: ver
   *         description: Version
   *         in: formData
   *         required: true
   *         type: string
   *       - name: hw_ver
   *         description: Hardware Version
   *         in: formData
   *         required: true
   *         type: string
   *       - name: file
   *         description: Binary file
   *         in: formData
   *         required: true
   *         type: file
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      if (err) return apiResponse.fail(res, err.message);

      const validation = new Validator(fields, {
        name: "required",
        ver: "required",
        hw_ver: "required",
      });

      validation.fails(function () {
        return apiResponse.fail(res, validation.errors);
      });

      validation.passes(async function () {
        const firmware_id = req.params.firmwareId;

        if (!firmware_id) return apiResponse.fail(res, "Firmware not found");

        try {
          const firmware = await FirmwareModel.findByID(firmware_id);
          if (!firmware) return apiResponse.fail(res, "Firmware not found");

          const version_exists = await FirmwareModel.verExists(
            fields.ver,
            fields.hw_ver,
            firmware_id,
          );

          if (version_exists)
            return apiResponse.fail(res, "Firmware already exists");

          // use case changed so no need to update the URL logic with key logic
          const uploaded_file_path = await upload_file.upload_binary(
            files.file,
          );

          fields.file = uploaded_file_path;
          await FirmwareModel.update(firmware_id, fields);

          const updated_firmware = await FirmwareModel.findByVer(fields.ver);
          return apiResponse.success(res, req, updated_firmware);
        } catch (err) {
          return apiResponse.fail(res, err.message, 500);
        }
      });
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.delete = async (req, res) => {
  /**
   * @swagger
   *
   * /firmware/delete/{id}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete firmware
   *     tags: [Firmware]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Firmware ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const id = req.params.id;
    if (!id) return apiResponse.fail(res, "Firmware not found", 404);

    const firmware = await FirmwareModel.findByID(id);
    if (!firmware) return apiResponse.fail(res, "Firmware not found", 404);

    const result = await FirmwareModel.delete(id);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_firmware_v0_logs = async (req, res) => {
  /**
   * @swagger
   *
   * /firmware/v0-logs/{fv}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get firmware logs (Only Super Admin)
   *     tags: [Firmware]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    let type = 1;
    if (
      req.query.t &&
      (req.query.t == 1 || req.query.t == 2 || req.query.t == 3)
    ) {
      type = req.query.t;
    }

    const result = await DeviceMetadataModel.list_by_where(
      { fv: req.params.fv, type: type },
      helper.get_pagination_params(req.query),
    );

    return apiResponse.pagination(
      res,
      req,
      {
        logs: result.data,
      },
      result.count,
    );
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_firmware_vp_logs = async (req, res) => {
  /**
   * @swagger
   *
   * /firmware/vp-logs/{fv}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get firmware logs (Only Super Admin)
   *     tags: [Firmware]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    let type = 1;
    if (
      req.query.t &&
      (req.query.t == 1 || req.query.t == 2 || req.query.t == 3)
    ) {
      type = req.query.t;
    }

    const result = await DeviceVPLogsModel.list_by_where(
      { fv: req.params.fv, type: type },
      helper.get_pagination_params(req.query),
    );

    return apiResponse.pagination(
      res,
      req,
      {
        logs: result.data,
      },
      result.count,
    );
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update_count = async (req, res) => {
  /**
   * @swagger
   *
   * /firmware/update-count:
   *   post:
   *     security:
   *       - auth: []
   *     description: Update firmware device count for all devices (Only Super Admin)
   *     tags: [Firmware]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    await FvReportsModel.update_all_counts();

    return apiResponse.success(res, req, "ok");
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
