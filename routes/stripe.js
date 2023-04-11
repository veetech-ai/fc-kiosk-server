const config = require("../config/config");
const StripeController = require("../controllers/stripe");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}stripe`;

  router.post(group + "/new-product", [
    validation_middleware.validJWTNeeded,
    StripeController.stripeAddNewProduct,
  ]);

  router.get(group + "/get-all-products", [
    StripeController.stripeGetAllProducts,
  ]);

  router.get(group + "/get-product/:id", [
    validation_middleware.validJWTNeeded,
    StripeController.stripeGetProduct,
  ]);

  router.put(group + "/update-product/:id", [
    validation_middleware.validJWTNeeded,
    StripeController.stripeUpdateProduct,
  ]);

  router.delete(group + "/delete-product/:id", [
    validation_middleware.validJWTNeeded,
    StripeController.stripeDeleteProduct,
  ]);

  router.post(group + "/charge", [
    validation_middleware.validJWTNeeded,
    StripeController.stripeCharge,
  ]);
};
