const config = require("../config/config");
const GameController = require("../controllers/game/game");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const game = `${config.app.apiPath}game`;
  router.post(game + "/", [
    validation_middleware.validJWTNeeded,
    GameController.create_game,
  ]);
//   router.get(courses + "/:orgId", [
//     validation_middleware.validJWTNeeded,
//     validation_middleware.hasAccess(["super", "admin", "getCourses"]),
//     CoursesController.get_courses_for_organization,
//   ]);
};
