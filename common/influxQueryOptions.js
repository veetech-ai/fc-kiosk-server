exports.dashboard_queries_parts = (deviceId, timeCheck) => {
  switch (timeCheck) {
    case "today":
      return [
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["t"],
          aggregateFn: {
            name: "last",
          },
          columnsToKeep: ["_value"],
          result: "Current Temperature",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["t"],
          aggregateFn: {
            name: "max",
          },
          columnsToKeep: ["_value"],
          result: "Maximum Temperature",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["t"],
          aggregateFn: {
            name: "min",
          },
          columnsToKeep: ["_value"],
          result: "Minimum Temperature",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["h"],
          aggregateFn: {
            name: "last",
          },
          columnsToKeep: ["_value"],
          result: "Humidity",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["ws"],
          aggregateFn: {
            name: "last",
          },
          columnsToKeep: ["_value"],
          result: "Wind Speed",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["tr"],
          aggregateFn: {
            name: "first",
          },
          columnsToKeep: ["_value"],
          result: "Initial Rainfall",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["tr"],
          aggregateFn: {
            name: "last",
          },
          columnsToKeep: ["_value"],
          result: "Final Rainfall",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["wd"],
          aggregateFn: {
            name: "last",
          },
          columnsToKeep: ["_value"],
          result: "Wind Direction",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["wg"],
          aggregateFn: {
            name: "last",
          },
          columnsToKeep: ["_value"],
          result: "Wind Gust",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["f"],
          aggregateFn: {
            name: "last",
          },
          columnsToKeep: ["_value"],
          result: "Battery Status",
        },
      ];
    case "yesterday":
      return [
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["t"],
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Average Temperature",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["h"],
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Average Humidity",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["ws"],
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Average Wind Speed",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["tr"],
          aggregateWindow: {
            every: "1h",
            fn: "last",
          },
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Total Rainfall",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["wd"],
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Average Wind Direction",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["wg"],
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Wind Gust",
        },
      ];
    case "7d":
      return [
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["t"],
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Average Temperature",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["h"],
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Average Humidity",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["ws"],
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Average Wind Speed",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["tr"],
          aggregateWindow: {
            every: "1h",
            fn: "last",
          },
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Total Rainfall",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["wd"],
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Average Wind Direction",
        },
        {
          tagsToFilter: {
            deviceId: deviceId,
          },
          fieldsToFilter: ["wg"],
          aggregateFn: {
            name: "mean",
          },
          columnsToKeep: ["_value"],
          result: "Wind Gust",
        },
      ];
  }
};
