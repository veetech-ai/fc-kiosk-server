const TimezoneModel = require("../services/timezone");
const apiResponse = require("../common/api.response");

/**
 * @swagger
 * tags:
 *   name: Timezone
 *   description: Timezone management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /timezone/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Timezone
   *     tags: [Timezone]
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

    const result = await TimezoneModel.list(limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
exports.time = (req, res) => {
  /**
   * @swagger
   *
   * /timezone/time:
   *   get:
   *     description: Get current time
   *     tags: [Timezone]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const tsm = new Date().getTime();
    return apiResponse.success(res, req, { tsm });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};
