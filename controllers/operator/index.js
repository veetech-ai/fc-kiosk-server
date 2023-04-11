// External Imports
const moment = require("moment/moment");

// Config Imports
const config = require("../../config/config");

// Influx Schema Imports
const userRFIDLoginSchema = require("../../common/influxSchemas/userRFIDLogin.schema.json");
const userLoginInfluxSchema = require("../../df-commons/influxSchemas/userRFIDLogin.schema.json");

// Query Imports
const {
  calculateTimeDiffLastLoginAndLogout,
} = require("../../services/users/user-login");
const UserModel = require("../../services/user");
const DeviceModel = require("../../services/device");

// Common Imports
const influxHelper = require("../../common/influxHelper");

// Logger Imports
const { logger } = require("../../logger");

// Helper Imports
const { transformUserLoginData, _generateUpdate } = require("./helpers");

exports.loginDeviceUser = async (payload) => {
  const deviceId = payload.destinationName.split("/")[1];
  const packet = transformUserLoginData(payload.payloadBytes);
  packet.deviceId = deviceId;
  try {
    const isDataInserted = await influxHelper.insertInfluxData(
      {
        ...packet,
      },
      userRFIDLoginSchema,
    );

    if (packet.status == 0 && isDataInserted) {
      const measurements = {
        userLoginInfo: userLoginInfluxSchema.properties.measurement.const,
        aggregatesBucket: config.influx.aggregatesBucket,
      };
      const param = {
        name: config.influx.name,
        startTime: "-16h",
        org: config.influx.organization,
        deviceId: deviceId,
        userId: packet.userId,
        measurements: measurements,
        endTime: moment(packet.tsm).add(1, "seconds").format(),
      };
      await calculateTimeDiffLastLoginAndLogout(param);
    }

    const { status, userId } = packet;

    if (status === 1) {
      const { name } = await UserModel.findById(userId);
      await DeviceModel.loginOperator(deviceId, {
        operatorId: userId,
        operatorName: name,
        operatorLoginTime: new Date(),
      });
    } else {
      await DeviceModel.logoutOperator(deviceId, { operatorId: userId });
    }

    const action = { metrics: "refresh" };

    await _generateUpdate({ action, deviceId });
  } catch (error) {
    logger.error(error);
  }
};
