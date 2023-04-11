const config = require("../config/config");
const UserAddressController = require("../controllers/user_addresses");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}user-addresses`;

  router.get(group, [
    validation_middleware.validJWTNeeded,
    UserAddressController.list,
  ]);

  router.get(group + "/get/:addressId", [
    validation_middleware.validJWTNeeded,
    UserAddressController.get_by_id,
  ]);

  router.post(group + "/new", [
    validation_middleware.validJWTNeeded,
    UserAddressController.add_new,
  ]);

  router.put(group + "/update/:addressId", [
    validation_middleware.validJWTNeeded,
    UserAddressController.update,
  ]);

  router.delete(group + "/delete/:addressId", [
    validation_middleware.validJWTNeeded,
    UserAddressController.delete_by_id,
  ]);

  router.get(group + "/get-default", [
    validation_middleware.validJWTNeeded,
    UserAddressController.get_default_address,
  ]);

  router.post(group + "/make-default/:addressId", [
    validation_middleware.validJWTNeeded,
    UserAddressController.make_default,
  ]);
};
