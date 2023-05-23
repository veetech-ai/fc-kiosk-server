const CouponsServices = require("../services/coupons");
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");
const ServiceError = require("../utils/serviceError");
const CoursesServices = require("../services/kiosk/course");
const { validateDate } = require("../common/helper");

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupons management
 */

exports.findCouponsByCourseId = async (req, res) => {
  /**
   * @swagger
   *
   * /coupons/courses/{courseId}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get coupons by course id
   *     tags: [Coupons]
   *     parameters:
   *       - name: courseId
   *         description: Id of the golf course
   *         in: path
   *         required: true
   *         type: integer
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    // Pagination would be added later.

    const loggedInUserOrgId = req.user.orgId;

    const gcId = Number(req.params.courseId);
    if (!gcId) throw new ServiceError("The courseId must be an integer.", 400);

    await CoursesServices.getCourse({ id: gcId }, loggedInUserOrgId);
    const coupons = await CouponsServices.findAllCoupons({ gcId });

    return apiResponse.success(res, req, coupons);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.create = async (req, res) => {
  /**
   * @swagger
   *
   * /coupons:
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
   *         description: |
   *           This field supports all ISO or RFC 2822 date formats
   *           For example:
   *           - Wed, 22 May 2019 10:30:00 +0300
   *           - 2019-05-22T10:30:00+03:00 OR 2019-05-22T10:30:00Z
   *           - 2019-05-22
   *
   *           Note: The expiry date-time should be greater than the current date-time
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
   *         description: Number of times a single coupon can be redeem
   *         in: formData
   *         required: true
   *         type: number
   *       - name: orgId
   *         description: The organization with which the coupon is going to be attached.
   *         in: formData
   *         required: false
   *         type: number
   *       - name: gcId
   *         description: The golf course with which the coupon is going to be attached.
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
  });

  if (validation.fails()) return apiResponse.fail(res, validation.errors);

  try {
    const { orgId, gcId } = req.body;

    validateDate("expiry", req.body.expiry);

    const loggedInUserOrgId = req.user.orgId;
    const validParent = await CouponsServices.getValidParent({
      orgId,
      gcId,
      loggedInUserOrgId,
    });
    const result = await CouponsServices.create({
      ...req.body,
      ...validParent,
    });
    return apiResponse.success(res, req, result);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
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

        const coupon = await CouponsServices.findByID(coupon_id);
        if (!coupon) return apiResponse.fail(res, "Coupon not found", 404);

        await CouponsServices.update(coupon_id, req.body);

        return apiResponse.success(res, req, "updated");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.deleteCouponById = async (req, res) => {
  /**
   * @swagger
   *
   * /coupons/{couponId}:
   *   delete:
   *     security:
   *      - auth: []
   *     description: Delete coupon by id
   *     tags: [Coupons]
   *     parameters:
   *       - name: couponId
   *         description: Id of the coupon
   *         in: path
   *         required: true
   *         type: integer
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const loggedInUserOrgId = req.user.orgId;

    const couponId = Number(req.params.couponId);
    if (!couponId)
      throw new ServiceError("The couponId must be an integer.", 400);

    const coupon = await CouponsServices.checkCouponType(
      { id: couponId },
      loggedInUserOrgId,
    );
    await CouponsServices.deleteCouponsWhere(coupon);
    return apiResponse.success(res, req, "Coupon deleted successfully");
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
