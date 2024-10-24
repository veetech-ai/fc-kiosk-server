// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../common/api.response");
const stripe = require("../common/stripe");
const email = require("../common/email");

// Configuration Imports
const settings = require("../config/settings");

// Service Imports
const OrderModel = require("../services/order");

// Logger Import
const { logger } = require("../logger");

/**
 * This code is only for code backup of strip. Its not using anywhere
 */

/**
 * //@swagger
 * tags:
 *   name: Stripe
 *   description: Stripe APIs.
 */

exports.stripeAddNewProduct = (req, res) => {
  /**
   * //@swagger
   *
   * /stripe/new-product:
   *   post:
   *     security:
   *      - auth: []
   *     description: Add new product to stripe account
   *     tags: [Stripe]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: Product Name
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  const validation = new Validator(req.body, {
    name: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const result = await stripe.create_product({
        name: req.body.name,
      });

      return apiResponse.success(res, req, result);
    } catch (err) {
      return apiResponse.fail(res, err.message);
    }
  });
};

exports.stripeGetAllProducts = async (req, res) => {
  /**
   * //@swagger
   *
   * /stripe/get-all-products:
   *   get:
   *     security: []
   *     description: Get all stripe products
   *     tags: [Stripe]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const result = await stripe.get_products();
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.stripeGetProduct = async (req, res) => {
  /**
   * //@swagger
   *
   * /stripe/get-product/{id}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get all stripe products
   *     tags: [Stripe]
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
    const result = await stripe.get_product({ id: req.params.id || false });
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.stripeUpdateProduct = (req, res) => {
  /**
   * //@swagger
   *
   * /stripe/update-product/{id}:
   *   put:
   *     security:
   *      - auth: []
   *     description: Add new product to stripe account
   *     tags: [Stripe]
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
   *       - name: name
   *         description: Product Name
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  const validation = new Validator(req.body, {
    name: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const result = await stripe.update_product({
        id: req.params.id,
        attributes: {
          name: req.body.name,
        },
      });

      return apiResponse.success(res, req, result);
    } catch (err) {
      return apiResponse.fail(res, err.message);
    }
  });
};

exports.stripeDeleteProduct = async (req, res) => {
  /**
   * //@swagger
   *
   * /stripe/delete-product/{id}:
   *   delete:
   *     security:
   *      - auth: []
   *     description: Add new product to stripe account
   *     tags: [Stripe]
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
    const result = await stripe.delete_product({
      id: req.params.id,
    });

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.stripeCharge = (req, res) => {
  /**
   * //@swagger
   *
   * /stripe/charge:
   *   post:
   *     security:
   *      - auth: []
   *     description: To charge a credit card or other payment source
   *     tags: [Stripe]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: amount
   *         description: Product amount
   *         in: formData
   *         required: true
   *         type: number
   *       - name: source
   *         description: Payment source
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: description
   *         in: formData
   *         required: false
   *       - name: client_tz
   *         description: Client timezone
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Success
   */
  const validation = new Validator(req.body, {
    amount: "required",
    source: "required",
    client_tz: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const order = await OrderModel.findByID(req.body.order_id);
      if (!order) return apiResponse.fail(res, "Order not found");

      const stripe_data = {
        amount: req.body.amount,
        source: req.body.source,
        description: req.body.description || null,
        receipt_email: req.user.email,
        metadata: {
          charge_from_platform: settings.get("company_name"),
          user_id: req.user.id,
          user_email: req.user.email,
          user_name: req.user.name,
          user_phone: req.user.phone || null,
          order_id: req.body.order_id,
        },
      };

      const charge = await stripe.charge(stripe_data);

      const payment_info = {
        method: "stripe",
        charge_id: charge.id,
        source: req.body.source,
        payment_method: charge.payment_method,
      };

      try {
        await OrderModel.update(req.body.order_id, {
          client_tz: req.body.client_tz,
          payment_info: JSON.stringify(payment_info),
          status: 1,
          payment_method: 4,
        });

        email.send_place_order_emails(req.body.order_id);
        apiResponse.success(res, req, order);
      } catch (error) {
        logger.error(error);
        apiResponse.success(res, req, order);
      }
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};
