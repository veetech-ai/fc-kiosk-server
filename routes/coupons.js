const config = require("../config/config");
const CouponsController = require("../controllers/coupons");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}coupons`;

  router.get(group + "/all/available", [
    // validation_middleware.validJWTNeeded,
    CouponsController.get_all_available,
  ]);

  router.get(group + "/get/:id", [
    // validation_middleware.validJWTNeeded,
    CouponsController.get_by_id,
  ]);

  // for admin
  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    CouponsController.get_all,
  ]);

  router.post(group + "/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCoupons"]),
    CouponsController.create,
  ]);

  router.put(group + "/update/:couponId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    CouponsController.update,
  ]);

  router.put(group + "/status/:couponId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    CouponsController.update_status,
  ]);

  router.post(group + "/validate", [
    validation_middleware.validJWTNeeded,
    CouponsController.validate,
  ]);

  router.post(group + "/apply", [
    validation_middleware.validJWTNeeded,
    CouponsController.apply,
  ]);
};
