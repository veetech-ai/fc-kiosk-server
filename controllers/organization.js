const models = require("../models");
const helper = require("../common/helper");
const OrganizationsServices = require("../services/organization");
const UserModel = require("../services/user");
const Organization = models.Organization;
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");
const ServiceError = require("../utils/serviceError");

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

    const result = await OrganizationsServices.list(params);

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
    name: "required|string",
    email: "required|email"
  });

  validation.fails(function () {
    apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const organizationCreationBody = helper.validateObject(req.body, ["name", "email", "description"])
      
      const userCreationBody = helper.validateObject(organizationCreationBody, ["name", "email"])
      
      const isOrganizationExist = await OrganizationsServices.isOrganizationExist({name: req.body.name});
      if (isOrganizationExist) throw new ServiceError("Organization already exists", 409);


      // Create default customer for the organization 

      userCreationBody.role = "customer"
      const invitation = await UserModel.createAndInviteUser({
        ...userCreationBody,
      });

      // Create organization
      const organization = await OrganizationsServices.createOrganization(organizationCreationBody)

      // Set the owner for the respective user
      await UserModel.update_where({ orgId: organization.id }, { email: userCreationBody.email })

      return apiResponse.success(res, req, {...invitation, orgId: organization.id});
    } catch (error) {
      return apiResponse.fail(res, error.message, error.statusCode || 500);
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
    const organization = await OrganizationsServices.findById(
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
