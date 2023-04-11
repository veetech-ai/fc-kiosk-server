const { InfluxDB } = require("@influxdata/influxdb-client");
const { SetupAPI } = require("@influxdata/influxdb-client-apis");
const influxConfig = require("./config/config").influx;
const { logger } = require("./logger");

const url = "http://" + influxConfig.host + ":" + influxConfig.port + "/";
console.log("url >>", url);

const setupApi = new SetupAPI(new InfluxDB({ url: url }));
setupApi
  .getSetup()
  .then(async ({ allowed }) => {
    logger.info("*** ONBOARDING ***");
    if (allowed) {
      await setupApi.postSetup({
        body: {
          org: influxConfig.organization,
          bucket: influxConfig.name,
          username: influxConfig.userName,
          password: influxConfig.password,
          token: influxConfig.token,
        },
      });
      logger.info(`InfluxDB '${url}' is now onboarded.`);
    } else {
      logger.info(`InfluxDB '${url}' has been already onboarded.`);
    }
    logger.info("\nFinished SUCCESS");
  })
  .catch((error) => {
    logger.error(error);
    logger.warn("\nFinished ERROR");
  });
