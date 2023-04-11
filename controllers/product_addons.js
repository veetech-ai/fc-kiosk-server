const ProductAddonsModel = require("../services/product_addons");
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");

const formidable = require("formidable");
const upload_file = require("../common/upload");

const { logger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: ProductAddons
 *   description: ProductAddons management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /product-addons/all:
   *   get:
   *     security: []
   *     description: Get Product Addons
   *     tags: [ProductAddons]
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

    const result = await ProductAddonsModel.list(limit, page);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_all_active = async (req, res) => {
  /**
   * @swagger
   *
   * /product-addons/active/all:
   *   get:
   *     security: []
   *     description: Get All active Product Addons
   *     tags: [ProductAddons]
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

    const result = await ProductAddonsModel.active_list(limit, page);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_product_addons_all = async (req, res) => {
  /**
   * @swagger
   *
   * /product-addons/product/{productAddonId}/all:
   *   get:
   *     security: []
   *     description: Get Product Addons
   *     tags: [ProductAddons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: productAddonId
   *         description: Product ID
   *         in: path
   *         required: true
   *         type: string
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

    const result = await ProductAddonsModel.product_addons_list(
      req.params.productAddonId,
      limit,
      page,
    );

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /product-addons/get/{id}:
   *   get:
   *     security: []
   *     description: Get Product addon by ID
   *     tags: [ProductAddons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Product ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await ProductAddonsModel.findByID(req.params.id);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = (req, res) => {
  /**
   * @swagger
   *
   * /product-addons/create:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new Product addon (Only Super Admin)
   *     tags: [ProductAddons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: title
   *         description: Product addon title (Unique)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: description of product addon
   *         in: formData
   *         required: false
   *         type: string
   *       - name: price
   *         description: price of product addon
   *         in: formData
   *         required: true
   *         type: number
   *       - name: image
   *         description: Product addon Image
   *         in: formData
   *         required: true
   *         type: file
   *     responses:
   *       200:
   *         description: success
   */

  const form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    if (err) return apiResponse.fail(res, err.message);

    const validation = new Validator(fields, {
      title: "required",
      price: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        // No need to update key logic here as it is not in use in viaphoton server
        const uploadedFilePath = await upload_file.upload_file(
          files.image,
          "mix",
          ["jpg", "png", "pneg", "jpeg"],
        );

        fields.image = uploadedFilePath;

        const result = await ProductAddonsModel.create(fields);
        return apiResponse.success(res, req, result);
      } catch (err) {
        if (err == "exists") {
          apiResponse.fail(res, "Product addon name already exists");
        } else {
          logger.error(err.message);
          apiResponse.fail(res, err.message, 500);
        }
      }
    });
  });
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /product-addons/update/{productAddonId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update product addon (Only Super Admin)
   *     tags: [ProductAddons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: productAddonId
   *         description: product addon ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: title
   *         description: Product title (Unique)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: description of product
   *         in: formData
   *         required: false
   *         type: string
   *       - name: price
   *         description: price of product
   *         in: formData
   *         required: true
   *         type: number
   *       - name: image
   *         description: Product Image
   *         in: formData
   *         required: false
   *         type: file
   *     responses:
   *       200:
   *         description: success
   */

  const form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    if (err) return apiResponse.fail(res, err.message);

    const validation = new Validator(fields, {
      title: "required",
      price: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const productAddonId = req.params.productAddonId;

      if (!productAddonId)
        return apiResponse.fail(res, "product addon not found");

      try {
        const product = await ProductAddonsModel.findByID(productAddonId);
        if (!product) return apiResponse.fail(res, "product addon not found");

        const checkName = await ProductAddonsModel.findByWhere({
          title: fields.title,
        });

        let allowUpdate = true;

        if (checkName && checkName.id != productAddonId) {
          allowUpdate = false;
        }

        if (!allowUpdate)
          return apiResponse.fail(res, "product addon already exists");

        if (files.image) {
          // No need to update key logic here as it is not in use in viaphoton server
          const uploadedFilePath = await upload_file.upload_file(
            files.image,
            "mix",
            ["jpg", "png", "pneg", "jpeg"],
          );

          fields.image = uploadedFilePath;

          await ProductAddonsModel.update(productAddonId, fields);

          const updatedProduct = await ProductAddonsModel.findByID(
            productAddonId,
          );

          return apiResponse.success(res, req, updatedProduct);
        } else {
          await ProductAddonsModel.update(productAddonId, fields);

          const updatedProduct = await ProductAddonsModel.findByID(
            productAddonId,
          );

          return apiResponse.success(res, req, updatedProduct);
        }
      } catch (error) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  });
};

exports.delete = async (req, res) => {
  /**
   * @swagger
   *
   * /product-addons/delete/{id}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete product addon
   *     tags: [ProductAddons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: product addon ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const id = req.params.id;
    if (!id) return apiResponse.fail(res, "product addon not found", 404);

    const product = await ProductAddonsModel.findByID(id);
    if (!product) return apiResponse.fail(res, "product addon not found", 404);

    const result = await ProductAddonsModel.delete(id);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
