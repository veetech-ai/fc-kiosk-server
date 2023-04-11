// External Imports
const Validator = require("validatorjs");
const formidable = require("formidable");

// Service Imports
const ProductModel = require("../services/product");
const ProductAddonBridgeModel = require("../services/product_addons_bridge");

// Common Imports
const apiResponse = require("../common/api.response");
const upload_file = require("../common/upload");

// Logger Imports
const { logger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /product/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Products
   *     tags: [Product]
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

    const result = await ProductModel.list(limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_all_active = async (req, res) => {
  /**
   * @swagger
   *
   * /product/all/active:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get all active Products
   *     tags: [Product]
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

    const result = await ProductModel.list_active(limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /product/get/{id}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Product by ID
   *     tags: [Product]
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
    const result = await ProductModel.findByID(req.params.id);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_single = async (req, res) => {
  /**
   * @swagger
   *
   * /product/get-single:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get single Product (last active)
   *     tags: [Product]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await ProductModel.getLastActiveSingle();

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.list_selective = async (req, res) => {
  /**
   * @swagger
   *
   * /product/selective/{ids}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Products
   *     tags: [Product]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: ids
   *         description: Comma separated product IDs
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

    const ids = req.params.ids.split(",");

    const result = await ProductModel.list_selective(limit, page, ids);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = (req, res) => {
  /**
   * @swagger
   *
   * /product/create:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new Product (Only Super Admin)
   *     tags: [Product]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
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
   *       - name: shipping_charges
   *         description: shipping charges of product
   *         in: formData
   *         required: false
   *         type: number
   *       - name: tax
   *         description: tax applied on product
   *         in: formData
   *         required: false
   *         type: string
   *       - name: image
   *         description: Product Image
   *         in: formData
   *         required: true
   *         type: file
   *       - name: heading
   *         description: Product Page Heading
   *         in: formData
   *         required: false
   *         type: string
   *       - name: points
   *         description: Product bullets point (in json string)
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    if (err) return apiResponse.fail(res, err.message);

    Validator.register(
      "json",
      function (value, requirement, attribute) {
        try {
          JSON.parse(value);
        } catch (e) {
          return false;
        }
        return true;
      },
      "The :attribute must be JSON string",
    );

    const validation = new Validator(fields, {
      title: "required",
      price: "required",
      points: "json",
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

        logger.info(uploadedFilePath);
        fields.image = uploadedFilePath;

        const result = await ProductModel.create(fields);
        return apiResponse.success(res, req, result);
      } catch (err) {
        if (err == "exists")
          return apiResponse.fail(res, "Product already exists");
        else return apiResponse.fail(res, err.message, 500);
      }
    });
  });
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /product/update/{productId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update product (Only Super Admin)
   *     tags: [Product]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: productId
   *         description: product ID
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
   *       - name: shipping_charges
   *         description: shipping charges of product
   *         in: formData
   *         required: false
   *         type: number
   *       - name: tax
   *         description: tax applied on product
   *         in: formData
   *         required: false
   *         type: string
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
      const productId = req.params.productId;

      if (!productId) return apiResponse.fail(res, "product not found");

      try {
        const product = await ProductModel.findByID(productId);
        if (!product) return apiResponse.fail(res, "product not found");

        const checkName = await ProductModel.findByWhere({
          title: fields.title,
        });

        let allowUpdate = true;

        if (checkName && checkName.id != productId) {
          allowUpdate = false;
        }

        if (!allowUpdate)
          return apiResponse.fail(res, "product already exists");

        if (files.image) {
          // No need to update key logic here as it is not in use in viaphoton server
          const uploadedFilePath = await upload_file.upload_file(
            files.image,
            "mix",
            ["jpg", "png", "pneg", "jpeg"],
          );

          fields.image = uploadedFilePath;

          await ProductModel.update(productId, fields);

          const updatedProduct = await ProductModel.findByID(productId);

          return apiResponse.success(res, req, updatedProduct);
        } else {
          await ProductModel.update(productId, fields);

          const updatedProduct = await ProductModel.findByID(productId);

          return apiResponse.success(res, req, updatedProduct);
        }
      } catch (err) {
        if (err == "exists")
          return apiResponse.fail(res, "Product already exists");
        return apiResponse.fail(res, err.message, 500);
      }
    });
  });
};

exports.attach_addons = (req, res) => {
  /**
   * @swagger
   *
   * /product/attach-addons:
   *   post:
   *     security:
   *      - auth: []
   *     description: Attach addons with product (Only Super Admin)
   *     tags: [Product]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: product_id
   *         description: Product ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: addons
   *         description: Addons Array
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    product_id: "required",
    addons: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      if (!req.body.addons || req.body.addons.length <= 0)
        return apiResponse.fail(res, "Please select Addons to attach.");

      const addons = req.body.addons.split(",");
      const newAddons = [];

      addons.forEach((addon) => {
        newAddons.push({
          product_id: req.body.product_id,
          addon_id: parseInt(addon),
        });
      });

      await ProductAddonBridgeModel.bulk_create({
        product_id: req.body.product_id,
        data: newAddons,
      });

      return apiResponse.success(res, req, "attached");
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.delete = async (req, res) => {
  /**
   * @swagger
   *
   * /product/delete/{id}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete product
   *     tags: [Product]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: product ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const id = req.params.id;
    if (!id) return apiResponse.fail(res, "product not found", 404);

    const product = await ProductModel.findByID(id);
    if (!product) return apiResponse.fail(res, "product not found", 404);

    const result = await ProductModel.delete(id);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
