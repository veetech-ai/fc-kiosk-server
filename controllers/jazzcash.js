// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../common/api.response");
const jazzcash = require("../common/jazzcash");

// Services Imports
const OrderModel = require("../services/order");

// Configuration Imports
const config = require("../config/config");

/**
 * //@swagger
 * tags:
 *   name: JazzCash
 *   description: JazzCash APIs.
 */

exports.pay_with_mobile_account = (req, res) => {
  /**
   * //@swagger
   *
   * /jazzcash/pay/mobile-account:
   *   post:
   *     security:
   *      - auth: []
   *     description: Pay bill from JazzCash Mobile Account
   *     tags: [JazzCash]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: amount
   *         description: Amount to charge
   *         in: formData
   *         required: true
   *         type: number
   *       - name: mobile_number
   *         description: JazzCash Mobile Number Account
   *         in: formData
   *         required: true
   *         type: string
   *       - name: cnic
   *         description: Last 6 digits of CNIC
   *         in: formData
   *         required: true
   *         type: string
   *       - name: order_id
   *         description: Order ID
   *         in: formData
   *         required: true
   *         type: string
   *
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const validation = new Validator(req.body, {
      amount: "required",
      mobile_number: "required",
      cnic: "required",
      order_id: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const order = await OrderModel.findByID(req.body.order_id);
        if (!order) return apiResponse.fail(res, "Order not found");

        const jazzcash_res = await jazzcash.pay_with_mobile_account({
          order_id: req.body.order_id,
          amount: req.body.amount,
          mobile_number: req.body.mobile_number,
          cnic: req.body.cnic,
        });

        const payment_info = {
          method: "jazzcash",
          pp_RetrievalReferenceNo: jazzcash_res.pp_RetrievalReferenceNo,
          pp_TxnRefNo: jazzcash_res.pp_TxnRefNo,
          payment_method: "mobile_account",
        };

        await OrderModel.update(req.body.order_id, {
          payment_info: JSON.stringify(payment_info),
          status: 1,
          payment_method: 5,
        });

        return apiResponse.success(res, req, order);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.redirect_endpoint = (req, res) => {
  /**
   * //@swagger
   *
   * /jazzcash/redirect-endpoint:
   *   post:
   *     security: []
   *     description: JazzCash Redirect Endpoint
   *     tags: [JazzCash]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (req.body.pp_ResponseCode == "000") {
      // success case
      const payment_info = {
        method: "jazzcash",
        pp_RetreivalReferenceNo: req.body.pp_RetreivalReferenceNo,
        pp_TxnRefNo: req.body.pp_TxnRefNo,
        payment_method: req.body.pp_TxnType,
      };

      OrderModel.update(req.body.ppmpf_1, {
        client_tz: req.body.ppmpf_2,
        payment_info: JSON.stringify(payment_info),
        status: 1,
        payment_method: 5,
      })
        .then(() => {
          require("../common/email").send_place_order_emails(req.body.ppmpf_1);
          res.redirect(`${config.app.storeURL}order/confirmation`);
        })
        .catch(() => {
          res.redirect(`${config.app.storeURL}order/confirmation?jazzerr=db`);
        });
    } else {
      // false case
      res.redirect(
        `${config.app.storeURL}order/payment?jazzerr=${req.body.pp_ResponseCode}`,
      );
    }
  } catch (err) {
    res.redirect(`${config.app.storeURL}order/payment?jazzerr=unknown`);
  }
};
