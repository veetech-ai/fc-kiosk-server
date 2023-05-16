const CouponServices = require("../../../services/coupons");
const apiResponse = require("../../../common/api.response");
const Validator = require("validatorjs");

const DeviceServices = require("../../../services/device");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Courses API's for Device
 */
exports.redeemCoupon = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/coupons:
   *   post:
   *     security:
   *      - auth: []
   *     description: Redeem Coupon
   *     tags: [Kiosk-Courses-Content]
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
    const validation = new Validator(req.body, {
      code: "required|string",
    });

    if (validation.fails()) return apiResponse.fail(res, validation.errors);
    const code = req.body.code;
    const deviceId = req.device.id;

    const device = await DeviceServices.findOne({ id: deviceId });

    const validatedCoupon = await CouponServices.validate({
      code,
      gcId: device.gcId,
      orgId: device.owner_id,
    });
    await CouponServices.redeemCoupon(validatedCoupon, device.id);

    apiResponse.success(res, req, "Coupon redeemed successfully");
  } catch (error) {
    apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
