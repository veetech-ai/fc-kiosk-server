const struct = require("python-struct");
const { logger } = require("../logger");

const peopleMetricSchema = require("./../common/influxSchemas/people-metrics.json");

exports.transformPeopleMetricsData = (byteArray) => {
  let unpackedData = [];
  const FormatV1 = "Qffbhh";
  const FormatV2 = "Qffbhhbb";
  const FormatV3 = "Qffbhhbbb";
  try {
    if (byteArray.length == struct.sizeOf(FormatV1)) {
      unpackedData = struct.unpack(FormatV1, Buffer.from(byteArray), false);
    } else if (byteArray.length == struct.sizeOf(FormatV2)) {
      unpackedData = struct.unpack(FormatV2, Buffer.from(byteArray), false);
    } else if (byteArray.length == struct.sizeOf(FormatV3)) {
      unpackedData = struct.unpack(FormatV3, Buffer.from(byteArray), false);
    } else {
      throw new Error("Cannot unpack data");
    }

    const formattedData = {
      ts: Number(unpackedData[0]),
      drowsiness: unpackedData[1],
      distraction: unpackedData[2],
      presence: unpackedData[3],
      userIdentification:
        peopleMetricSchema.properties.fields.properties.userIdentification.enum[
          unpackedData[4]
        ],
      deviceId: Number(unpackedData[5]),
      mouseActivityStatus: unpackedData[6] ? unpackedData[6] : 0,
      keyboardActivityStatus: unpackedData[7] ? unpackedData[7] : 0,
      storageDeviceDetection: unpackedData[8] ? unpackedData[8] : 0,
    };

    if (!formattedData.deviceId) delete formattedData.deviceId;
    return formattedData;
  } catch (error) {
    logger.error(error);
    throw new Error("unable to format the packet");
  }
};
