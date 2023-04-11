const models = require("../models");
const helper = require("../common/helper");
const OrganizationModel = require("../services/organization");
const UserModel = require("../services/user");
const Organization = models.Organization;
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");

exports.getAllOrganizations = async (req, res) => {
  /**
   * @swagger
   *
   * /organization/getAllOrganizations:
   *   get:
   *     security:
   *     - auth: []
   *     description: Get All the organization for superadmin
   *     tags: [Organization]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    let params = false;
    if (req.query.limit && req.query.page) {
      params = helper.get_pagination_params(req.query);
    }

    const result = await OrganizationModel.list(params);

    return apiResponse.pagination(res, req, result.data, result.count);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.addOrganization = (req, res) => {
  /**
   * @swagger
   *
   * /organization/add-organization:
   *   post:
   *     security:
   *     - auth: []
   *     description: Add an organization in the database
   *     tags: [Organization]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: organization name to add.
   *         in: formData
   *         required: true
   *         type: string
   *       - name: email
   *         description: organization email to add.
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: Description of organization to add
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Activates the account
   */

  const validation = new Validator(req.body, {
    name: "required",
  });

  validation.fails(function () {
    apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const organization = await Organization.findOne({
        where: { name: req.body.name },
      });

      if (organization) return apiResponse.fail(res, "organizationExists", 400);

      const org = await Organization.create(req.body);

      req.body.orgId = org.id;
      req.body.role = "customer";

      const params = req.body;
      const invitation = await UserModel.createAndInviteUser({
        ...params,
      });

      return apiResponse.success(res, req, invitation);
    } catch (error) {
      if (error.message === "Organization not found") {
        return apiResponse.fail(res, error.message);
      } else if (error.message === "test organization") {
        return apiResponse.fail(
          res,
          "Can not add user to test organization",
          403,
        );
      } else {
        return apiResponse.fail(res, error.message, 500);
      }
    }
  });
};

exports.getById = async (req, res) => {
  /**
   * @swagger
   *
   * /organization/get/{organizationId}:
   *   get:
   *     security:
   *     - auth: []
   *     description: Get organization of a customer, by organization id
   *     tags: [Organization]
   *     parameters:
   *       - name: organizationId
   *         description: organization ID.
   *         in: path
   *         required: true
   *         type: string
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const organization = await OrganizationModel.findById(
      req.params.organizationId,
    );
    if (organization) {
      return apiResponse.success(res, req, organization);
    } else {
      return apiResponse.fail(res, "No Organization Found");
    }
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};
