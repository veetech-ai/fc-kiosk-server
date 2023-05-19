// External Imports
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Logger Imports
const { logger } = require("../logger");

// Common Imports
const apiResponse = require("../common/api.response");
const helper = require("../common/helper");

// Services Imports
const { getRoleByTitle } = require("../services/role");
const deviceQueries = require("../services/device");
const deviceOnboardingCodeServices = require("../services/kiosk/device_onboarding_code");

// Configuration Imports
const config = require("../config/config");
const secret = config.jwt.secret;

exports.validJWTNeeded = (req, res, next) => {
  if (req.headers.authorization) {
    try {
      req.user = jwt.verify(req.headers.authorization, secret);
      return next();
    } catch (err) {
      // err.message = "jwt expired" // In case, if token is expired.
      return apiResponse.fail(res, "Token invalid or expire", 401);
    }
  } else {
    return apiResponse.fail(res, "Token not provided", 401);
  }
};

exports.isValidDeviceCode = async (req, res, next) => {
  const authCodeHeader = req.get("Device-Onboarding-Code");
  if (authCodeHeader) {
    // check if is the similar code
    const isValidCode =
      await deviceOnboardingCodeServices.isValidDeviceOnboardingCode(
        authCodeHeader,
      );

    if (!isValidCode) {
      return apiResponse.fail(res, "Invalid code", 401);
    }

    // refresh the token so it cannot be used again
    await deviceOnboardingCodeServices.refreshDeviceOnboardingCode();
    
    const mqttPayload = {
      action: "refresh"
    }

    helper.mqtt_publish_message(`d/onboarding-code`, mqttPayload, false);

    next();
  } else {
    return apiResponse.fail(res, "Device code not provided", 401);
  }
};

exports.onlyDeviceAccess = (req, res, next) => {
  if (req.headers.authorization) {
    try {
      req.device = jwt.verify(req.headers.authorization, secret);
      if (!Object.prototype.hasOwnProperty.call(req.device, "serial")) {
        return apiResponse.fail(res, "Token invalid or expire", 403);
      }
      return next();
    } catch (err) {
      // err.message = "jwt expired" // In case, if token is expired.
      return apiResponse.fail(res, "Token invalid or expire", 401);
    }
  } else {
    return apiResponse.fail(res, "Token not provided", 401);
  }
};
exports.validJWTOptional = (req, res, next) => {
  if (req.headers?.authorization) {
    try {
      req.user = jwt.verify(req.headers.authorization, secret);
      return next();
    } catch (err) {
      return apiResponse.fail(res, "Token invalid or expire", 401);
    }
  } else {
    return next();
  }
};

exports.blockApis = (req, res, next) => {
  return apiResponse.fail(res, "Api blocked", 403);
};

exports.superAdminWithOrganizationIdOrCustomerAccess = (req, res, next) => {
  logger.info("🚀 ~ file: auth.validation.js:30 ~ req.user", req.user);
  if (req.user) {
    if (
      helper.hasProvidedRoleRights(req.user.role, ["super"]).success &&
      req.body.organization
    ) {
      return next();
    } else if (
      helper.hasProvidedRoleRights(req.user.role, ["manageDevices"]).success
    ) {
      return next();
    } else {
      if (!req.body.organization) {
        return apiResponse.fail(res, "Organization not provided.", 403);
      } else {
        return apiResponse.fail(res, "You are not allowed", 403);
      }
    }
  } else {
    return apiResponse.fail(res, "Token not provided", 401);
  }
};

exports.superAdminOrAdminOrCustomerAccess = (req, res, next) => {
  const isSuperAdmin = req?.user?.role
    ? helper.hasProvidedRoleRights(req.user.role, ["super"]).success
    : null;
  const isOnlyAdmin = req?.user?.role
    ? helper.hasProvidedRoleRights(req.user.role, ["admin"]).success &&
      !isSuperAdmin
    : null;

  const superAdminAllowedRole = ["admin", "super admin"];
  const orgId =
    req?.body?.orgId ||
    req?.body?.organization ||
    req?.params?.orgId ||
    req?.params?.organizationId;
  req.body.orgId = orgId;
  const sameOrgId = orgId ? parseInt(orgId) === req?.user?.orgId : true;

  const isSameOrgCustomerOrCeo =
    helper.hasProvidedRoleRights(req.user.role, ["manageUsers"]).success &&
    sameOrgId;

  const isCustomerWithRightRole =
    isSameOrgCustomerOrCeo && !superAdminAllowedRole.includes(req?.body?.role);
  const isAdminWithRightRole =
    isOnlyAdmin && !superAdminAllowedRole.includes(req?.body?.role);

  if (isCustomerWithRightRole || isSuperAdmin || isAdminWithRightRole)
    return next();
  return apiResponse.fail(res, "", 403);
};
// userAccessOwnResource
exports.userAccessOwnOrganizationResource = async (req, res, next) => {
  const isSuperAdmin = req?.user?.super_admin;

  const notAllowedRole = ["admin", "super admin"];
  const orgId =
    req?.body?.orgId ||
    req?.body?.organization ||
    req?.params?.orgId ||
    req?.params?.organizationId;

  req.body.orgId = orgId;
  const isSameOrgCustomer = orgId && parseInt(orgId) === req?.user?.orgId;

  const isCustomerWithRightRole =
    isSameOrgCustomer && !notAllowedRole.includes(req?.body?.role);

  const isAdminWithRightRole =
    req?.user?.admin && !notAllowedRole.includes(req?.body?.role);

  if (isCustomerWithRightRole || isSuperAdmin || isAdminWithRightRole)
    return next();

  return apiResponse.fail(res, "You are not allowed", 403);
};

