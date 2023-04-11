const apiResponse = require("../../common/api.response");
const RolesServices = require("../../services/role");

/**
 * @swagger
 *
 * /roles/:
 *   get:
 *     security:
 *      - auth: []
 *     description: Get all roles
 *     tags: [Roles]
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: includeExtraRoles
 *         description: if set to true then extra roles will be included e.g., device role
 *         in: query
 *         required: false
 *         type: boolean
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 */

exports.getAll = async (req, res) => {
  try {
    const userOrgId = req.user.orgId;
    let includeExtraRoles = req.query.includeExtraRoles == "true";
    const roles = await RolesServices.getAll(userOrgId, includeExtraRoles);
    if (!roles.length) return apiResponse.fail(res, "Roles not found", 404);
    return apiResponse.success(res, req, roles);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};
