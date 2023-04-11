const config = require("../config/config");
const CurlController = require("../controllers/curl");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}curl`;

  router.get(group + "/get", [CurlController.get]);

  router.post(group + "/post", [CurlController.post]);

  router.put(group + "/put", [CurlController.put]);

  router.delete(group + "/delete", [CurlController.delete]);
};
