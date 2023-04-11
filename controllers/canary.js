const FvReportsModel = require("../services/fv_reports");
const apiResponse = require("../common/api.response");

/**
 * @swagger
 * tags:
 *   name: Canary
 *   description: Canary  management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /canary/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Canary (Only Super Admin)
   *     tags: [Canary]
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

    const result = await FvReportsModel.list(limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
