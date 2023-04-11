const config = require("../config/config");
const TransactionsController = require("../controllers/transactions");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}transactions`;

  router.get(group, [
    validation_middleware.validJWTNeeded,
    TransactionsController.get,
  ]);
  router.get(group + "/:id", [
    validation_middleware.validJWTNeeded,
    TransactionsController.getTransactionById,
  ]);
  router.post(group + "/:id/status", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageDevices"]),
    TransactionsController.changeTransactionStatus,
  ]);
  router.post(group + "/:session_id/attachment", [
    validation_middleware.validJWTNeeded,
    TransactionsController.transactionAttachment,
  ]);
  router.get(group + "/:session_id/attachments", [
    validation_middleware.validJWTNeeded,
    TransactionsController.getTransactionAttachments,
  ]);
};
