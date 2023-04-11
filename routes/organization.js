const config = require("../config/config");
const OrganizationController = require("../controllers/organization");
const validation_middleware = require("../middlewares/auth.validation");
const orgUserRelFpUser = require("../controllers/org_user_rel_fp_user");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}organization`;

  router.get(group + "/getAllOrganizations", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    OrganizationController.getAllOrganizations,
  ]);
  // TODO:
  // need to create rights for organization resource as well
  // e.g., getOrganizations,  manageOrganizations
  router.get(group + "/get/:organizationId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getUsers",
      "manageUsers",
    ]),
    validation_middleware.userAccessOwnOrganizationResource,
    OrganizationController.getById,
  ]);

  router.post(group + "/add-organization", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    OrganizationController.addOrganization,
  ]);

  router.post(group + "/fp", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageUsers"]),
    orgUserRelFpUser.create,
  ]);

  router.delete(group + "/fp", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageUsers"]),
    orgUserRelFpUser.delete,
  ]);

  router.get(group + "/fp", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "manageUsers",
      "getUsers",
    ]),
    orgUserRelFpUser.getAll,
  ]);
};
