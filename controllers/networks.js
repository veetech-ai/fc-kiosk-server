// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../common/api.response");
const helper = require("../common/helper");

// Service Model Imports
const UserNetworksModel = require("../services/user_networks");
const DeviceNetworksModel = require("../services/device_networks");

// Logger Imports
const { logger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: Networks
 *   description: Networks management
 */

exports.get_user_networks = async (req, res) => {
  /**
   * @swagger
   *
   * /network/user:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Networks
   *     tags: [Networks]
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

    const result = await UserNetworksModel.list(req.user.id, limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_networks = async (req, res) => {
  /**
   * @swagger
   *
   * /network/device/{deviceId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Networks
   *     tags: [Networks]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: Device ID
   *         in: path
   *         required: true
   *         type: string
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

    const result = await DeviceNetworksModel.list(
      req.params.deviceId,
      limit,
      page,
    );

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create_user_network = (req, res) => {
  /**
   * @swagger
   *
   * /network/create/user:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new wifi network
   *     tags: [Networks]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: ssid
   *         description: SSID, WiFi name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: password
   *         description: Wifi password
   *         in: formData
   *         required: true
   *         type: string
   *       - name: user_id
   *         description: user id
   *         in: formData
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    ssid: "required",
    password: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      req.body.user_id = req.body.user_id || req.user.id;
      const result = await UserNetworksModel.create(req.body);

      return apiResponse.success(res, req, result);
    } catch (err) {
      logger.error(err.message);
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.create_device_network = (req, res) => {
  /**
   * @swagger
   *
   * /network/create/device:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new wifi network
   *     tags: [Networks]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: ssid
   *         description: SSID, WiFi name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: password
   *         description: Wifi password
   *         in: formData
   *         required: true
   *         type: string
   *       - name: priority
   *         description: Wifi priority
   *         in: formData
   *         required: true
   *         type: number
   *       - name: device_id
   *         description: device id
   *         in: formData
   *         required: true
   *         type: number
   *       - name: user_id
   *         description: user id
   *         in: formData
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    ssid: "required",
    password: "required",
    device_id: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      req.body.user_id = req.body.user_id || req.user.id;
      const device_id = req.body.device_id;

      const result = await DeviceNetworksModel.create(req.body);

      try {
        const networks = await DeviceNetworksModel.list(device_id);

        const ch_networks = networks.map((network) => {
          return {
            s: network.ssid,
            p: network.password,
            n: network.priority,
          };
        });

        if (mqtt_connection_ok) {
          helper.mqtt_publish_message(
            `d/${device_id}/network/list`,
            ch_networks,
          );
        }

        return apiResponse.success(res, req, result);
      } catch (error) {
        logger.error(error);
        return apiResponse.fail(
          res,
          "Network added in db but not updated on device channel",
        );
      }
    } catch (err) {
      if (err == "exists") {
        return apiResponse.fail(res, "Network already exists");
      } else {
        logger.error(err.message);
        return apiResponse.fail(res, err.message, 500);
      }
    }
  });
};

exports.delete_user_network = async (req, res) => {
  /**
   * @swagger
   *
   * /network/delete/user:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete user network
   *     tags: [Networks]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: ssid
   *         description: wifi name
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const network = await UserNetworksModel.findByWhere({
      user_id: req.user.id,
      ssid: req.body.ssid,
    });

    if (!network) return apiResponse.fail(res, "Network not found", 404);

    const result = await UserNetworksModel.delete({
      user_id: req.user.id,
      ssid: req.body.ssid,
    });

    return apiResponse.success(res, req, result);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.delete_device_network = async (req, res) => {
  /**
   * @swagger
   *
   * /network/delete/device:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete device network
   *     tags: [Networks]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: ssid
   *         description: wifi name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_id
   *         description: wifi name
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const device_id = req.body.device_id;

    const network = await DeviceNetworksModel.findByWhere({
      device_id: device_id,
      ssid: req.body.ssid,
    });

    if (!network) return apiResponse.fail(res, "Network not found", 404);

    await DeviceNetworksModel.delete({
      device_id: device_id,
      ssid: req.body.ssid,
    });

    try {
      const networks = await DeviceNetworksModel.list(device_id);

      const ch_networks = networks.map((network) => {
        return {
          s: network.ssid,
          p: network.password,
          n: network.priority,
        };
      });

      if (mqtt_connection_ok) {
        helper.mqtt_publish_message(`d/${device_id}/network/list`, ch_networks);
      }

      return apiResponse.success(res, req, "done");
    } catch (error) {
      logger.error(error);
      return apiResponse.fail(
        res,
        "Network deleted from db but not updated on device channel",
      );
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
