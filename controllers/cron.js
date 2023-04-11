const CronJob = require("cron").CronJob;
const BillingController = require("../controllers/billing");

const { logger } = require("../logger");

const device_billing = new CronJob(
  "0 */12 * * *",
  function () {
    logger.info("CRON: device_billing");
    BillingController.check_device_billing();
  },
  null,
  true,
  "UTC",
);
module.exports.device_billing = device_billing;

const billing_notification = new CronJob(
  "0 3/12 * * *",
  function () {
    logger.info("CRON: send_billing_notifications");
    BillingController.send_billing_notifications();
  },
  null,
  true,
  "UTC",
);
module.exports.billing_notification = billing_notification;
