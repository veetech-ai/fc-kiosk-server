const validation_middleware = require("../../middlewares/auth.validation");
const config = require("../../config/config");
const GhinController = require("../../controllers/kiosk/ghin");
exports.routesConfig = function (app, router) {
  const ads = `${config.app.apiPath}ghin`;

  router.patch(ads + `/:gcId`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    GhinController.update,
  ]);
};
