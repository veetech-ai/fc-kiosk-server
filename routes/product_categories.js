const config = require("../config/config");
const ProductCategoriesController = require("../controllers/product_categories");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}product-category`;

  router.get(group + "/all/active", [
    // validation_middleware.validJWTNeeded,
    ProductCategoriesController.get_all_active,
  ]);

  router.get(group + "/get/:id", [
    // validation_middleware.validJWTNeeded,
    ProductCategoriesController.get_by_id,
  ]);

  // for admin
  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductCategoriesController.get_all,
  ]);

  router.post(group + "/create", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductCategoriesController.create,
  ]);

  router.put(group + "/update/:categoryId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ProductCategoriesController.update,
  ]);

  // router.delete(group+'/:categoryId', [
  //     validation_middleware.validJWTNeeded,
  //     validation_middleware.hasAccess([ 'super', 'admin' ]),
  //     ProductCategoriesController.update_status
  // ]);
};
