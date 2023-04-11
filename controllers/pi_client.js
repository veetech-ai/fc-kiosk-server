const apiResponse = require("../common/api.response");

/**
 * @swagger
 * tags:
 *   name: Client
 *   description: client apis
 */

exports.get_sim_limit = async (req, res) => {
  /**
   * @swagger
   *
   *  /client/sim-limit:
   *   post:
   *     security:
   *       - auth: []
   *     description: Get sim limit
   *     tags: [Client]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: cnic
   *         description: cnic
   *         in: formData
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const { cnic } = req.body;
    setTimeout(() => {
      if (cnic == "1111111111111") {
        apiResponse.fail(res, "limit exceed");
      } else {
        apiResponse.success(res, true);
      }
    }, 1000); // delay for check sim limit
  } catch (err) {
    apiResponse.fail(res, err.message);
  }
};
