const wifi = require("node-wifi");
const config = require("../../config/config");
const { logger } = require("../../logger");

const debug = true;
const iface = "wlan2"; // null
exports.get_connected_wifi_details = () => {
  return new Promise((resolve, reject) => {
    wifi.init({
      debug: debug,
      iface: iface, // network interface, choose a random wifi interface if set to null
    });

    wifi.getCurrentConnections(function (err, currentConnections) {
      if (err) {
        logger.error(err);
        reject({ message: err });
      } else {
        resolve(currentConnections);
      }
    });
  });
};

exports.get_esp_wifi = () => {
  return new Promise((resolve, reject) => {
    wifi.init({
      debug: debug,
      iface: iface, // network interface, choose a random wifi interface if set to null
    });

    wifi.scan(function (err, networks) {
      if (err) {
        logger.error(err);
        reject({ message: err });
      } else {
        const filtered_wifis = [];
        for (let i = 0; i < networks.length; i++) {
          if (networks[i].ssid.indexOf(config.esp.ssidPrefix) == 0) {
            filtered_wifis.push(networks[i]);
          }
        }
        resolve(filtered_wifis);
      }
    });
  });
};

exports.get_internet_wifi = () => {
  return new Promise((resolve, reject) => {
    wifi.init({
      debug: debug,
      iface: iface, // network interface, choose a random wifi interface if set to null
    });

    wifi.scan(function (err, networks) {
      if (err) {
        logger.error(err);
        reject({ message: err });
      } else {
        const filtered_wifis = [];
        for (let i = 0; i < networks.length; i++) {
          if (!(networks[i].ssid.indexOf(config.esp.ssidPrefix) == 0)) {
            filtered_wifis.push(networks[i]);
          }
        }
        resolve(filtered_wifis);
      }
    });
  });
};

exports.connect_to_esp_wifi = (ssid, password) => {
  return new Promise((resolve, reject) => {
    wifi.init({
      debug: debug,
      iface: iface, // network interface, choose a random wifi interface if set to null
    });

    wifi.connect({ ssid: ssid, password: password }, function (err) {
      if (err) {
        logger.error(err);
        reject({ message: err });
      } else {
        resolve("connected");
      }
    });
  });
};

exports.getPassword = (ssid) => {
  return new Promise((resolve, reject) => {
    if (ssid.indexOf(config.esp.ssidPrefix) == 0) {
      const split = ssid.split("_");
      const numbers = split[1];

      let password =
        numbers[4] +
        numbers[5] +
        numbers[2] +
        numbers[3] +
        numbers[0] +
        numbers[1];
      password = config.esp.password + password;
      resolve(password);
    } else {
      resolve(false);
    }
  });
};
