const CouponsServices = require("../services/coupons");
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");
const ServiceError = require("../utils/serviceError");
const CoursesServices = require("../services/kiosk/course");
const { validateObject  } = require("../common/helper");

const moment = require("moment")

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

    if (!moment(req.body.expiry).isValid()) throw new ServiceError("The expiry field must be a valid ISO format", 400);
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
exports.updateCouponById = async (req, res) => {
  /**
   * @swagger
   *
   * /coupons/{couponId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update coupon 
   *     tags: [Coupons]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: couponId
   *         description: id of the coupon
   *         in: path
   *         required: true
   *         type: integer
   *       - name: title
   *         description: Coupon title
   *         in: formData
   *         required: false
   *         type: string
   *       - name: description
   *         description: Coupon description
   *         in: formData
   *         required: false
   *         type: string
   *       - name: expiry
   *         description: expiry of Coupon (Date)
   *         in: formData
   *         required: false
   *         type: string
   *       - name: discountType
   *         description: Coupon discount type (fixed or percentage)
   *         in: formData
   *         required: false
   *         type: string
   *         enum:
   *           - fixed
   *           - percentage
   *       - name: discount
   *         description: discount rate
   *         in: formData
   *         required: false
   *         type: number
   *       - name: maxUseLimit
   *         description: Number of times a single coupon can be redeem
   *         in: formData
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
    const validation = new Validator(req.body, {
      title: "string",
      description: "string",
      discountType: "string",
      discount: "number",
      maxUseLimit: "integer",
    });

    if (validation.fails()) return apiResponse.fail(res, validation.errors);

    try {
      const couponId = Number(req.params.couponId);
      if (!couponId) {
        throw new ServiceError("The couponId must be an integer.", 400);
      }

      const allowedFields = ["title", "description", "discount", "discountType", "expiry", "maxUseLimit"];
      const filteredBody = validateObject(req.body, allowedFields);

      // if (filteredBody.expiry) {
      //   const date = moment(filteredBody.expiry)
      //   console.log(date == "Invalid Date")
      // }
      const loggedInUserOrgId = req.user.orgId;

      await CouponsServices.findOneCoupon({ id: couponId }, loggedInUserOrgId);

      const noOfRowsUpdated = await CouponsServices.updateCouponById(
        couponId,
        filteredBody,
      );
      return apiResponse.success(
        res,
        req,
        noOfRowsUpdated
          ? "Coupon updated successfully"
          : "Coupon already up to date",
      );
    } catch (error) {
      return apiResponse.fail(res, error.message, error.statusCode || 500);
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
