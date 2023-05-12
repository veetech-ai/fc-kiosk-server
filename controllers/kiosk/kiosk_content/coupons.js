const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");
const { hasProvidedRoleRights } = require("../../../common/helper");
const KioskCouponServices = require("../../../services/kiosk/coupons");
/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupons management
 */

exports.create = (req, res) => {
  /**
   * @swagger
   *
   * kiosk-content/coupon:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new Coupon
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
   *         description: Coupon discount type (fixed or percentage)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: discount
   *         description: discount rate
   *         in: formData
   *         required: true
   *         type: number
   *       - name: maxUseLimit
   *         description: Number of times a single coupon can be redeam
   *         in: formData
   *         required: true
   *         type: number
   *       - name: couponFor
   *         description: Coupon for golf course or the organization - golfcourse or organization 
   *         in: formData
   *         required: true
   *         type: string
   *       - name: parentId
   *         description: The resource with which the coupon is going to be attached, it can either be organization id or golf course id
   *         in: formData
   *         required: false
   *         type: number
   *       - name: status
   *         description: Coupon status, 1=active, 0=in-active
   *         in: formData
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
    const validation = new Validator(req.body, {
      title: "required",
      expiry: "required",
      code: "required",
      discountType: "required",
      discount: "required",
      maxUserLimit: "required",
      couponFor: "required",
    });

    if (validation.fails()) return apiResponse.fail(res, validation.errors);

    try {
        const { couponFor, parentId } = req.body
        const loggedInUserOrgId = req.user.orgId
        await KioskCouponServices.isParentValid({couponFor, parentId, loggedInUserOrgId})
        const result = await KioskCouponServices.create(req.body);
        return apiResponse.success(res, req, result);
    } catch (error) {
        return apiResponse.fail(res, error.message, error.statusCode || 500);
    }

};
