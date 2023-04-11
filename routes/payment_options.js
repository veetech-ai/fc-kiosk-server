const config = require("../config/config");
const PaymentOptionController = require("../controllers/payment_options");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}payment-option`;

  router.get(group + "/all/available", [
    // validation_middleware.validJWTNeeded,
    PaymentOptionController.get_all_available,
  ]);

  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    PaymentOptionController.get_all,
  ]);

  router.get(group + "/get/:id", [PaymentOptionController.get_by_id]);

  router.put(group + "/update/:paymentOptionId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    PaymentOptionController.update,
  ]);

  router.put(group + "/status/:paymentOptionId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    PaymentOptionController.update_status,
  ]);
};
