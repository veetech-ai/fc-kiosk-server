const config = require("./config/config");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    swagger: "2.0",
    info: {
      title: config.app.title,
      version: `Build: ${config.apiBuild}`,
      description: config.app.title + " APIs",
    },
    basePath: config.app.swagger.apiPath,
    securityDefinitions: {
      auth: {
        type: "apiKey",
        name: "authorization",
        in: "header",
      },
    },
    security: [{ auth: [] }],
  },
  apis: [
    "./controllers/authorization/authorization.js",
    "./controllers/golfbert/golfbert.js",
    "./controllers/kiosk/kiosk_courses/courses.js",
    "./controllers/kiosk/kiosk_content/kiosk_content.js",
    "./controllers/kiosk/kiosk_content/coupons.js",
    "./controllers/kiosk/kiosk_content/feedback.js",
    "./controllers/kiosk/course-faqs.js",
    "./controllers/kiosk/kiosk_content/shops.js",
    "./controllers/kiosk/course_shops.js",
    "./controllers/mobile/courses.js",
    "./controllers/screenConfig/screens.js",
    "./controllers/kiosk/device_onboarding_code.js",
    "./controllers/user/user.js",
    "./controllers/user_2fa.js",
    "./controllers/security_questions.js",
    "./controllers/user_addresses.js",
    "./controllers/user_2fa.js",
    "./controllers/organization.js",
    "./controllers/organization_type.js",
    "./controllers/security_questions.js",
    "./controllers/device_types.js",
    "./controllers/device/device.js",
    "./controllers/networks.js",
    "./controllers/scheduling.js",
    "./controllers/group.js",
    "./controllers/firmware.js",
    "./controllers/billing.js",
    "./controllers/payment_options.js",
    "./controllers/coupons.js",
    "./controllers/product.js",
    "./controllers/product_addons.js",
    "./controllers/product_categories.js",
    "./controllers/order.js",
    "./controllers/notifications.js",
    "./controllers/canary.js",
    "./controllers/graph.js",
    "./controllers/kpis.js",
    "./controllers/transactions.js",
    "./controllers/pi_client.js",
    "./controllers/misc.js",
    "./controllers/stripe.js",
    "./controllers/jazzcash.js",
    // './controllers/mode.js',
    "./controllers/curl.js",
    "./controllers/timezone.js",
    "./controllers/mqtt/mqtt.js",
    "./controllers/wifi/wifi.js",
    "./controllers/test.js",
    "./controllers/org_user_rel_fp_user.js",
    "./controllers/roles/index.js",
  ],
};

const specs = swaggerJsdoc(options);

module.exports = (router) => {
  router.use(
    config.app.swagger.routePath,
    swaggerUi.serve,
    swaggerUi.setup(specs),
  );
};
