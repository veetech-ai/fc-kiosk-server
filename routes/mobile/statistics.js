const config = require("../../config/config");
const StatisticsController = require("../../controllers/mobile/statistics");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const statistics = `${config.app.apiPath}statistics`;
  router.get(statistics + "/users/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["manageGames"]),
    StatisticsController.getStatistics,
  ]);
};
