const config = require("../config/config");
const SQController = require("../controllers/security_questions");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}security-questions`;

  router.get(group, [validation_middleware.validJWTNeeded, SQController.list]);

  router.get(group + "/user/with-answer", [
    validation_middleware.validJWTNeeded,
    SQController.user_questions_answers,
  ]);

  router.get(group + "/user", [SQController.user_questions]);

  router.post(group + "/user/answer", [
    validation_middleware.validJWTNeeded,
    SQController.save_user_answer,
  ]);

  router.post(group + "/user/validate/answer", [
    SQController.validate_user_answer,
  ]);
};
