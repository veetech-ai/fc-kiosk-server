require("dotenv").config();
const orgTypesController = require("../controllers/organization_type");
const validationMiddleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${process.env.API_PATH}organization-types`;

  router
    .route(`${group}/`)
    .get([
      validationMiddleware.validJWTNeeded,
      validationMiddleware.hasAccess(["admin", "super"]),
      orgTypesController.listOrgTypes,
    ])
    .post([
      validationMiddleware.validJWTNeeded,
      validationMiddleware.hasAccess(["admin", "super"]),
      orgTypesController.createOrgType,
    ]);

  router
    .route(`${group}/:id`)
    .get([
      validationMiddleware.validJWTNeeded,
      validationMiddleware.hasAccess(["admin", "super"]),
      orgTypesController.getOrgTypeById,
    ]);
};
