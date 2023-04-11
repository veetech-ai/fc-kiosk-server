const ProductCategoriesModel = require("../services/product_categories");
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");

const { logger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: Product Categories
 *   description: Product Categories management
 */

exports.get_all_active = async (req, res) => {
  /**
   * @swagger
   *
   * /product-category/all/active:
   *   get:
   *     security: []
   *     description: Get Only available Categories
   *     tags: [Product Categories]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const limit =
      req.query.limit && req.query.limit <= 100
        ? parseInt(req.query.limit)
        : 10;
    let page = 0;
    if (req.query) {
      if (req.query.page) {
        req.query.page = parseInt(req.query.page);
        page = Number.isInteger(req.query.page) ? req.query.page : 0;
      }
    }

    const result = await ProductCategoriesModel.list_active(limit, page);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /product-category/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get all Categories (active/inactive)
   *     tags: [Product Categories]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const limit =
      req.query.limit && req.query.limit <= 100
        ? parseInt(req.query.limit)
        : 10;
    let page = 0;
    if (req.query) {
      if (req.query.page) {
        req.query.page = parseInt(req.query.page);
        page = Number.isInteger(req.query.page) ? req.query.page : 0;
      }
    }

    const result = await ProductCategoriesModel.list(limit, page);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /product-category/get/{id}:
   *   get:
   *     security: []
   *     description: Get Category by ID
   *     tags: [Product Categories]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Category ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await ProductCategoriesModel.findByID(req.params.id);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = (req, res) => {
  /**
   * @swagger
   *
   * /product-category/create:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new Category (Only Admins)
   *     tags: [Product Categories]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: title
   *         description: Category title
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: Category description
   *         in: formData
   *         required: false
   *         type: string
   *       - name: status
   *         description: Category status, 0=active, 1=in-active
   *         in: formData
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    title: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const result = await ProductCategoriesModel.create(req.body);
      return apiResponse.success(res, req, result);
    } catch (err) {
      if (err == "exists") {
        return apiResponse.fail(res, "Category already exists");
      } else {
        logger.error(err.message);
        return apiResponse.fail(res, err.message, 500);
      }
    }
  });
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /product-category/update/{categoryId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update Category (Only Admins)
   *     tags: [Product Categories]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: categoryId
   *         description: Category ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: title
   *         description: Category title
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: Category description
   *         in: formData
   *         required: false
   *         type: string
   *       - name: status
   *         description: Category status, 0=active, 1=in-active
   *         in: formData
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    title: "required",
  });

  validation.fails(function () {
    apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    const category_id = req.params.categoryId;

    if (!category_id) return apiResponse.fail(res, "Category not found", 404);

    try {
      const category = await ProductCategoriesModel.findByID(category_id);
      if (!category) return apiResponse.fail(res, "Category not found", 404);

      await ProductCategoriesModel.update(category_id, req.body);
      return apiResponse.success(res, req, "updated");
    } catch (err) {
      if (err == "exists") {
        apiResponse.fail(res, "Category already exists");
      } else {
        apiResponse.fail(res, err.message, 500);
      }
    }
  });
};
