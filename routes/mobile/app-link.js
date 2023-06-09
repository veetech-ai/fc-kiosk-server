const config = require("../../config/config");
const AppLinkController = require("../../controllers/mobile/app-link");

exports.routesConfig = function (app, router) {
  const appLink = `${config.app.apiPath}app-link`;

  router.get(appLink, [AppLinkController.getMobileAppLink]);
};
