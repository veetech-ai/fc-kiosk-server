// External Module Imports
const wifi = require("node-wifi");
const Validator = require("validatorjs");
const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");
const ejs = require("ejs");

// Common Imports
const apiResponse = require("../common/api.response");
const helper = require("../common/helper");
const email = require("../common/email");
const notification = require("../common/notification");

// Logger Imports
const { logger } = require("../logger");

const filePath = path.join(__dirname, "../tmp/test.txt");

/**
 * @swagger
 * tags:
 *   name: Test
 *   description: Test APIs
 */

exports.ping = (req, res) => {
  /**
   * @swagger
   *
   * /test/ping:
   *   get:
   *     security: []
   *     description: Ping
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */
  return apiResponse.success(res, req, "ok");
};

exports.email = async (req, res) => {
  /**
   * @swagger
   *
   * /test/email:
   *   post:
   *     security:
   *      - auth: []
   *     description: Sending test email
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: to
   *         description: Email to send
   *         in: formData
   *         required: false
   *         type: string
   *       - name: subject
   *         description: Email Subject
   *         in: formData
   *         required: false
   *         type: string
   *       - name: message
   *         description: Email message
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const result = await email.send_test(req.body);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.slack = async (req, res) => {
  /**
   * @swagger
   *
   * /test/slack:
   *   post:
   *     security:
   *      - auth: []
   *     description: Sending test email
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: message
   *         description: Message to send to slack channel
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const result = await helper.send_slack(
      req.body.message || "Test message from Node Test API for Slack",
    );
    return apiResponse.success(res, req, result.data);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.twilio_sms = async (req, res) => {
  /**
   * @swagger
   *
   * /test/twilio-sms:
   *   post:
   *     security:
   *      - auth: []
   *     description: Sending test twilio SMS
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: number
   *         description: Phone number
   *         in: formData
   *         required: true
   *         type: string
   *       - name: message
   *         description: Message to send
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const result = await helper.send_sms(
      req.body.number || "+923315690929",
      req.body.message || "Test twilio message.",
    );
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_test_file = (req, res) => {
  /**
   * @swagger
   *
   * /test/test-file:
   *   get:
   *     security:
   *      - auth: []
   *     description: Ping
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    fs.readFile(filePath, { encoding: "utf-8" }, function (err, data) {
      if (err) return apiResponse.fail(res, err);

      return apiResponse.success(res, req, JSON.parse(data));
    });
  } catch (err) {
    return apiResponse.fail(res, err.message);
  }
};

exports.generate_token = (req, res) => {
  try {
    const token = helper.generate_verify_token();
    return apiResponse.success(res, req, token);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_routers = (req, res) => {
  wifi.init({
    iface: null, // network interface, choose a random wifi interface if set to null
  });

  // Scan networks
  wifi.scan(function (err, networks) {
    if (err) return apiResponse.fail(res, err);

    wifi.getCurrentConnections(function (err, currentConnections) {
      if (err)
        return apiResponse.success(res, req, {
          err: err,
          networks: networks,
        });

      return apiResponse.success(res, req, {
        currentConnections: currentConnections,
        networks: networks,
      });
    });
  });
};

exports.create_test_pdf = (req, res) => {
  /**
   * @swagger
   *
   * /test/test-pdf:
   *   post:
   *     security:
   *      - auth: []
   *     description: create test pdf file
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: title
   *         description: title
   *         in: formData
   *         required: true
   *         type: string
   *       - name: message
   *         description: Message
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  const options = { format: "Letter" };

  const template = fs.readFileSync("./views/pdfs/invoice.html", {
    encoding: "utf-8",
  });

  const html = ejs.render(template, {
    title: req.body.title,
    body: req.body.message,
    logo: "file/yimages/logo.png",
  });

  pdf
    .create(html, options)
    .toFile("./public/pdf/test.pdf", function (err, result) {
      if (err) return apiResponse.fail(res, err, 500);

      return apiResponse.success(res, req, result);
    });
};

exports.send_realtime_notification = (req, res) => {
  /**
   * @swagger
   *
   * /test/realtime-notice:
   *   post:
   *     security:
   *      - auth: []
   *     description: Send notification to user
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_id
   *         description: User ID
   *         in: formData
   *         required: true
   *         type: number
   *       - name: device_id
   *         description: Device ID
   *         in: formData
   *         required: false
   *         type: number
   *       - name: message
   *         description: Message
   *         in: formData
   *         required: true
   *         type: string
   *       - name: misc
   *         description: Misc JSON object to append any misc data
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  Validator.register(
    "json",
    function (value, requirement, attribute) {
      try {
        JSON.parse(value);
      } catch (e) {
        return false;
      }
      return true;
    },
    "The :attribute must be JSON string",
  );

  const validation = new Validator(req.body, {
    misc: "json",
    user_id: "required",
    message: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const notificationObject = {
        notice: req.body.message,
        users: [{ id: req.body.user_id }],
      };

      if (req.body.misc) {
        notificationObject.misc = JSON.parse(req.body.misc);
      }
      if (req.body.device_id) {
        notificationObject.device_id = req.body.device_id;
      }

      await notification.send(notificationObject);

      return apiResponse.success(res, req, "sending...");
    } catch (err) {
      return apiResponse.fail(res, err, 500);
    }
  });
};
exports.get_alexa = (req, res) => {
  /**
   * @swagger
   *
   * /test/galexa:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get Alex Request
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  logger.info("alexa get api hitted");

  helper.mqtt_publish_message(
    "alexa/test/get",
    `alexa get api hitted at ${new Date()}`,
  );

  return apiResponse.success(res, req, { res: "ok" });
};

exports.post_alexa = (req, res) => {
  /**
   * @swagger
   *
   * /test/palexa:
   *   post:
   *     security:
   *      - auth: []
   *     description: Post Alex Request
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  logger.info("alexa post api hitted");

  helper.mqtt_publish_message(
    "alexa/test/post",
    `alexa post api hitted at ${new Date()}`,
  );

  return apiResponse.success(res, req, { res: "ok" });
};

exports.fcm_push = async (req, res) => {
  /**
   * @swagger
   *
   * /test/fcm-push:
   *   post:
   *     security:
   *      - auth: []
   *     description: Sending test FCM push notification
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: title
   *         description: Title to send push
   *         in: formData
   *         required: false
   *         type: string
   *       - name: message
   *         description: Message to send push
   *         in: formData
   *         required: false
   *         type: string
   *       - name: topic
   *         description: topic to send push
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const result = await helper.send_push({
      title: req.body.title || "Test title from Node Test API",
      message: req.body.message || "Test message from Node Test API",
      topic: req.body.topic || "general",
    });

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.timezone_conversion = (req, res) => {
  /**
   * @swagger
   *
   * /test/timezone-conversion:
   *   get:
   *     security: []
   *     description: Testing timezone conversion
   *     tags: [Test]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: tz
   *         description: Timezone string
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const moment = require("moment");
    const now = moment();
    const format = "Do, MMMM YYYY h:m:s A";

    const utc = moment(now).utc();
    const requested = moment().tz(req.query.tz);

    const dates = {
      server: {
        now: now,
        unix: now.unix(),
        formatted: now.format(format),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },

      utc: {
        now: utc,
        unix: moment(utc).unix(),
        formatted: utc.format(format),
      },

      requested: {
        now: requested,
        unix: moment(requested).unix(),
        formatted: requested.format(format),
      },
    };

    return apiResponse.success(res, req, dates);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
