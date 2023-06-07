const config = require("../../config/config");
const faqController = require("../../controllers/mobile/faq");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const faq = `${config.app.apiPath}faq`;

  router.get(faq, [
    validation_middleware.validJWTNeeded,
    faqController.getFaqs,
  ]);
  router.put(`${faq}/:id`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    faqController.updateFAQ,
  ]);
};
