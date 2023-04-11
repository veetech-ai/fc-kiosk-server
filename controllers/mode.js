const ModeModel = require("../services/mode");
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");

/**
 * @swagger
 * tags:
 *   name: Mode
 *   description: Mode management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /mode/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Mode (Only Admin)
   *     tags: [Mode]
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

    const result = await ModeModel.list(limit, page);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /mode/get/{id}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get mode by ID
   *     tags: [Mode]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Mode ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await ModeModel.findByID(req.params.id);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = (req, res) => {
  /**
   * @swagger
   *
   * /mode/create:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new Mode (Only Admin)
   *     tags: [Mode]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: Mode name (Unique)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: value
   *         description: Mode Value (Use for MQTT)
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      name: "required",
      value: "required|numeric",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const result = await ModeModel.create(req.body);
        return apiResponse.success(res, req, result);
      } catch (err) {
        if (err == "exists") {
          return apiResponse.fail(res, "Mode already exists", 422);
        }
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update_mode = (req, res) => {
  /**
   * @swagger
   *
   * /mode/update/{modeId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update mode (Only Admin)
   *     tags: [Mode]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: modeId
   *         description: Mode ID
   *         in: path
   *         required: true
   *         type: string
   *
   *       - name: name
   *         description: Mode name (Unique)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: value
   *         description: Mode Value (Use for MQTT)
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      name: "required",
      value: "required|numeric",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const mode_id = req.params.modeId;

      if (!mode_id) {
        return apiResponse.fail(res, "Mode not found", 404);
      }

      try {
        const mode = await ModeModel.findByID(mode_id);
        if (!mode) return apiResponse.fail(res, "Mode not found", 404);

        const check_name = await ModeModel.findByName(req.body.name);

        let allow_update = true;
        if (check_name && check_name.id != mode_id) {
          allow_update = false;
        }

        if (!allow_update)
          return apiResponse.fail(res, "Mode already exists", 422);

        await ModeModel.update(mode_id, req.body);

        const updated_mode = await ModeModel.findByName(req.body.name);
        return apiResponse.success(res, req, updated_mode);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
