const { queryData } = require("../../common/influxHelper");
const influxSchemaFactoryFloor = require("../../digital-fairways-commons/influxSchemas/factory-floor.json");
const moment = require("moment");
const influxHelper = require("../../common/influxHelper");

global.influx_connection_ok = false;
global.isInfluxInitialized = false;

exports.getRework = async ({
  start,
  end,
  bucketName = "viaphoton",
  measurement = "factory_floor",
  getInvalidLogs = false,
} = {}) => {
  const query = `
    from(bucket: "${bucketName}")
      |> range(start: ${start}, stop: ${end})
      |> filter(fn: (r) => r["_measurement"] == "${measurement}")
      |> pivot(rowKey:["_time", "station_id"], columnKey: ["_field"], valueColumn: "_value")
      |> filter(fn: (r) => string(v: r["validityStatus"]) =~ /${
        getInvalidLogs ? ".*?" : 1
      }/)
      |> group(columns: [ "barcode"], mode:"by")
      |> sort(columns: ["_time"], desc: false)
      |> drop(columns: ["_start", "_stop"])
    `;
  const result = await queryData(query);
  return result;
};

exports.cleandata = async () => {
  const records = await this.getRework({
    end: "2022-12-30T16:20:46Z",
    start: "2022-02-10T16:20:46Z",
  });
  let oldBarcode = -1;
  let timeTakenTemp = 0;
  let pointsToInsert = [];
  await Promise.all(
    records.map(async (data) => {
      if (oldBarcode == data.barcode) {
        timeTakenTemp = (data.duration ?? 0) + timeTakenTemp;
        data.timeTaken = timeTakenTemp;
        data.tsm = moment(data._time).utc().valueOf();
        delete data.time;
        pointsToInsert.push(data);
      } else {
        timeTakenTemp = 0;
        data.timeTaken = timeTakenTemp;
        data.tsm = moment(data._time).utc().valueOf();
        delete data.time;
        pointsToInsert.push(data);
      }
      oldBarcode = data.barcode;
    }),
  );

  await influxHelper.insertInfluxDataBulk(
    pointsToInsert,
    influxSchemaFactoryFloor,
  );
};
this.cleandata();
