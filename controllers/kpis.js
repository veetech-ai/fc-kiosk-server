const apiResponse = require("../common/api.response");
const Transactions = require("../services/transactions");
const TransactionLogs = require("../services/transaction_logs");
const DeviceModel = require("../services/device");

/**
 * @swagger
 * tags:
 *   name: KPIs
 *   description: KPIs
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /kpis/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Graph
   *     tags: [KPIs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_id
   *         description: Device ID
   *         in: query
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const transactionsData = {
      history: 0,
      language: {},
      number_selection: {},
      billing: {},
      service_used: {},
      transactions: {
        failed: 0,
        rejected: 0,
        pending: 0,
      },
    };
    const device_id = req.query.device_id || null;
    let orgId = null;
    if (!req.user.admin) {
      orgId = req.user.orgId;
    }
    const transactions = await Transactions.getMetrics({
      organizationId: orgId,
      device_id,
    });
    transactionsData.transactions.pending = transactions.pending;
    transactionsData.transactions.failed = transactions.failed;
    transactionsData.transactions.rejected = transactions.rejected;
    transactionsData.transactions.successful = transactions.successful;
    transactionsData.transactions.timed_out = transactions.timeout;
    transactionsData.transactions.cancelled = transactions.cancelled;
    transactionsData.transactions.total = transactions.total;
    transactionsData.sims_dispensed = transactions.sims_dispensed;
    transactionsData.feedback_score = transactions.feedback_score;
    transactionsData.service_used.new_sim = transactions.new_sim;
    transactionsData.service_used.duplicate_sim = transactions.duplicate_sim;
    transactionsData.service_used.packages = transactions.packages;
    transactionsData.avg_screen_time = transactions.avg_screen_time;
    transactionsData.language.english = transactions.english;
    transactionsData.language.urdu = transactions.urdu;
    transactionsData.number_selection.advance = transactions.advance;
    transactionsData.number_selection.list = transactions.list;
    transactionsData.billing.pre = transactions.pre;
    transactionsData.billing.post = transactions.post;
    transactionsData.passport = transactions.passport;
    transactionsData.pakistani = transactions.pakistani;
    transactionsData.foreigners = transactions.foreigners;
    transactionsData.avg_approval_time = transactions.avg_approval_time;
    if (device_id == null) {
      transactionsData.online_devices = await DeviceModel.getOnlineDevicesCount(
        { owner_id: !req.user.admin ? req.user.orgId : false },
      );
      transactionsData.offline_devices =
        await DeviceModel.getOfflineDevicesCount({
          owner_id: !req.user.admin ? req.user.orgId : false,
        });
    }

    apiResponse.success(res, req, transactionsData);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.get_feedback_data = async (req, res) => {
  /**
   * @swagger
   *
   * /kpis/feedback:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get feedback data
   *     tags: [KPIs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_id
   *         description: Device ID
   *         in: query
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const device_id = req.query.device_id || null;

    apiResponse.success(
      res,
      req,
      await Transactions.getFeedbackData({
        user_id: req.user.id,
        device_id,
      }),
    );
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.get_avg_screen_time = async (req, res) => {
  /**
   * @swagger
   *
   * /kpis/avg-screen-time:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Average screen time counts
   *     tags: [KPIs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_id
   *         description: Device ID
   *         in: query
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const device_id = req.query.device_id || null;

    apiResponse.success(
      res,
      req,
      await TransactionLogs.getAvgScreensTime({
        user_id: req.user.id,
        device_id,
      }),
    );
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.get_type_time = async (req, res) => {
  /**
   * @swagger
   *
   * /kpis/avg-type-time:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Average type time counts
   *     tags: [KPIs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_id
   *         description: Device ID
   *         in: query
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const device_id = req.query.device_id || null;

    apiResponse.success(
      res,
      req,
      await TransactionLogs.getAvgTypeTime({
        user_id: req.user.id,
        device_id,
      }),
    );
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};
