const config = require("../config/config");
const accountSid = config.twilio.sid;
const authToken = config.twilio.token;
const client = require("twilio")(accountSid, authToken);

const smsLogsModel = require("../services/sms_logs");

const { logger } = require("../logger");

exports.send = (phone, message) => {
  return new Promise((resolve, reject) => {
    try {
      client.messages
        .create({
          body: message,
          from: config.twilio.number,
          to: phone,
        })
        .then((message) => {
          try {
            smsLogsModel.save(message).catch((err) => {
              logger.error("SMS log not save");
              logger.error(err);
            });
            resolve(message);
          } catch (err) {
            resolve(message);
          }
        })
        .catch((err) => {
          try {
            smsLogsModel
              .save({
                to: phone,
                from: config.twilio.number,
                body: message,
                exception: err.message,
              })
              .catch(() => {
                logger.error("SMS log not save");
              });
          } catch (err) {
            logger.error(err);
          }
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};
