const { influx: influxConfig } = require("../config/config.js");
const { logger } = require("../logger");
const { Influx } = require("@cowlar/iotcore-common");
class InfluxGlobal {
  static #instance = null;

  constructor() {
    logger.info("*** ONBOARDING ***");

    this.db = new Influx({
      url: `http://${influxConfig.host}:${influxConfig.port}/`,
      token: influxConfig.token,
      organization: influxConfig.organization,
      timeout: Number.parseInt(influxConfig.timeout),
    });
  }

  static getInstance() {
    if (InfluxGlobal.#instance) return InfluxGlobal.#instance;

    InfluxGlobal.#instance = new InfluxGlobal();
    return InfluxGlobal.#instance;
  }
}

const instance = InfluxGlobal.getInstance();

exports.globalInflux = Object.freeze(instance);
