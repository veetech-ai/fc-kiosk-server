const CouponModel = require("../services/coupons");
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupons management
 */

exports.get_all_available = async (req, res) => {
  /**
   * @swagger
   *
   * /coupon/all/available:
   *   get:
   *     security: []
   *     description: Get Only available Coupons
   *     tags: [Coupons]
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

    const result = await CouponModel.list_available(limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /coupon/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Coupons
   *     tags: [Coupons]
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

    const result = await CouponModel.list(limit, page);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /coupon/get/{id}:
   *   get:
   *     security: []
   *     description: Get Coupon by ID
   *     tags: [Coupons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Coupon ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await CouponModel.findByID(req.params.id);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = (req, res) => {
  /**
   * @swagger
   *
   * /coupon/create:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new Coupon (Only Super Admin)
   *     tags: [Coupons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: title
   *         description: Coupon title
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: Coupon description
   *         in: formData
   *         required: false
   *         type: string
   *       - name: expiry
   *         description: expiry of Coupon (Date)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: code
   *         description: Coupon code (Unique)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: discount_type
   *         description: Coupon discount type (Fixed or Percentage) 0=fixed, 1=percentage
   *         in: formData
   *         required: true
   *         type: number
   *       - name: discount
   *         description: discount rate
   *         in: formData
   *         required: true
   *         type: number
   *       - name: max_use_limit
   *         description: Number of max user to use it
   *         in: formData
   *         required: false
   *         type: number
   *       - name: coupon_for
   *         description: Coupon for user or device_type, 0=user, 1=device type
   *         in: formData
   *         required: true
   *         type: number
   *       - name: users
   *         description: Comma separated user ids
   *         in: formData
   *         required: false
   *         type: string
   *       - name: device_types
   *         description: Comma separated device_type ids
   *         in: formData
   *         required: false
   *         type: string
   *       - name: status
   *         description: Coupon status, 0=active, 1=in-active
   *         in: formData
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      title: "required",
      expiry: "required",
      code: "required",
      discount_type: "required",
      discount: "required",
      max_use_limit: "required",
      coupon_for: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const result = await CouponModel.create(req.body);
        return apiResponse.success(res, req, result);
      } catch (err) {
        if (err == "exists")
          return apiResponse.fail(res, "Coupon code already exists");
        else return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /coupon/update/{couponId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update coupon (Only Super Admin)
   *     tags: [Coupons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: couponId
   *         description: Coupon ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: title
   *         description: Coupon title
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: Coupon description
   *         in: formData
   *         required: false
   *         type: string
   *       - name: expiry
   *         description: expiry of Coupon (Date)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: discount_type
   *         description: Coupon discount type (Fixed or Percentage) 0=fixed, 1=percentage
   *         in: formData
   *         required: true
   *         type: number
   *       - name: discount
   *         description: discount rate
   *         in: formData
   *         required: true
   *         type: number
   *       - name: max_use_limit
   *         description: Number of max user to use it
   *         in: formData
   *         required: false
   *         type: number
   *       - name: coupon_for
   *         description: Coupon for user or device_type, 0=user, 1=device type
   *         in: formData
   *         required: true
   *         type: number
   *       - name: users
   *         description: Comma separated user ids
   *         in: formData
   *         required: false
   *         type: string
   *       - name: device_types
   *         description: Comma separated device_type ids
   *         in: formData
   *         required: false
   *         type: string
   *       - name: status
   *         description: Coupon status, 0=active, 1=in-active
   *         in: formData
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      title: "required",
      expiry: "required",
      discount_type: "required",
      discount: "required",
      max_use_limit: "required",
      coupon_for: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const coupon_id = req.params.couponId;

        if (!coupon_id) {
          return apiResponse.fail(res, "Coupon not found", 404);
        }

        const coupon = await CouponModel.findByID(coupon_id);
        if (!coupon) return apiResponse.fail(res, "Coupon not found", 404);

        await CouponModel.update(coupon_id, req.body);

        return apiResponse.success(res, req, "updated");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update_status = async (req, res) => {
  /**
   * @swagger
   *
   * /coupon/status/{couponId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update coupon status (Only Super Admin)
   *     tags: [Coupons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: couponId
   *         description: Coupon ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: status
   *         description: Coupon status
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      status: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const coupon_id = req.params.couponId;
        if (!coupon_id) return apiResponse.fail(res, "Coupon not found", 404);

        const coupon = await CouponModel.findByID(coupon_id);
        if (!coupon) return apiResponse.fail(res, "Coupon not found", 404);

        await CouponModel.update(coupon_id, req.body);
        return apiResponse.success(res, req, "updated");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.validate = async (req, res) => {
  /**
   * @swagger
   *
   * /coupon/validate:
   *   post:
   *     security:
   *      - auth: []
   *     description: Validate Coupon
   *     tags: [Coupons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: code
   *         description: coupon code
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const code = req.body.code;
    const user_id = req.user.id;

    const coupon = await CouponModel.validate(code);
    if (!coupon)
      return apiResponse.fail(res, "Invalid Coupon or coupon may expire");

    // Pending case
    if (coupon.coupon_for !== 0)
      return apiResponse.fail(
        res,
        "Invalid Coupon or coupon may expire. Coupon is for Devices. This case is pending",
      );

    // check coupon already used by current user or not
    if (coupon.Coupon_Used) {
      let already_used = false;

      for (let i = 0; i < coupon.Coupon_Used.length; i++) {
        if (coupon.Coupon_Used[i].user_id == user_id) {
          already_used = true;
          break;
        }
      }

      if (already_used) return apiResponse.fail(res, "Coupon already used");

      if (!coupon.users) return apiResponse.success(res, req, coupon);

      // no body used this coupon yet
      if (coupon.users.split(",").indexOf(user_id) >= 0)
        return apiResponse.success(res, req, coupon);
      else return apiResponse.fail(res, "Invalid Coupon or coupon may expire");
    } else {
      // coupon for user
      if (!coupon.users) return apiResponse.success(res, req, coupon);

      // no body used this coupon yet
      if (coupon.users.split(",").indexOf(user_id) >= 0)
        return apiResponse.success(res, req, coupon);
      else return apiResponse.fail(res, "Invalid Coupon or coupon may expire");
    }
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.apply = async (req, res) => {
  /**
   * @swagger
   *
   * /coupon/apply:
   *   post:
   *     security:
   *      - auth: []
   *     description: Apply Coupon
   *     tags: [Coupons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: code
   *         description: coupon code
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const code = req.body.code;

    const coupon = await CouponModel.validate(code);

    if (coupon) return apiResponse.success(res, req, coupon);
    else
      return apiResponse.fail(res, "Invalid Coupon or coupon may expire", 400);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
