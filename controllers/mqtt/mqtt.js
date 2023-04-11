// External Imports
const Validator = require("validatorjs");

// Logger Imports
const { logger } = require("../../logger");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
const { initializeWriteApi } = require("../../common/influx-init");

// Query Imports
const MqttModel = require("../../services/mqtt_logs");

// Constant Imports
const { mqttChannels } = require("./channels");

// Local Helper Function Imports
const { setInfluxData } = require("./helper");

global.localBrokerStatus = true;

/**
 * @swagger
 * tags:
 *   name: MQTT
 *   description: MQTT actions
 */

exports.client = () => {
  if (mqtt_connection_ok) {
    mqttChannels.forEach((channelData) => {
      helper.mqtt_subscribe_channel(channelData.channel);
    });
  } else {
    logger.warn("MQTT not connected. FILE->controllers/mqtt.js.client()");
    helper.set_mqtt_connection_lost_log("NAPP mqtt.js.client:");
  }
};

exports.MessageArrived = async (topic, message, packet) => {
  // Extracting the payload
  const payload = {
    destinationName: topic,
    payloadString: message.toString(),
    payloadBytes: message,
    duplicate: packet.dup,
    qos: packet.qos,
    retained: packet.retain,
  };

  // Ensuring that Influx is Initialized
  if (global.isInfluxInitialized) {
    initializeWriteApi();
  }

  // Finding the channel and breaking if appropriate
  const foundChannel = mqttChannels.find((channelData) => {
    return channelData.regex.test(payload.destinationName);
  });

  // Log error for an unknown channel
  if (!foundChannel) {
    logger.error(`Cannot find channel for topic: ${payload.destinationName}`);
    // DEBUGGING STARTS
    const isMatch = mqttChannels[3].regex.test(payload.destinationName);
    logger.info(
      `payload.destinationName: ${payload.destinationName} match: ${isMatch}`,
    );
    // DEBUGGING ENDS
    return;
  }

  if (!foundChannel.handler)
    throw new Error(
      `Handler for channelData: ${foundChannel.channel} not found!`,
    );

  return await foundChannel.handler(payload);

  // TODO Code below this needs to be refactored into handlers
  // if (payload.destinationName.indexOf("/gs/ss") >= 0) {
  //   const deviceId = payload.destinationName.split("/")[1];
  //   await this.setDeviceLastUpdated(
  //     deviceId,
  //     JSON.parse(payload.payloadString),
  //     "ss",
  //   );
  // }
};

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /mqtt/logs/all:
   *   get:
   *     security: []
   *     description: Get All Mqtt logs
   *     tags: [MQTT]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  const limit =
    req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
  let page = 0;
  if (req.query) {
    if (req.query.page) {
      req.query.page = parseInt(req.query.page);
      page = Number.isInteger(req.query.page) ? req.query.page : 0;
    }
  }

  try {
    const result = await MqttModel.list(limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = (req, res) => {
  /**
   * @swagger
   *
   * /mqtt/logs/create:
   *   post:
   *     security: []
   *     description: Create mqtt log
   *     tags: [MQTT]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: client_id
   *         description: Client ID of MQTT client
   *         in: formData
   *         required: true
   *         type: string
   *       - name: type
   *         description: type of mqtt action. e.g connection lost, success, failure etc
   *         in: formData
   *         required: true
   *         type: string
   *       - name: origin
   *         description: From which source API is hitting. e.g Mobile APP, ESP or webapp etc
   *         in: formData
   *         required: true
   *         type: string
   *       - name: action_datetime
   *         description: Date time of MQTT action
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_serial
   *         description: Device Serial
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    client_id: "required",
    type: "required",
    origin: "required",
    action_datetime: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const result = await MqttModel.create(req.body);

      return apiResponse.success(res, req, result);
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

module.exports.setInfluxData = setInfluxData;
