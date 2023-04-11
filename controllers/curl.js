const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");
const helper = require("../common/helper");

/**
 * @swagger
 * tags:
 *   name: Curl
 *   description: CURL Bridge
 */

exports.get = (req, res) => {
  /**
   * @swagger
   *
   * /curl/get:
   *   get:
   *     security: []
   *     description: CURL
   *     tags: [Curl]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: url
   *         description: URL
   *         in: query
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.query, {
      url: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const curl_res = await helper.send_api_request({ url: req.query.url });

        return apiResponse.success(res, req, curl_res.data);
      } catch (err) {
        return apiResponse.fail(res, err.message);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.post = (req, res) => {
  /**
   * @swagger
   *
   * /curl/post:
   *   post:
   *     security: []
   *     description: CURL
   *     tags: [Curl]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: url
   *         description: URL
   *         in: formData
   *         required: true
   *         type: string
   *       - name: data
   *         description: Data can be any string or JSON string
   *         in: formData
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      url: "required",
      data: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const curl_res = await helper.send_api_request({
          url: req.body.url,
          params: req.body.data,
          method: "post",
        });

        return apiResponse.success(res, req, curl_res.data);
      } catch (err) {
        return apiResponse.fail(res, err);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.put = (req, res) => {
  /**
   * @swagger
   *
   * /curl/put:
   *   put:
   *     security: []
   *     description: CURL
   *     tags: [Curl]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: url
   *         description: URL
   *         in: formData
   *         required: true
   *         type: string
   *       - name: data
   *         description: Data can be any string or JSON string
   *         in: formData
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      url: "required",
      data: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const curl_res = await helper.send_api_request({
          url: req.body.url,
          params: req.body.data,
          method: "put",
        });

        return apiResponse.success(res, req, curl_res.data);
      } catch (err) {
        return apiResponse.fail(res, err);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.delete = (req, res) => {
  /**
   * @swagger
   *
   * /curl/delete:
   *   delete:
   *     security: []
   *     description: CURL
   *     tags: [Curl]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: url
   *         description: URL
   *         in: formData
   *         required: true
   *         type: string
   *       - name: data
   *         description: Data can be any string or JSON string
   *         in: formData
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      url: "required",
      data: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const curl_res = await helper.send_api_request({
          url: req.body.url,
          params: req.body.data,
          method: "detele",
        });

        return apiResponse.success(res, req, curl_res.data);
      } catch (err) {
        return apiResponse.fail(res, err);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
