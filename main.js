// External Module Imports
const express = require("express");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require("./utils/customValidators");

// Logger Imports
const { logger } = require("./logger");

// Common Imports
const helper = require("./common/helper");

// Services Imports
const ConfigurationsModel = require("./services/configurations");

// Configuration Imports
const config = require("./config/config");

// Swagger Documentation Imports
const swaggerDoc = require("./swaggerDoc");

const { globalMQTT } = require("./common/mqtt-init");

// Before we create anything, we need to first setup the application
// So that it can use Pino logger
process.on("uncaughtException", (err) => {
  logger.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error(err);
  process.exit(1);
});

const app = express();
const router = express.Router();

if (process.env.NODE_ENV != "test") {
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000, // 1 min in milliseconds
      max: config.apiLimitDefault,
      message: `You have exceeded the ${config.apiLimitDefault} requests limit in 1 minute!`,
      keyGenerator: (req) =>
        req._parsedUrl.pathname + req.headers.authorization
          ? req._parsedUrl.pathname + req.headers.authorization
          : "empty",
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
}

app.use(cors());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  }),
);

router.use(bodyParser.json({ limit: config.maxPayloadSize }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/files", express.static("public"));

const HomeRouter = require("./routes/home");
const AuthorizationRouter = require("./routes/auth");
const UsersRouter = require("./routes/user");
const OrganizationsRouter = require("./routes/organization");
const OrganizationTypeRouter = require("./routes/organization_types");
const TestRouter = require("./routes/test");
const DeviceRouter = require("./routes/device");
const ModeRouter = require("./routes/mode");
const GroupRouter = require("./routes/group");
const GeoFenceRouter = require("./routes/geofences");
const SchedulingRouter = require("./routes/scheduling");
const TimezoneRouter = require("./routes/timezone");
const MQTTRouter = require("./routes/mqtt");
const CurlRouter = require("./routes/curl");
const GraphRouter = require("./routes/graph");
const KpisRouter = require("./routes/kpis");
const CanaryRouter = require("./routes/canary");
const FirmwareRouter = require("./routes/firmware");
const NotificationsRouter = require("./routes/notifications");
const MiscRouter = require("./routes/misc");
const UserAddressesRouter = require("./routes/user_addresses");
const User2FARouter = require("./routes/user_2fa");
const SQRouter = require("./routes/security_questions");
const TransactionsRouter = require("./routes/transactions");
const PiClientRouter = require("./routes/pi_client");
const ProductRouter = require("./routes/product");
const ProductAddonsRouter = require("./routes/product_addons");
const ProductCategoriesRouter = require("./routes/product_categories");
const OrderRouter = require("./routes/order");
const CouponsRouter = require("./routes/coupons");
const PaymentOptionsRouter = require("./routes/payment_options");
const NetworksController = require("./routes/networks");
const BillingController = require("./routes/billing");
const StripeController = require("./routes/stripe");
const JazzCashController = require("./routes/jazzcash");
const GolfBertRouter = require("./routes/golfbert");
const KioskCoursesRouter = require("./routes/kiosk/kiosk_courses");
const KioskCoursesContentRouter = require("./routes/kiosk/kiosk_content");
const CoursesRouter = require("./routes/mobile/courses");
const ScreenConfigRouter = require("./routes/screenConfig/screens");
const MQTTController = require("./controllers/mqtt/mqtt");
const Roles = require("./routes/roles");
const DeviceOnboardingCode = require("./routes/kiosk/device_onboarding_code");
const LessonRouteController = require("./routes/kiosk/lesson");
const ContactLessonRouteController = require("./routes/kiosk/contact_lesson");
const CourseShops = require("./routes/kiosk/course_shops");
const CourseFeedBacks = require("./routes/kiosk/course_feedbacks");
const CourseFaqs = require("./routes/kiosk/course-faqs");
const CareersRouter = require("./routes/kiosk/careers");
const CourseMemberships = require("./routes/kiosk/membership");
const ContactCareerRouter = require("./routes/kiosk/contact-careers");
const AdsRouter = require("./routes/kiosk/ads");
const WaiverRouter = require("./routes/kiosk/waiver");

swaggerDoc(router);

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length, total-records");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With, Range",
  );
  if (req.method === "OPTIONS") {
    return res.res.sendStatus(200);
  } else {
    return next();
  }
});

