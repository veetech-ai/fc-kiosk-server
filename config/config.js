require("dotenv").config();
const timeZone = process.env.TIME_ZONE || "America/Chicago";
module.exports = {
  error_message_separator: process.env.ERROR_MESSAGE_SEPARATOR || ":cow:",
  device_token_prefix: process.env.DEVICE_TOKEN_PREFIX || "Device",
  slack_Channal_url:
    process.env.SLACK_URL ||
    "https://hooks.slack.com/services/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",
  slack_contact_channel:
    process.env.SLACK_CONTACT_URL ||
    "https://hooks.slack.com/services/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",
  apiLimitDefault: Number(process.env.API_RATE_LIMIT) || 14,
  window_tpd: process.env.WINDOW_TPD || 16,
  env: process.env.NODE_ENV || "development",
  testAccountEmail: process.env.TEST_ACCOUNT_EMAIL || "test@df.com",
  testDAccountEmail: process.env.TEST_D_ACCOUNT_EMAIL || "testd@df.com",
  testOrganization: process.env.TEST_ORGANIZATION_NAME || "Test",
  testOrganizationId: process.env.TEST_ORGANIZATION_ID || 5,
  pctTestsPerHourThresholdInSeconds: 600,
  pctTestsPerHourThreshold: 600000, // milliseconds
  thresholdForFalseNegative: 20000, // milliseconds,
  trolleyQueueLimit: 3,
  trolleyPacketThreshold:
    Number.parseInt(process.env.TROLLEY_PACKET_THRESHOLD) || 30, // sec
  userMaxLoginTimeThresholdInSeconds: 32400,
  dScopeTestMaxTimeThreshold: 30 * 60 * 1000, // 30 min
  dScopeTestTimeout: 2, //  hours
  factoryFloorTimingOffset: 1, //  hours
  apiBuild: process.env.APP_VERSION || "1.0.1",
  guestUser: "Guest User",
  webPush: {
    publicKey: process.env.WEB_PUSH_PUBLIC_KEY,
    privateKey: process.env.WEB_PUSH_PRIVATE_KEY,
  },
  fcmToken: process.env.FCM_TOKEN,
  fsshcToken: process.env.FSSHC_TOKEN,
  influxTimeFormat:
    process.env.INFLUX_TIME_FORMAT || "YYYY-MM-DDTHH:mm:ss.SSSZ",
  dScopeUpdateRecordsSettings: {
    updateInfluxRecords: process.env.UPDATE_INFLUX_RECORDS || "previous",
    timeFrameNumber:
      process.env.TIME_FRAME_NUMBER &&
      Number.isNaN(Number(process.env.TIME_FRAME_NUMBER))
        ? Number(process.env.TIME_FRAME_NUMBER)
        : 7,
    timeFrame:
      process.env.TIME_FRAME &&
      ["days", "months"].includes(process.env.TIME_FRAME)
        ? process.env.TIME_FRAME
        : "days",
  },
  factoryFloorUpdateRecordsSettings: {
    timeFrameNumber:
      process.env.TIME_FRAME_NUMBER_FACTORY_FLOOR &&
      Number.isNaN(Number(process.env.TIME_FRAME_NUMBER_FACTORY_FLOOR))
        ? Number(process.env.TIME_FRAME_NUMBER_FACTORY_FLOOR)
        : 7,
    timeFrame:
      process.env.TIME_FRAME_FACTORY_FLOOR &&
      ["days", "months"].includes(process.env.TIME_FRAME_FACTORY_FLOOR)
        ? process.env.TIME_FRAME_FACTORY_FLOOR
        : "days",
  },
  timeFormatIncludingMilliseconds: "YYYY-MM-DDTHH:mm:ss.SSSZ",
  tableRecordsLimit: process.env.TABLE_RECORDS_LIMIT || 4000,
  timeZone: timeZone,
  app: {
    title: process.env.APP_TITLE || "Worklogger",
    port: process.env.PORT || "5000",
    backendURL: process.env.BACKEND_URL || "http://localhost:5000/",
    frontendURL: process.env.FRONTEND_URL || "http://localhost:8081/",
    storeURL: process.env.STORE_URL || "http://localhost:7002/",
    filesPath: process.env.FILES_PATH || "http://localhost:5000/files/",
    apiPath: process.env.API_PATH || "/api/v1/",
    swagger: {
      apiPath: process.env.SWAGGER_API_PATH || "/api/v1/",
      routePath: process.env.SWAGGER_ROUTE_PATH || "/api/v1/api-docs",
    },
  },
  azure: {
    upload: process.env.UPLOAD_ON_AZURE === "true",

    storageCDN: process.env.AZURE_STORAGE_CDN,
    storageContainer: process.env.AZURE_STORAGE_CONTAINER,
    storageName: process.env.AZURE_STORAGE_NAME,
    storageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    storageURL: process.env.AZURE_STORAGE_URL,
  },
  golfbert: {
    accessKeyId: process.env.GOLFBERT_AWS_ACCESS_KEY_ID,
    accessKey: process.env.GOLFBERT_AWS_SECRET_ACCESS_KEY,
    apiKey: process.env.GOLFBERT_X_API_KEY,
  },
  aws: {
    upload: process.env.UPLOAD_ON_AWS === "true",
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    accessSecret: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.BUCKET_NAME || "mdm-file-store",
    region: process.env.AWS_REGION || "us-east-1",
    urlExpiryInMinutes: process.env.AWS_URL_EXPIRY_IN_MINUTES || 120,
    apiVersion: process.env.API_VERSION,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "cowlarviaphotonfundjwtsecrettokenstring",
    expirationShortInSeconds:
      process.env.JWT_EXPIRATION_IN_SECONDS_SHORT || 3600000,
    expirationLongInSeconds:
      process.env.JWT_EXPIRATION_IN_SECONDS_LONG || 3600000,
    refreshExpirationInSeconds:
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_IN_SECONDS || 7200000,
    saltRounds: process.env.SALT_ROUNDS || 10,
    tokenExpiryExtensionSeconds: 60 * 60 * 24 * 365,
  },
  email: {
    fromName: process.env.EMAIL_FROM_NAME || "viaphoton",
    fromEmail: process.env.EMAIL_FROM_EMAIL || "mdm@viaphoton.com",
    replyTo: process.env.EMAIL_REPLY_TO_EMAIL || "mdm@viaphoton.com",
    contactEmail: process.env.CONTACT_EMAIL || "mdm@viaphoton.com",
    useTransporter: process.env.EMAIL_USE_TRANSPORTER === "true",
    userMailGun: process.env.EMAIL_USE_MAIL_GUN === "true",
    contactLink:
      process.env.CONTACT_LINK ||
      "https://www.digital-fairways.com/contact-us/",
    entityTitle: process.env.CONTACT_TITLE || "Fairways Connect Dashboard",
    transporter: {
      host: process.env.EMAIL_HOST_NAME || "smtp.mailtrap.io",
      service: process.env.EMAIL_SERVICE || "mailtrap",
      username: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
      port: Number(process.env.EMAIL_PORT) || 2525,
    },
    mailGun: {
      key: process.env.MAILGUN_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    },
  },
  mock_odoo_api: process.env.VUE_APP_MOCK_ODOO_API === "true" || false,
  esp: {
    ip: process.env.ESP_IP || "192.168.4.1",
    password: process.env.ESP_PASSWORD || "GHRJ_",
    endpoint: process.env.ESP_ENDPOINT || "wifi",
    ssidPrefix: process.env.ESP_SSID_PREFIX || "GEYSER_",
  },
  mqtt: {
    brokerBridgeNotification:
      process.env.BROKER_BRIDGE_NOTIFICATION === "enable",
    brokerBridgeNotificationSlackHook:
      process.env.BROKER_BRIDGE_NOTIFICATION_SLACK_URL ||
      "https://hooks.slack.com/services/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",
    host: process.env.MQTT_HOST || "localhost",
    port: process.env.MQTT_PORT || 8080,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    ssl: process.env.MQTT_SSL === "true",
    reconnect: process.env.MQTT_RECONNECT === "true",
    group: process.env.MQTT_GROUP,
    clientId: process.env.MQTT_CLIENT_ID || Date.now(),
    mqttTimeout: process.env.MQTT_RECONNECTION_TIMEOUT || 5 * 1000,
    mqttEnabled: process.env.MQTT_ENABLE || "true",
  },
  odoo: {
    api: "https://erp.viaphoton.com/api",
  },
  influx: {
    host: process.env.INFLUX_DB_HOST || "localhost",
    name: process.env.INFLUX_DB_NAME || "iotcore",
    aggregatesBucket: process.env.INFLUX_AGGREGATE_DB_NAME || "aggregates",
    port: process.env.INFLUX_DB_PORT || 8086,
    token:
      process.env.INFLUX_DB_TOKEN ||
      "EmqNG7cExfMk1zQ48Gmx_LpJfhcyf_UfVBca3Ko7FaHInI3eznFeW2jaKAiCkuInJajjxaYEtnQlQFyJqRoVNA==",
    organization: process.env.INFLUX_DB_ORG || "cowlar",
    userName: process.env.INFLUX_DB_USERNAME || "influxdb",
    password: process.env.INFLUX_DB_PASSWORD || "influxdb-pwd",
    precision: process.env.INFLUX_DB_PRECISION || "ms",
    timeout: process.env.INFLUX_DB_TIMEOUT || "100000",
  },
  twilio: {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_ACCOUNT_AUTH_TOKEN,
    number: process.env.TWILIO_ACCOUNT_NUMBER,
  },
  auth: {
    mobileAuth: {
      otpLength: process.env.MOBILE_AUTH_OTP_LENGTH || 4,
      otpExpirationInSeconds:
        process.env.MOBILE_AUTH_OTP_EXPIRATION_IN_SECONDS || 300,
    },
  },
  slack: {
    active: process.env.SLACK_ACTIVE === "enable",
    channel: process.env.SLACK_CHANNEL,
    deviceToChannel: process.env.DEVICE_TO_SLACK_CHANNEL,
    channelPUART: process.env.SLACK_CHANNEL_P_UART,
  },
  twitter: {
    key: process.env.TWITTER_API_KEY,
    secret: process.env.TWITTER_API_SECRET,
    callbackURL:
      process.env.TWITTER_CALL_BACK_URL ||
      "https://api.viaphoton.cowlar.com/v1/twitter/callback",
  },
  paypal: {
    sa: process.env.PAYPAL_SA || "sb-sklls3110703@business.example.com",
    clientId: process.env.PAYPAL_CLIENT_ID,
    secret: process.env.PAYPAL_SECRET,
  },
  stripe: {
    secret: process.env.STRIPE_SECRET_KEY,
  },
  mobileGame: {
    maxNoOfPlayers: process.env.MAX_NO_OF_GAME_PLAYERS || 5,
  },
  jazzCash: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID || "MC11328",
    password: process.env.JAZZCASH_PASSWORD,
    salt: process.env.JAZZCASH_SALT_INTEGERITY,
    apiLink:
      process.env.JAZZCASH_API_LINK ||
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0",
  },
  slackInfluxChannel: process.env.SLACK_INFLUX_CHANNEL,
  print: {
    labels: {
      companyName: process.env.PRINT_LABEL_COMPANY_NAME || "viaphoton",
      companyWebsite:
        process.env.PRINT_LABEL_COMPANY_WEBSITE || "www.viaphoton.cowlar.com",
    },
  },
  deviceSettings: {
    deviceType: {
      1: {
        timezone_name: timeZone,
      },
      21: {
        session_timeout_m: 20, // min
        rfid_enabled: false,
        timezone_name: timeZone,
      },
      22: {
        session_timeout_m: 20, // min
        test_timeout_s: 20, // sec
        wand_timeout_s: 5, // sec
        timezone_name: timeZone,
      },
      26: {
        timezone_name: timeZone,
        scale_factor: 0.965,
        offset_pixels: 400,
        offset_direction: 0,
      },
    },
  },
  mobileApp: {
    link: process.env.MOBILE_APP_LINK || "/app-link",
    iOS:
      process.env.MOBILE_APP_IOS_LINK ||
      "https://apps.apple.com/us/app/facebook/id284882215",
    android:
      process.env.MOBILE_APP_ANDROID_LINK ||
      "https://play.google.com/store/apps/details?id=com.facebook.katana&hl=en&gl=US",
  },
  /*
   * Date: 4 Jan 2022
   * The Following is required by the sequelize internal working
   * Please do not remove it!
   */
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    logging: process.env.DB_CONSOLE_LOGGING == 1,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
  },
  staging: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    logging: process.env.DB_CONSOLE_LOGGING == 1,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
  },
  test: {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_DATABASE,
    host: process.env.TEST_DB_HOST,
    logging: process.env.DB_CONSOLE_LOGGING == 1,
    dialect: process.env.TEST_DB_DIALECT || "mysql",

    port: process.env.TEST_DB_PORT || 3306,
    dialectOptions: {
      insecureAuth: true,
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    logging: process.env.DB_CONSOLE_LOGGING == 1,
    dialect: process.env.DB_DIALECT || "mysql",

    port: process.env.DB_PORT || 3306,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || 5),
      min: parseInt(process.env.DB_POOL_MIN || 0),
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
  },
  googleCaptchaSecret:
    process.env.GOOGLE_CAPTCHA_SECRET ||
    "6Lcej1QmAAAAABO6ZnkqG43RED0i3rEn7oxZMAXH", // default test captcha by google
  isCloudUpload:
    process.env.UPLOAD_ON_AWS === "true" ||
    process.env.UPLOAD_ON_AZURE === "true",
};
