const HomeController = require("../controllers/home");

exports.routesConfig = function (app, router) {
  router.get("/", HomeController.index);
};