exports.usersWithOrWithoutOwnOrganizationIdAccess = async (req, res, next) => {
  // admin or super admin can see any organization's users
  // organization user can see only their own organization's resource.

  if (!req.user) return apiResponse.fail(res, "Token not provided", 401);

  const userRole = req.user.role
    ? await getRoleByTitle(req.user.role.title)
    : null;
  if (!userRole) return apiResponse.fail(res, "", 403);

  if (userRole.super || userRole.admin) return next();

  // Check for the organization id either in path or body or query and assign the value to orgId
  const orgId =
    req.params.organizationId || req.body.orgId || req.body.organization;

  if (!req.user.orgId) return apiResponse.fail(res, "", 403);

  if (req.user.orgId !== parseInt(orgId))
    return apiResponse.fail(res, "You do not belong to this organization", 403);

  return next();
};

exports.userAccessOwnOrganizationDevice = async (req, res, next) => {
  // admin or super admin can see any organization's devices
  // organization user can see only their own organization's device.

  if (!req.user) return apiResponse.fail(res, "Token not provided", 401);

  const userRole = req.user.role
    ? await getRoleByTitle(req.user.role.title)
    : null;
  if (!userRole) return apiResponse.fail(res, "", 403);

  if (userRole.super || userRole.admin) return next();

  if (!req.user.orgId) return apiResponse.fail(res, "", 403);

  const providedDeviceId = req.params.deviceId || req.params.id;
  if (!providedDeviceId)
    return apiResponse.fail(res, "Device id not provided", 400);

  const foundDevice = await deviceQueries.findById(providedDeviceId);
  if (!foundDevice) return apiResponse.fail(res, "Device not found", 404);

  if (req.user.orgId !== foundDevice.owner_id)
    return apiResponse.fail(
      res,
      "The device does not belong to your organization",
      400,
    );
  return next();
};

exports.userAccessOwnUserInformation = async (req, res, next) => {
  // admin or super admin can see any users's information
  // All Other users can see only their own user information.

  if (!req.user) return apiResponse.fail(res, "Token not provided", 401);

  const userRole = req.user.role
    ? await getRoleByTitle(req.user.role.title)
    : null;
  if (!userRole) return apiResponse.fail(res, "", 403);

  if (userRole.super || userRole.admin) return next();

  const providedUserId = req.params.userId;

  if (req.user.id !== Number(providedUserId))
    return apiResponse.fail(res, "", 403);

  return next();
};

exports.valid_verify_token = (req, res, next) => {
  if (req.query.token) {
    return next();
  } else {
    return apiResponse.fail(res, "Invalid link. Or link may be expire", 401);
  }
};

exports.custom_token = (req, res, next) => {
  try {
    if (req.headers.fsshc) {
      if (req.headers.fsshc == config.fsshcToken) {
        return next();
      } else {
        return apiResponse.fail(res, "Not allowed", 403);
      }
    } else {
      return apiResponse.fail(res, "Token not provided", 401);
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

/**
 * How To Call Me

    router.get('/route', [
      middlewares.hasAccess(['listUsers', 'manageUsers'])
      controller.controllerAlpha
    ])
 */

exports.hasAccess =
  (requiredRoleRights = null) =>
  async (req, res, next) => {
    try {
      if (!req.user.role) throw new Error();
      const roleInfo = await getRoleByTitle(req.user.role.title);
      if (!roleInfo) throw new Error();

      if (!requiredRoleRights && roleInfo.super) return next();

      if (!roleInfo.super && !roleInfo.admin) {
        const resourceOrgId =
          req.body.orgId || req.query.orgId || req.params.orgId;

        if (resourceOrgId && req.user.orgId != resourceOrgId) throw new Error();
      }
      const hasProvidedRoleRights = helper.hasProvidedRoleRights(
        roleInfo,
        requiredRoleRights,
      );
      if (!hasProvidedRoleRights.success) throw new Error();
      next();
    } catch (error) {
      return apiResponse.fail(res, "You are not allowed", 403);
    }
  };

exports.validReCaptchaToken = async (req, res, next) => {
  try {
    if (!req.headers.captchatoken)
      return apiResponse.fail(res, "Captcha token not provided", 401);
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: config.googleCaptchaSecret,
          response: req.headers.captchatoken,
        },
      },
    );
    if (response.data.success) return next();
    else return apiResponse.fail(res, "Captcha token is not valid", 401);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
