const config = require("../config/config");
const accountSid = config.twilio.sid;
const authToken = config.twilio.token;
let client = null;
const { logger } = require("../logger");

try {
  client = require("twilio")(accountSid, authToken);
} catch (error) {
  logger.error("Twillio Config is missing - sms.js", error.message);
}

const smsLogsModel = require("../services/sms_logs");

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

exports.sendV1 = async (phone, content) => {
  try {
    const message = await client.messages.create({
      body: content,
      from: config.twilio.number,
      to: phone,
    });

    smsLogsModel.save(message).catch((err) => {
      logger.error("SMS log not saved");
      logger.error(err);
    });

    return message;
  } catch (err) {
    smsLogsModel
      .save({
        to: phone,
        from: config.twilio.number,
        body: content,
        exception: err.message,
      })
      .catch(() => {
        logger.error("SMS log not saved");
      });

    throw err;
  }
};
