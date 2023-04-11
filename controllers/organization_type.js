require("dotenv").config();

const helper = require("../common/helper");
const OrganizationTypeQueries = require("../services/organization_type");
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");

const { logger } = require("../logger");

exports.listOrgTypes = async (req, res) => {
  /**
   * @swagger
   *
   * /organization-types/:
   *   get:
   *     security:
   *     - auth: []
   *     description: Get All the organization types
   *     tags: [Organization Types]
   *     parameters:
   *       - name: limit
   *         description: Number of record to show per query.
   *         in: query
   *         required: false
   *         type: string
   *       - name: page
   *         description: Page Number to query.
   *         in: query
   *         required: false
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
    req.query.limit = req.query.limit || 500;
    req.query.page = req.query.page || 1;
    const params = helper.get_pagination_params(req);
    const allOrgTypes = await OrganizationTypeQueries.listOrgTypes(params);
    apiResponse.pagination(res, req, allOrgTypes.data, allOrgTypes.count);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.getOrgTypeById = async (req, res) => {
  /**
   * @swagger
   *
   * /organization-types/{id}:
   *   get:
   *     security:
   *     - auth: []
   *     description: Get organization type id
   *     tags: [Organization Types]
   *     parameters:
   *       - name: id
   *         description: organization type ID.
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
    logger.info(req.params.id);
    const organizationType = await OrganizationTypeQueries.findOrgTypeById(
      req.params.id,
    );
    apiResponse.success(res, req, organizationType);
  } catch (error) {
    if (error.message === "404")
      return apiResponse.fail(res, "Organization type not found", 404);
    return apiResponse.fail(res, error, 500);
  }
};

exports.createOrgType = async (req, res) => {
  /**
   * @swagger
   *
   * /organization-types/:
   *   post:
   *     security:
   *     - auth: []
   *     description: Create an organization type
   *     tags: [Organization Types]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: title
   *         description: organization type title
   *         in: formData
   *         required: true
   *         type: string
   *       - name: peopleMetrics
   *         description: peopleMetrics Dashboard Access
   *         in: formData
   *         required: false
   *         type: boolean
   *       - name: simKiosk
   *         description: simKiosk Dashboard Access
   *         in: formData
   *         required: false
   *         type: boolean
   *       - name: weatherStation
   *         description: weatherStation Dashboard Access
   *         in: formData
   *         required: false
   *         type: boolean
   *     responses:
   *       200:
   *         description: Activates the account
   */
  try {
    const validation = new Validator(req.body, {
      title: "required",
    });
    validation.fails(() => apiResponse.fail(res, validation.errors));

    validation.passes(async () => {
      try {
        const createdOrgType = await OrganizationTypeQueries.createOrgType(
          req.body,
        );
        apiResponse.success(res, req, createdOrgType);
      } catch (error) {
        if (error.message === "exists")
          return apiResponse.fail(
            res,
            "Organization Type with title already exists",
            400,
          );
        return apiResponse.fail(res, error.message, 500);
      }
    });
  } catch (error) {
    return apiResponse.fail(res, error.message, 500);
  }
};
