const { Point, RequestTimedOutError } = require("@influxdata/influxdb-client");
const { HttpError } = require("@influxdata/influxdb-client");

const { logger } = require("../logger");
const { globalInflux } = require("./influx-init");

const config = require("../config/config");
const helper = require("./helper");

const setTimestamp = (rawData) => {
  if (!("timestamp" in rawData)) {
    if (rawData.tsm) {
      rawData.timestamp = rawData.tsm;
    } else if (rawData.ts) {
      rawData.timestamp = rawData.ts * 1000;
    }
    if (config.influx.precision === "ns") {
      rawData.timestamp = rawData.timestamp * 1000;
    }
  }
  return rawData;
};

exports.buildQuery = (data) => {
  let query = `from(bucket: "${config.influx.name}")\n`;
  if (data.range && Object.keys(data.range).length > 0) {
    query =
      query + `|> range(start: ${data.range.start}, stop: ${data.range.end})\n`;
    if (data.measurement) {
      query =
        query +
        `|> filter(fn: (r) => r["_measurement"] == "${data.measurement}"`;
      const tagsKeys = data.tagsToFilter ? Object.keys(data.tagsToFilter) : [];
      if (tagsKeys.length > 0) {
        tagsKeys.forEach((key) => {
          query =
            query + " and " + `r["${key}"] == "${data.tagsToFilter[key]}"`;
        });
      }
      query = query + ")\n";
      if (data.fieldsToFilter && data.fieldsToFilter.length > 0) {
        query = query + "|> filter(fn: (r) => ";
        data.fieldsToFilter.forEach((field, index) => {
          query = query + `r["_field"] == "${field}"`;
          if (index !== data.fieldsToFilter.length - 1) {
            query = query + " or ";
          }
        });
        query = query + ")\n";
      }
      if (
        data.aggregateWindow &&
        Object.keys(data.aggregateWindow).length > 0
      ) {
        query =
          query +
          `|> aggregateWindow(every: ${data.aggregateWindow.every}, fn: ${data.aggregateWindow.fn}) \n`;
      }
      if (data.aggregateFn && Object.keys(data.aggregateFn).length > 0) {
        if (data.aggregateFn.column) {
          query =
            query +
            `|> ${data.aggregateFn.name}(column: "${data.aggregateFn.column}")\n`;
        } else {
          query = query + `|> ${data.aggregateFn.name}()\n`;
        }
      }
      if (data.columnsToKeep && data.columnsToKeep.length > 0) {
        query = query + "|> keep(columns: [";
        data.columnsToKeep.forEach((column, index) => {
          query = query + `"${column}"`;
          if (index !== data.columnsToKeep.length - 1) {
            query = query + " , ";
          }
        });
        query = query + "])\n";
      }
      if (data.result) {
        query = query + `|> yield(name: "${data.result}")\n`;
      }
    }
  }

  return query;
};

exports.queryData = async (query) => {
  try {
    return await globalInflux.db.queryData(query);
  } catch (error) {
    // Sending Message to Slack if request timed out
    if (error instanceof RequestTimedOutError) {
      await helper.send_slack("Influx Request Timed Out in " + error);
    }

    // Logging Errors on Console
    logger.info("---------------------------------------------------");
    logger.error(error);
    logger.info(query);
    logger.info("***************************************************");
    throw error;
  }
};

exports.createPoints = (data) => {
  const point = new Point(data.measurement);

  Object.keys(data.fields).forEach((field) => {
    if (typeof data.fields[field] === "string") {
      point.stringField(field, data.fields[field]);
    } else if (typeof data.fields[field] === "number") {
      point.floatField(field, data.fields[field]);
    }
  });

  point.tags = { ...data.tags };
  point.timestamp(data.timestamp);

  return point;
};

exports.convertToInfluxData = (data, influxSchema) => {
  const newData = {
    measurement: influxSchema.properties.measurement.const,
    fields: {},
    tags: {},
    timestamp: data.timestamp,
  };

  Object.keys(data).forEach((key) => {
    if (data[key] == null) return;
    if (Object.keys(influxSchema.properties.fields.properties).includes(key)) {
      newData.fields[key] = data[key];
    }
    if (Object.keys(influxSchema.properties.tags.properties).includes(key)) {
      newData.tags[key] = data[key];
    }
  });

  const validationResponse = helper.validateDataWithSchema(
    influxSchema,
    newData,
  );

  if (!validationResponse.isValidated) {
    logger.info(
      `Schema Validation failed: ${JSON.stringify(
        validationResponse.errors,
      )} ${JSON.stringify(newData)}`,
    );
  }

  return { validated: validationResponse.isValidated, convertedData: newData };
};

exports.toLineProtocol = (point) => {
  let fields = "";
  let tags = "";
  Object.keys(point.fields)
    .sort()
    .forEach((t) => {
      const r = point.fields[t];
      if (fields.length > 0) {
        fields += ",";
      }
      fields += `${t}=${r}`;
    });
  Object.keys(point.tags)
    .sort()
    .forEach((t) => {
      const r = point.tags[t];
      if (tags.length > 0) {
        tags += ",";
      }
      tags += `${t}=${r}`;
    });
  const line = `${point.name},${tags} ${fields} ${point.time}`;
  logger.info(line);
  return line;
};

exports.insertInfluxData = async (rawData, influxSchema) => {
  const self = this;
  try {
    rawData = setTimestamp(rawData);

    const response = self.convertToInfluxData(rawData, influxSchema);

    if (!response.validated) {
      return 0;
    } else {
      const point = self.createPoints(response.convertedData);

      if (rawData.timestamp !== undefined) {
        try {
          await globalInflux.db.writePoint(
            point,
            config.influx.name,
            config.influx.precision,
          );
          return 1;
        } catch (e) {
          if (e instanceof HttpError && e.statusCode === 401) {
            logger.info(
              "Run ./onboarding.js to setup a new InfluxDB database.",
            );
          } else {
            logger.info(`inserting ${point}`);
            this.toLineProtocol(point);
            logger.error(e);
          }
          return 0;
        }
      } else {
        logger.info("timestamp not found");
        throw { message: "timestamp not found" };
      }
    }
  } catch (err) {
    logger.info("InfluxDB Error TryCatchBlock");
    logger.error(err);

    if (influx_connection_ok) {
      helper
        .send_slack(
          `InfluxDB tryCatchBlock error. ERROR: ${err.message}`,
          config.slackInfluxChannel,
        )
        .then(() => {})
        .catch(() => {});
      influx_connection_ok = false;
    }

    return false;
  }
};

exports.insertInfluxDataBulk = async (rawDataPoints, influxSchema) => {
  try {
    let points = rawDataPoints.map((rawData) => {
      rawData = setTimestamp(rawData);

      // Do not insert point which has no timestamp
      if (rawData.timestamp === undefined) {
        logger.error("timestamp not found");
        return null;
      }

      // Converting to valid influx data
      // Return null if the response is not validated
      const response = this.convertToInfluxData(rawData, influxSchema);
      if (!response.validated) {
        return null;
      }

      return this.createPoints(response.convertedData);
    });

    // Filter the invalid points
    points = points.filter((point) => {
      return point !== null && points !== undefined;
    });

    // Now that we have points, we will bulk insert them
    if (points.length > 0) {
      await globalInflux.db.writePoints(
        points,
        config.influx.name,
        config.influx.precision,
      );
    }

    return true;
  } catch (error) {
    logger.info("Bulk InfluxDB Insertion Failed");
    logger.error(error);
    return false;
  }
};
