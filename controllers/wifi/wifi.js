const apiResponse = require("../../common/api.response");
const wifi = require("./helper");
const Validator = require("validatorjs");

/**
 * //@swagger
 * tags:
 *   name: Wifi
 *   description: Wifi management (Not in use)
 */

exports.wifi_pin = (req, res) => {
  /**
   * //@swagger
   *
   * /wifi/pin:
   *   post:
   *     security:
   *       - auth: []
   *     description: Ask wifi pin
   *     tags: [Wifi]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: code_pin
   *         description: wifi pin code
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      code_pin: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(function () {
      req.body.user_id = req.user.id;
      apiResponse.fail(res, "Pending", 400);
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.wifi_list = async (req, res) => {
  /**
   * //@swagger
   *
   * /wifi/list:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get the list of available ESP routers
   *     tags: [Wifi]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const wifis = await wifi.get_esp_wifi();

    apiResponse.success(res, req, wifis);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.connect_wifi = (req, res) => {
  /**
   * //@swagger
   *
   * /wifi/connect-wifi:
   *   post:
   *     security:
   *       - auth: []
   *     description: Connect wifi
   *     tags: [Wifi]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: ssid
   *         description: SSID of wifi
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      ssid: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const password = await wifi.getPassword(req.body.ssid);

        if (!password) return apiResponse.fail(res, "Invalid SSID or Password");

        const result = await wifi.connect_to_esp_wifi(req.body.ssid, password);

        return apiResponse.success(res, req, result);
      } catch (error) {
        return apiResponse.fail(res, error.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.wifi_list = async (req, res) => {
  /**
   * //@swagger
   *
   * /wifi/wifi-list:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get the list of available routers
   *     tags: [Wifi]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const wifis = await wifi.get_internet_wifi();

    return apiResponse.success(res, req, wifis);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.wifi_password = (req, res) => {
  /**
   * //@swagger
   *
   * /wifi/wifi-password:
   *   post:
   *     security:
   *       - auth: []
   *     description: Ask router password from user and save it.
   *     tags: [Wifi]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: router_password
   *         description: Password of router
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      router_password: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const current_wifi_detail = await wifi.get_connected_wifi_details();

        if (current_wifi_detail && current_wifi_detail.length > 0) {
          apiResponse.success(res, req, current_wifi_detail);
        } else {
          apiResponse.fail(res, "Your are not connected to any wifi.", 422);
        }
      } catch (error) {
        apiResponse.fail(res, error.message, 500);
      }
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};