router.use(function (error, req, res, next) {
  if (error instanceof SyntaxError) {
    return res.status(500).send({
      data: "Invalid data",
      error: error,
    });
  } else {
    next();
  }
});

router.get("/api/v1", function (req, res) {
  res.json(`${config.app.title} APIs`);
});

HomeRouter.routesConfig(app, router);
AuthorizationRouter.routesConfig(app, router);
UsersRouter.routesConfig(app, router);
OrganizationsRouter.routesConfig(app, router);
OrganizationTypeRouter.routesConfig(app, router);
TestRouter.routesConfig(app, router);
DeviceRouter.routesConfig(app, router);
ModeRouter.routesConfig(app, router);
GroupRouter.routesConfig(app, router);
GeoFenceRouter.routesConfig(app, router);
TimezoneRouter.routesConfig(app, router);
MQTTRouter.routesConfig(app, router);
CurlRouter.routesConfig(app, router);
GraphRouter.routesConfig(app, router);
KpisRouter.routesConfig(app, router);
SchedulingRouter.routesConfig(app, router);
FirmwareRouter.routesConfig(app, router);
CanaryRouter.routesConfig(app, router);
NotificationsRouter.routesConfig(app, router);
MiscRouter.routesConfig(app, router);
UserAddressesRouter.routesConfig(app, router);
User2FARouter.routesConfig(app, router);
SQRouter.routesConfig(app, router);
TransactionsRouter.routesConfig(app, router);
PiClientRouter.routesConfig(app, router);
ProductRouter.routesConfig(app, router);
ProductAddonsRouter.routesConfig(app, router);
ProductCategoriesRouter.routesConfig(app, router);
OrderRouter.routesConfig(app, router);
CouponsRouter.routesConfig(app, router);
PaymentOptionsRouter.routesConfig(app, router);
NetworksController.routesConfig(app, router);
BillingController.routesConfig(app, router);
StripeController.routesConfig(app, router);
JazzCashController.routesConfig(app, router);
Roles.routesConfig(app, router);
GolfBertRouter.routesConfig(app, router);
CoursesRouter.routesConfig(app, router);
KioskCoursesRouter.routesConfig(app, router);
ScreenConfigRouter.routesConfig(app, router);
KioskCoursesContentRouter.routesConfig(app, router);
DeviceOnboardingCode.routesConfig(app, router);
LessonRouteController.routesConfig(app, router);
ContactLessonRouteController.routesConfig(app, router);
CourseShops.routesConfig(app, router);
CourseFeedBacks.routesConfig(app, router);
CourseFaqs.routesConfig(app, router);
CareersRouter.routesConfig(app, router);
CourseMemberships.routesConfig(app, router);
ContactCareerRouter.routesConfig(app, router);
AdsRouter.routesConfig(app, router);
WaiverRouter.routesConfig(app, router);

global.messageQueue = [];

