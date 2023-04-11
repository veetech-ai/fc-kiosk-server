const { v4: uuidv4 } = require("uuid");

const helper = require("../common/helper");

// Using a variable to indicate the state of the messages received
let stateObject = {};
let channelWrite, command;

// Handling State Changes
const stateProxy = new Proxy(stateObject, {
  set: function (target, key, value) {
    target[key] = value;

    if (key === "message" && value === "connected") {
      helper.mqtt_publish_message(channelWrite, command, false, 2, false);
    }

    return true;
  },
});

stateProxy.message = "none";

const sshStart = async (deviceId) => {
  const sessionId = uuidv4();

  await helper.mqtt_publish_message(
    `d/${deviceId}/sshstart`,
    { sessionId: sessionId, settings: { cols: 195, rows: 35 } },
    false,
    2,
  );

  return sessionId;
};

exports.sshStart = sshStart;

exports.messageReceived = async (payloadString) => {
  if (payloadString.match(/Welcome/)) {
    stateProxy.message = "connected";
  }
};
