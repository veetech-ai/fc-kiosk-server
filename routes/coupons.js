const config = require("../config/config");
const CouponsController = require("../controllers/coupons");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}coupons`;

  router.get(group + "/courses/:courseId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCoupons"]),
    CouponsController.findCouponsByCourseId,
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

  router.delete(group + "/:couponId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCoupons"]),
    CouponsController.deleteCouponById,
  ]);
};