if (config.env === "test") {
  global.mqtt_connection_ok = true;
  // for test case server
  app.use(router);
  module.exports = app;
} else {
  app.use("/", router);
  global.mqtt_connection_ok = false;

  // global.mqtt_client_id = 'mqtt_node_app_client_id_ts_' + Date.now()
  // global.mqtt_client = new Paho.Client(config.mqtt.host, Number(config.mqtt.port), mqtt_client_id)

  global.mqtt_client_id = `mqtt_node_app_${config.mqtt.clientId}_${
    config.mqtt.mqttEnabled === "true" ? "mqtt_only" : "api_only"
  }`;

  // Getting the MQTT connection URL
  global.mqttUri = `${config.mqtt.ssl ? "wss" : "ws"}://${
    config.mqtt.host
  }:${Number(config.mqtt.port)}`;

  let mqttTried = 0;
  let connectionClosed = true;
  let mqttTimeoutId = null;

  // Creating the Client object
  // global.mqtt_client = MQTT.connect(global.mqttUri, {
  //   clientId: mqtt_client_id,
  //   username: config.mqtt.username,
  //   password: config.mqtt.password,
  //   keepalive: 20,
  //   connectTimeout: 5000,
  //   protocolVersion: 5,
  //   reconnectPeriod: config.mqtt.reconnect ? 1000 : 0,
  //   clean: false,
  // });

  const onConnectionSuccess = async () => {
    // Setting Statuses
    ++mqttTried;
    mqtt_connection_ok = true;
    connectionClosed = false;
    //if mqtt connected again in 5 seconds, it will remove connection close message
    if (mqttTimeoutId) {
      clearTimeout(mqttTimeoutId);
    }

    MQTTController.client();
    logger.info("MQTT started");
    helper.sendMqttQueuedMessages();
    // let's start cron jobs
    if (config.env === "production") {
      const cronjob = require("./controllers/cron");
      cronjob.device_billing.start();
    }
    // cron job code ends

    /**
     * NOTE: this is temporary, this is only for development, need to remove these lines after billing complete
     */
    if (config.env === "development") {
      const BillingController = require("./controllers/billing");
      BillingController.check_device_billing();
      BillingController.send_billing_notifications();
    }
    // END NOTE
  };

  const onConnectionError = async (error) => {
    logger.error(error);
    mqtt_connection_ok = false;

    if (mqttTried == 0) {
      // only send the logs on first failure
      helper.set_mqtt_connection_failure_log(
        "Connection Fail on starting server",
      );
      MQTTController.client();
      helper.send_slack("Node server start but MQTT connection fail.");
      logger.error("MQTT Fail");
      mqttTried = mqttTried + 1;
    }

    if (config.env === "production") {
      // let's start cron jobs
      const cronjob = require("./controllers/cron");
      cronjob.device_billing.start();
      // cron job code ends
    }
  };

  const onConnectionClose = async () => {
    mqtt_connection_ok = false;
    logger.warn("Connection from MQTT Broker Closed!");
    const errorMessage = "Connection from MQTT Closed!";

    if (!connectionClosed) {
      connectionClosed = true;
      helper.set_mqtt_connection_failure_log(errorMessage);
      mqttTimeoutId = setTimeout(() => {
        helper.send_slack(errorMessage);
      }, config.mqtt.mqttTimeout);
    }
  };

  const onConnectionDisconnect = async () => {
    logger.warn(
      "Connection from MQTT Broker Closed! (Broker sent disconnect packet)",
    );
    mqtt_connection_ok = false;
  };

  const onConnectionReconnect = async () => {
    logger.info("Reconnecting to MQTT Broker ...");
  };

  globalMQTT.client.on("connect", onConnectionSuccess);
  globalMQTT.client.on("error", onConnectionError);
  globalMQTT.client.on("reconnect", onConnectionReconnect);
  globalMQTT.client.on("disconnect", onConnectionDisconnect);
  globalMQTT.client.on("close", onConnectionClose);

  // Setting Up Influx DB Connetion
  global.influx_connection_ok = false;
  global.isInfluxInitialized = false;
  // End of Setting Up Influx DB Connetion

  app.listen(config.app.port, function () {
    try {
      //slack notification
      helper
        .send_slack(
          ":white_check_mark: Node server started",
          config.mqtt.brokerBridgeNotificationSlackHook,
        )
        .catch(() => {
          logger.warn("Failed to send server start message to Slack");
        });

      // App configurations
      global.global_app_config = {};
      ConfigurationsModel.get()
        .then((config) => {
          if (config) {
            global.global_app_config = config.config;
          }
        })
        .catch(() => {
          logger.error("App config not found");
        });
      global.app_root_path = path.resolve(__dirname);

      // connect the client
      globalMQTT.client.on("message", MQTTController.MessageArrived);
      globalMQTT.client.disconnectedPublishing = true;
    } catch (err) {
      logger.error("main con err");
      logger.error(err);
    }
  });
}
