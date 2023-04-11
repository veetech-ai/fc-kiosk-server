const config = require("../config/config");
const JazzCashController = require("../controllers/jazzcash");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}jazzcash`;

  router.post(group + "/pay/mobile-account", [
    validation_middleware.validJWTNeeded,
    JazzCashController.pay_with_mobile_account,
  ]);

  router.post(group + "/redirect-endpoint", [
    JazzCashController.redirect_endpoint,
  ]);
};
