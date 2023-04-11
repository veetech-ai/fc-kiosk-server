const mqtt = require("async-mqtt");

const config = require("../config/config");

class GlobalMQTT {
  static #instance = null;

  #mqttClientId = `mqtt_node_app_${config.mqtt.clientId}_${
    config.mqtt.mqttEnabled === "true" ? "mqtt_only" : "api_only"
  }`;

  #mqttUri = `${config.mqtt.ssl ? "wss" : "ws"}://${config.mqtt.host}:${Number(
    config.mqtt.port,
  )}`;

  constructor() {
    this.client = mqtt.connect(this.#mqttUri, {
      clientId: this.#mqttClientId,
      username: config.mqtt.username,
      password: config.mqtt.password,
      keepalive: 20,
      connectTimeout: 5000,
      protocolVersion: 5,
      reconnectPeriod: config.mqtt.reconnect ? 1000 : 0,
      clean: false,
    });
  }

  static getInstance() {
    if (GlobalMQTT.#instance) return GlobalMQTT.#instance;

    GlobalMQTT.#instance = new GlobalMQTT();
    return GlobalMQTT.#instance;
  }
}

const instance = GlobalMQTT.getInstance();
exports.globalMQTT = Object.freeze(instance);
