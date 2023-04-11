require("dotenv").config();
const orgUserRelFpUser = require("../controllers/org_user_rel_fp_user");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${process.env.API_PATH}orgUserRelFpUser`;

  router.post(group + "/", [
    validation_middleware.validJWTNeeded,
    orgUserRelFpUser.create,
  ]);

  router.delete(group + "/", [
    validation_middleware.validJWTNeeded,
    orgUserRelFpUser.delete,
  ]);

  router.get(group + "/", [
    validation_middleware.validJWTNeeded,
    orgUserRelFpUser.get_all,
  ]);
};
