const { logger } = require("../logger");

module.exports = async () => {
  logger.info(
    "\n*************************************************************",
  );
  logger.info("Global start before all test suits and cases");
  logger.info("Very useful for first time settings");
};
