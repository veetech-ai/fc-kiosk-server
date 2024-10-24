const validation_middleware = require("../../middlewares/auth.validation");
const config = require("../../config/config");
const GhinController = require("../../controllers/kiosk/ghin");

exports.routesConfig = function (app, router) {
  const ghin = `${config.app.apiPath}ghin`;

  router.patch(ghin + `/:gcId`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    GhinController.update,
  ]);
};
