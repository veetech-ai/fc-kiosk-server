exports.buildGetQuery = (bucketName, start, end, deviceId) => {
  return `from(bucket: "${bucketName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "new_diagnostic_data" and r["device_id"] == "${deviceId}") and r["_field"] == "machine_time")
  |> group(columns: ["machine_time"])
  |> reduce(fn: (r, accumulator) => (
  { sum: r._value + accumulator.sum ,
    max: if r._value > accumulator.max then r._value else accumulator.max,
    min: if  accumulator.min == 0.0 then r._value
        else if r._value < accumulator.min then r._value 
        else accumulator.min,
    count: accumulator.count + 1.0,
    avg: accumulator.sum / accumulator.count
  } 
), 
identity: {sum: 0.0, max: 0.0, min: 0.0, count: 0.0, avg: 0.0}
)
|> keep(columns: ["max", "min", "avg", "count", "sum"])
|> yield(name: "stats_machine_time")`;
};

exports.buildGetWithDiagnosticsDataQuery = (
  bucketName,
  start,
  end,
  deviceId,
) => {
  return `from(bucket: "${bucketName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "new_diagnostic_data" and r["deviceId"] == "${deviceId}") and r["_field"] == "machineTime" )
  |> group(columns: ["machineTime"])
  |> reduce(fn: (r, accumulator) => (
  { sum: r._value + accumulator.sum ,
    maximumTime: if r._value > accumulator.maximumTime then r._value else accumulator.maximumTime,
    minimumTime: if  accumulator.minimumTime == 0.0 then r._value
        else if r._value < accumulator.minimumTime then r._value 
        else accumulator.minimumTime,
    count: accumulator.count + 1.0,
    avgMachineTime: accumulator.sum / accumulator.count
  } 
), 
identity: {sum: 0.0, maximumTime: 0.0, minimumTime: 0.0, count: 1.0, avgMachineTime: 0.0}
)
|> keep(columns: ["maximumTime", "minimumTime", "avgMachineTime"])
|> yield(name: "Stats Machine Time")
from(bucket: "${bucketName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => r["_measurement"] == "new_diagnostic_data" and r["deviceId"] == "${deviceId}" and r["_field"] == "operatorTime")
  |> group(columns: ["operatorTime"])
  |> mean(column: "_value")
  |> keep(columns: ["_value"])
  |> rename(columns: {_value: "avgOperatorTime"})
  |> yield(name: "Average Operator Time")
from(bucket: "${bucketName}") 
  |> range(start: ${start}, stop: ${end} )
  |> filter(fn: (r) => (r._measurement == "new_diagnostic_data" and r.deviceId == "${deviceId}") and (r._field == "machineTime"))
  |> group(columns: ["deviceId", "opsStatus"])
  |> count()
  |> pivot(columnKey: ["opsStatus"], rowKey: ["deviceId"], valueColumn: "_value")
  |> drop(columns: ["deviceId", "_start", "_stop"])
  |> yield(name: "Totals")
from(bucket: "${bucketName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "new_diagnostic_data") and (r["deviceId"] == "${deviceId}") and  (r["_field"] == "operatorTime"))
  |> group()
  |> first()
  |> keep(columns: ["_time"])
  |> rename(columns: {_time: "firstRecordTime"})
  |> yield(name: "First Record")
from(bucket: "${bucketName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "new_diagnostic_data") and (r["deviceId"] == "${deviceId}") and (r["_field"] == "operatorTime") )
  |> group()
  |> last()
  |> keep(columns: ["_time"])
  |> rename(columns: {_time: "lastRecordTime"})
  |> yield(name: "last Record")`;
};

exports.buildGetPowerCableDataQuery = (influxName, start, end, deviceId) => {
  return `cableSerial = from(bucket: "${influxName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "power_cable_tester_data") and (r["_field"] == "cableSerial") and (r["deviceId"] == "${deviceId}"))
  |> keep(columns: ["_field", "_value", "_time"])

finalResult = from(bucket: "${influxName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "power_cable_tester_data") and (r["_field"] == "finalResult" ) and (r["deviceId"] == "${deviceId}") )
  |> keep(columns: ["_field", "_value", "_time"])

joined = join(tables: {cableSerial: cableSerial, finalResult: finalResult}, on: ["_time"])

passFailResult = joined
  |> group(columns: ["_value_cableSerial"])
  |> rename(columns: {_value_cableSerial: "_value"})
  |> first()

passFailResult
  |> group()
  |> reduce(fn: (r, accumulator) => (
  { 
  count: accumulator.count + 1,
  firstTimePass: if r._value_finalResult == 0 then accumulator.firstTimePass + 1 else accumulator.firstTimePass + 0,
  firstTimeFail: if r._value_finalResult == 1 then accumulator.firstTimeFail + 1 else accumulator.firstTimeFail + 0,
  }
  ), 
  identity: {count: 0, firstTimePass: 0, firstTimeFail: 0})
  |> yield(name: "First Pass Fail And Total Records")
from(bucket: "${influxName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "power_cable_tester_data") and (r["deviceId"] == "${deviceId}") and (r["_field"] == "finalResult" and r["_value"] == 1) )
  |> group()
  |> count()
  |> keep(columns: ["_value"])
  |> rename(columns: {_value: "totalFail"})
  |> yield(name: "Total Fail Records")
from(bucket: "${influxName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "power_cable_tester_data") and (r["deviceId"] == "${deviceId}") and (r["_field"] == "finalResult" and r["_value"] == 0))
  |> group()
  |> count()
  |> keep(columns: ["_value"])
  |> rename(columns: {_value: "totalPass"})
  |> yield(name: "Total Pass Records")
from(bucket: "${influxName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "power_cable_tester_data") and (r["_field"] == "cableSerial" ) and (r["deviceId"] == "${deviceId}"))
  |> group()
  |> count()
  |> keep(columns: ["_value"])
  |> rename(columns: {_value: "total"})
  |> yield(name: "Total Records")`;
};

exports.buildGetPowerCableDeviceDataCollectionQuery = (
  influxName,
  start,
  end,
  deviceId,
  limit,
  offset,
) => {
  return `cableSerial = from(bucket: "${influxName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "power_cable_tester_data") and (r["_field"] == "cableSerial") and (r["deviceId"] == "${deviceId}"))
  |> keep(columns: [ "_value", "_time", "userId"])
  
finalResult = from(bucket: "${influxName}")
  |> range(start: ${start}, stop: ${end})
  |> filter(fn: (r) => (r["_measurement"] == "power_cable_tester_data") and (r["_field"] == "finalResult") and (r["deviceId"] == "${deviceId}") )
  |> keep(columns: [ "_value", "_time"])
  
  joined = join(tables: {cableSerial: cableSerial, finalResult: finalResult}, on: ["_time"])

  joined
      |> group()
      |> limit(n: ${limit}, offset: ${offset})
      |> rename(
        columns: {
            _time: "testTime",
            userId: "operatorId",
            _value_cableSerial: "serialNo",
            _value_finalResult: "finalResult",
        },
      )
      |> yield(name: "records")
  joined
      |> group()
      |> count(column: "_value_finalResult")
      |> rename(
          columns: {
              _value_finalResult:"count"
          },
      )
      |> yield(name: "count")
  `;
};
