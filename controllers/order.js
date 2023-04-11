const Validator = require("validatorjs");

const OrderModel = require("../services/order");
const OrderItemsModel = require("../services/order_items");
const CouponUsedModel = require("../services/coupon_used");

const apiResponse = require("../common/api.response");
const helper = require("../common/helper");
const email = require("../common/email");
const { products } = require("../common/products");

const { logger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Orders management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /order/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Orders
   *     tags: [Order]
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

    const result = await OrderModel.list(
      limit,
      page,
      req.query.f ? { status: req.query.f.split(",") } : false,
    );

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.my_all_orders = async (req, res) => {
  /**
   * @swagger
   *
   * /order/my:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get My Orders
   *     tags: [Order]
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

    const result = await OrderModel.my_list(req.user.orgId, limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /order/get/{id}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Order by ID
   *     tags: [Order]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Order ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const where = { id: req.params.id };
    if (req.user.orgId) where.orgId = req.user.orgId;
    const result = await OrderModel.findByWhere(where);

    if (result) {
      return apiResponse.success(res, req, result);
    } else {
      return apiResponse.fail(res, "Order not found");
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_last_pending_order = async (req, res) => {
  /**
   * @swagger
   *
   * /order/get-last-pending:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get last pending order of user
   *     tags: [Order]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await OrderModel.getLastPendingOrder(req.user.id);

    if (result) {
      return apiResponse.success(res, req, result);
    } else {
      return apiResponse.fail(res, "Order not found");
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.new = (req, res) => {
  /**
   * @swagger
   *
   * /order/new:
   *   post:
   *     security: []
   *     description: new order
   *     tags: [Order]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_id
   *         description: User ID if user login
   *         in: formData
   *         required: false
   *         type: string
   *       - name: ip_address
   *         description: IP Address of user
   *         in: formData
   *         required: false
   *         type: string
   *       - name: payment_method
   *         description: Payment Method 1=cash on delivery, 2=credit/debit visa card payment, 3=bank transfer/easy paisa/omni etc, 4=paypal
   *         in: formData
   *         required: false
   *         type: number
   *       - name: payment_info
   *         description: payment info (JSON String)
   *         in: formData
   *         required: false
   *         type: string
   *       - name: shipping_address
   *         description: shipping address (JSON String)
   *         in: formData
   *         required: false
   *         type: string
   *       - name: voucher
   *         description: voucher info (JSON String)
   *         in: formData
   *         required: false
   *         type: string
   *       - name: items
   *         description: Order items (JSON String)
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

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

  const validation = new Validator(req.body, {
    ip_address: "required",
    payment_info: "json",
    shipping_address: "string",
    voucher: "json",
    items: "json",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const newOrder = await OrderModel.create(req.body);

      const items = JSON.parse(req.body.items);

      // order items created
      items.forEach((key) => {
        key.order_id = newOrder.id;
        key.product_id = products.kiosk.id;
      });

      await OrderItemsModel.bulkCreate(items);

      try {
        const order = await OrderModel.findByID(newOrder.id);

        return apiResponse.success(res, req, order);
      } catch (error) {
        logger.error(error);
        return apiResponse.success(res, req, req, newOrder);
      }
    } catch (error) {
      return apiResponse.fail(res, error.message, 500);
    }
  });
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /order/update/{orderId}:
   *   put:
   *     security: []
   *     description: update order
   *     tags: [Order]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_id
   *         description: User ID if user login
   *         in: formData
   *         required: false
   *         type: string
   *       - name: order_id
   *         description: order ID
   *         in: formData
   *         required: false
   *         type: string
   *       - name: payment_method
   *         description: Payment Method 1=cash on delivery, 2=credit/debit visa card payment, 3=bank transfer/easy paisa/omni etc, 4=paypal
   *         in: formData
   *         required: false
   *         type: number
   *       - name: payment_info
   *         description: payment info (JSON String)
   *         in: formData
   *         required: false
   *         type: number
   *       - name: shipping_address
   *         description: shipping address (JSON String)
   *         in: formData
   *         required: false
   *         type: string
   *       - name: voucher
   *         description: voucher info (JSON String)
   *         in: formData
   *         required: false
   *         type: string
   *       - name: items
   *         description: Order items (JSON String)
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

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

  const validation = new Validator(req.body, {
    payment_info: "json",
    shipping_address: "json",
    voucher: "json",
    items: "json",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const user_from_token = helper.get_user_from_token(req);

      const order = await OrderModel.update(req.params.orderId, req.body);

      if (req.body.items) {
        const items = JSON.parse(req.body.items);
        const itemsArray = Object.entries(items);
        itemsArray.forEach((key) => {
          key.order_id = req.params.orderId;
        });

        try {
          await OrderItemsModel.delete({ order_id: req.params.orderId });
          await OrderItemsModel.bulkCreate(items);
        } catch (err) {
          logger.error("order update err");
          logger.error(err.message);
        }
      }

      if (req.body.place_order && req.body.place_order == "yes") {
        email.send_place_order_emails(req.params.orderId);

        // check user uses coupon
        try {
          const voucher = JSON.parse(req.body.voucher);

          if (voucher && voucher.id) {
            try {
              // apply user voucher
              await CouponUsedModel.create({
                user_id: user_from_token.id,
                coupon_id: voucher.id,
              });

              // coupon added against user
            } catch (err) {
              // user coupon insertions error
              logger.error("user coupon insertions error");
              logger.error(err);
            }
          } else {
            // user use no coupon
          }
        } catch (err) {
          // user use no coupon
          logger.error("coupon catch err");
          logger.error(err);
        }
      }

      try {
        const latest_order = await OrderModel.findByID(req.params.orderId);

        return apiResponse.success(res, req, latest_order);
      } catch (err) {
        logger.error(err.message);
        return apiResponse.success(res, req, req, order);
      }
    } catch (err) {
      logger.error(err.message);
      apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.change_status = async (req, res) => {
  /**
   * @swagger
   *
   * /order/status/{orderId}:
   *   put:
   *     security:
   *          - auth: []
   *     description: Change order status
   *     tags: [Order]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: orderId
   *         description: Order ID
   *         in: path
   *         required: true
   *         type: number
   *       - name: status
   *         description: Order status
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const id = req.params.orderId;
    if (!id) return apiResponse.fail(res, "order not found", 404);

    const order = await OrderModel.findByID(id);
    if (!order) return apiResponse.fail(res, "Order not found", 404);

    const result = await OrderModel.update(id, { status: req.body.status });
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
