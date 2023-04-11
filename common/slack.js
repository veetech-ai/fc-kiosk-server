const config = require("./../config/config");
const axios = require("axios");
const ConfigurationsModel = require("../services/configurations");

exports.send = (message, hook = null) => {
  return new Promise((resolve, reject) => {
    if (config.slack.active || config.env === "production") {
      ConfigurationsModel.get()
        .then((result) => {
          const slack_status = !!(result && result.config.slack_notifications);

          if (slack_status) {
            message = `${message} \n\n Server: ${config.app.title}`;

            axios
              .post(`${hook || config.slack.channel}`, { text: message })
              .then(function (response) {
                resolve(response);
              })
              .catch(function (error) {
                reject({ message: error });
              });
          } else {
            resolve({ message: "Slack is disable" });
          }
        })
        .catch(() => {
          reject({ message: "Slack is disable" });
        });
    } else {
      resolve({ message: "Slack is disable" });
    }
  });
};

exports.send_forcefully = (message, hook = null) => {
  return new Promise((resolve, reject) => {
    message = `${message} \n\n Server: ${config.app.title}`;

    axios
      .post(`${hook || config.slack.channel}`, { text: message })
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject({ message: error });
      });
  });
};
