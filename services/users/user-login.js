const { queryData } = require("../../common/influxHelper");

exports.calculateTimeDiffLastLoginAndLogout = async ({
  name,
  startTime,
  endTime = "now()",
  org,
  measurements,
  deviceId,
  userId,
}) => {
  return new Promise(async (resolve, reject) => {
    const query = `
      from(bucket: "${name}")
        |> range(start: ${startTime} , stop: ${endTime})
        |> filter(fn: (r) => (r["_measurement"] == "${measurements.userLoginInfo}") and (r["_field"] == "status") and (r["deviceId"] == "${deviceId}") and (r["userId"] == "${userId}"))
        |> sort(columns: ["_time"], desc: false)
        |> elapsed(unit: 1s)
        |> last()
        |> to(bucket: "${measurements.aggregatesBucket}", org: "${org}", timeColumn: "_time", fieldFn: (r) => ({"elapsed": r.elapsed}), tagColumns:["userId", "deviceId"])
        |> yield(name: "login diff")
          `;
    try {
      const result = await queryData(query);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
