const config = require("../config/config");
const BillingController = require("../controllers/billing");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}bill`;

  router.get(group + "/all/pending", [
    validation_middleware.validJWTNeeded,
    BillingController.get_all_pending,
  ]);

  router.get(group + "/user/invoices", [
    validation_middleware.validJWTNeeded,
    BillingController.get_all_user_invoices,
  ]);
  router.get(group + "/user/invoice/:invoiceId/items", [
    validation_middleware.validJWTNeeded,
    BillingController.get_all_user_invoice_items,
  ]);

  // for super admin/admin
  router.get(group + "/invoice-item/user/:userId/device/:deviceId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    BillingController.user_device_bill_invoice_item,
  ]);

  router.get(group + "/invoice-item/user/device/:deviceId", [
    validation_middleware.validJWTNeeded,
    BillingController.user_device_bill_invoice_item,
  ]);

  router.post(group + "/pay/individual", [
    validation_middleware.validJWTNeeded,
    BillingController.pay_bill_individual,
  ]);

  router.post(group + "/pay/multiple", [
    validation_middleware.validJWTNeeded,
    BillingController.pay_bill_multiple,
  ]);
};
