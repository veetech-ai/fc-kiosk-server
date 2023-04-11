const config = require("../config/config");
const ProductController = require("../controllers/product");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}product`;

  router.get(group + "/all/active", [ProductController.get_all_active]);

  // for admin
  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductController.get_all,
  ]);

  router.get(group + "/get/:id", [ProductController.get_by_id]);

  router.get(group + "/get-single", [ProductController.get_single]);

  router.get(group + "/selective/:ids", [
    validation_middleware.validJWTNeeded,
    ProductController.list_selective,
  ]);

  router.post(group + "/create", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductController.create,
  ]);

  router.put(group + "/update/:productId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductController.update,
  ]);

  router.post(group + "/attach-addons", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductController.attach_addons,
  ]);

  router.delete(group + "/delete/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductController.delete,
  ]);
};
