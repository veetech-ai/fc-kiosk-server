const config = require("../config/config");
const OrderController = require("../controllers/order");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}order`;

  // for admin
  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    OrderController.get_all,
  ]);
  router.get(group + "/my", [
    validation_middleware.validJWTNeeded,
    OrderController.my_all_orders,
  ]);

  router.get(group + "/get/:id", validation_middleware.validJWTNeeded, [
    OrderController.get_by_id,
  ]);

  router.get(group + "/get-last-pending", [
    validation_middleware.validJWTNeeded,
    OrderController.get_last_pending_order,
  ]);

  router.post(group + "/new", [OrderController.new]);

  router.put(group + "/update/:orderId", [OrderController.update]);

  router.put(group + "/status/:orderId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    OrderController.change_status,
  ]);
};
