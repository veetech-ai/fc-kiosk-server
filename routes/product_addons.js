const config = require("../config/config");
const ProductAddonsController = require("../controllers/product_addons");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}product-addons`;

  // for admin
  router.get(group + "/all", [ProductAddonsController.get_all]);

  router.get(group + "/active/all", [ProductAddonsController.get_all_active]);

  router.get(group + "/product/:productAddonId/all", [
    ProductAddonsController.get_product_addons_all,
  ]);

  router.get(group + "/get/:id", [ProductAddonsController.get_by_id]);

  router.post(group + "/create", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductAddonsController.create,
  ]);

  router.put(group + "/update/:productAddonId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductAddonsController.update,
  ]);

  router.delete(group + "/delete/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductAddonsController.delete,
  ]);
};
