const apiResponse = require("../../../common/api.response");
const Validator = require("validatorjs");
const KioskCouponServices = require("../../../services/kiosk/coupons");
/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content-Coupons
 *   description: Coupons management
 */

exports.create = async (req, res) => {
  /**
   * @swagger
   *
   * kiosk-content/coupons:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new Coupon
   *     tags: [Kiosk-Courses-Content-Coupons]
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
   *       - name: discountType
   *         description: Coupon discount type (fixed or percentage)
   *         in: formData
   *         required: true
   *         type: string
   *         enum: 
   *           - fixed
   *           - percentage
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
   *       - name: orgId
   *         description: The organization with which the coupon is going to be attached.
   *         in: formData
   *         required: false
   *         type: number
   *       - name: gcId
   *         description: The gold course with which the coupon is going to be attached.
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
      maxUseLimit: "required",
    });

    if (validation.fails()) return apiResponse.fail(res, validation.errors);

    try {
        const { orgId, gcId } = req.body
        const loggedInUserOrgId = req.user.orgId
        const validParent = await KioskCouponServices.getValidParent({ orgId: orgId, gcId, loggedInUserOrgId })
        const result = await KioskCouponServices.create({ ...req.body, ...validParent });
        return apiResponse.success(res, req, result);
    } catch (error) {
        return apiResponse.fail(res, error.message, error.statusCode || 500);
    }

};
