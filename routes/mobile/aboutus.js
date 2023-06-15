const config = require("../../config/config");
const aboutusController = require("../../controllers/mobile/aboutus");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const aboutus = `${config.app.apiPath}aboutus`;

  router.get(aboutus, [
    validation_middleware.validJWTOptional,
    aboutusController.getAboutUs,
  ]);
  router.put(`${aboutus}/:id`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    aboutusController.updateAboutUs,
  ]);
};
