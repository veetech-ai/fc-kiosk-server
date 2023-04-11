// External Imports
const moment = require("moment");
const Validator = require("validatorjs");

// Logger Imports
const { logger } = require("../../logger");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");

// Configuration Imports
const config = require("../../config/config");

// Services Imports
const { getQueryResults } = require("../../services/graph");

// Influx Query Builder
const {
  buildGetQuery,
  buildGetWithDiagnosticsDataQuery,
  buildGetPowerCableDataQuery,
  buildGetPowerCableDeviceDataCollectionQuery,
} = require("./influx");

/**
 * @swagger
 * tags:
 *   name: Graphs
 *   description: Graphs (Time series data)
 */

exports.get = (req, res) => {
  /**
   * @swagger
   *
   * /graph/get:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Graph
   *     tags: [Graphs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: device_id
   *         description: Device ID
   *         in: query
   *         required: true
   *         type: number
   *       - name: filter
   *         description: Filters can be today, yesterday, n(d) e.g 7d // Means last 7 days, and last one is date|date e.g 2019-12-20|2020-02-02
   *         in: query
   *         required: true
   *         type: string
   *       - name: sq
   *         description: query
   *         in: query
   *         required: false
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.query, {
      device_id: "required",
      filter: ["required", `regex:${helper.filterRegex}`],
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      let start = moment()
        .subtract(1, "days")
        .startOf("day")
        .format("YYYY-MM-DDTHH:mm:ssZ");
      let end = moment().format("YYYY-MM-DDTHH:mm:ssZ");

      if (req.query.filter) {
        const filter = req.query.filter;

        if (filter.indexOf("|") > -1) {
          // Range Case
          const range = filter.split("|");
          start = moment(range[0])
            .startOf("day")
            .format("YYYY-MM-DDTHH:mm:ssZ");
          end = moment(range[1]).endOf("day").format("YYYY-MM-DDTHH:mm:ssZ");
        } else if (filter.indexOf("today") > -1) {
          // today case
          start = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ssZ");
          end = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ssZ");
        } else if (filter.indexOf("yesterday") > -1) {
          // yesterday case
          start = moment()
            .subtract(1, "days")
            .startOf("day")
            .format("YYYY-MM-DDTHH:mm:ssZ");
          end = moment()
            .subtract(1, "days")
            .endOf("day")
            .format("YYYY-MM-DDTHH:mm:ssZ");
        } else if (filter.indexOf("d") > -1) {
          // Nth days case
          start = moment()
            .subtract(parseInt(filter.substring(-1)), "days")
            .startOf("day")
            .format("YYYY-MM-DDTHH:mm:ssZ");
          end = moment().format("YYYY-MM-DDTHH:mm:ssZ");
        }
      }

      let query = buildGetQuery(
        config.influx.name,
        start,
        end,
        req.query.device_id,
      );

      if (req.query.sq && req.query.sq === "diagnostic_data") {
        query = buildGetWithDiagnosticsDataQuery(
          config.influx.name,
          start,
          end,
          req.query.device_id,
        );
      }

      try {
        const result = await getQueryResults(
          query,
          req.query.sq ? req.query.sq : "diagnostic_data",
        );

        return apiResponse.success(res, req, result);
      } catch (error) {
        return apiResponse.fail(res, error.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.getPowerCableTesterData = (req, res) => {
  /**
   * @swagger
   *
   * /graph/power-cable-tester:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Graph
   *     tags: [Graphs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: device_id
   *         description: Device ID
   *         in: query
   *         required: true
   *         type: number
   *       - name: filter
   *         description: Filters can be today, yesterday, n(d) e.g 7d // Means last 7 days, and last one is date|date e.g 2019-12-20|2020-02-02
   *         in: query
   *         required: false
   *         type: string
   *       - name: sq
   *         description: query
   *         in: query
   *         required: false
   *         type: string
   *       - name: limit
   *         description: no of record in one page
   *         in: query
   *         required: false
   *         type: number
   *       - name: page
   *         description: page No.
   *         in: query
   *         required: false
   *         type: number
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.query, {
      device_id: "required",
      filter: "string",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      let start = moment()
        .subtract(1, "days")
        .startOf("day")
        .format("YYYY-MM-DDTHH:mm:ssZ");
      let end = moment().format("YYYY-MM-DDTHH:mm:ssZ");
      if (req.query.filter) {
        const filter = req.query.filter;

        if (filter.indexOf("|") > -1) {
          // Range Case
          const range = filter.split("|");
          start = moment(range[0])
            .startOf("day")
            .format("YYYY-MM-DDTHH:mm:ssZ");
          end = moment(range[1]).endOf("day").format("YYYY-MM-DDTHH:mm:ssZ");
        } else if (filter.indexOf("today") > -1) {
          // today case
          start = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ssZ");
          end = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ssZ");
        } else if (filter.indexOf("yesterday") > -1) {
          // yesterday case
          start = moment()
            .subtract(1, "days")
            .startOf("day")
            .format("YYYY-MM-DDTHH:mm:ssZ");
          end = moment()
            .subtract(1, "days")
            .endOf("day")
            .format("YYYY-MM-DDTHH:mm:ssZ");
        } else if (filter.indexOf("d") > -1) {
          // Nth days case
          start = moment()
            .subtract(parseInt(filter.substring(-1)), "days")
            .startOf("day")
            .format("YYYY-MM-DDTHH:mm:ssZ");
          end = moment().format("YYYY-MM-DDTHH:mm:ssZ");
        }
      }

      let query = "";
      const influxName = config.influx.name;
      const deviceId = req.query.device_id;

      if (req.query.sq && req.query.sq === "power_cable_data") {
        query = buildGetPowerCableDataQuery();
      } else if (
        req.query.sq &&
        req.query.sq === "powerCableDeviceDataCollection"
      ) {
        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        const offset = (page - 1) * limit;
        query = buildGetPowerCableDeviceDataCollectionQuery(
          influxName,
          start,
          end,
          deviceId,
          limit,
          offset,
        );
      }

      try {
        const result = await getQueryResults(
          query,
          req.query.sq ? req.query.sq : "diagnostic_data",
        );

        return apiResponse.success(res, req, result);
      } catch (error) {
        return apiResponse.fail(res, error.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.battery_logs = (req, res) => {
  /**
   * @swagger
   *
   * /graph/battery-log:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Battery Logs
   *     tags: [Graphs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: device_id
   *         description: Device ID
   *         in: query
   *         required: true
   *         type: number
   *       - name: timezone
   *         description: User Local Timezone
   *         in: query
   *         required: true
   *         type: string
   *       - name: filter
   *         description: Filters can be today, yesterday, n(d) e.g 7d // Means last 7 days, and last one is date|date e.g 2019-12-20|2020-02-02
   *         in: query
   *         required: false
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.query, {
      device_id: "required",
      timezone: "required",
      filter: "string",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const tz = req.query.timezone || moment.tz.guess();

      let start = moment
        .utc(moment().tz(tz).startOf("day"))
        .format("YYYY-MM-DD HH:mm:ss");
      let end = moment.utc(moment().tz(tz)).format("YYYY-MM-DD HH:mm:ss");
      let group_interval = "60m";
      let days = 1;

      if (req.query.filter) {
        const filter = req.query.filter;
        if (filter.indexOf("|") > -1) {
          // Range Case
          const range = filter.split("|");
          const sDate = moment(range[0]).tz(tz).startOf("day");
          const eDate = moment(range[1]).tz(tz).endOf("day");
          start = moment.utc(sDate).format("YYYY-MM-DD HH:mm:ss");
          end = moment.utc(eDate).format("YYYY-MM-DD HH:mm:ss");

          days = eDate.diff(sDate, "days");
          if (days > 3 && days <= 10) {
            group_interval = "2h";
          } else if (days > 10) {
            group_interval = "8h";
          }
        } else if (filter.indexOf("today") > -1) {
          // today case
          group_interval = "60m";
          start = moment
            .utc(moment().tz(tz).startOf("day"))
            .add(1, "s")
            .format("YYYY-MM-DD HH:mm:ss");
          end = moment
            .utc(moment().tz(tz).endOf("day"))
            .format("YYYY-MM-DD HH:mm:ss");
          days = 1;
        } else if (filter.indexOf("yesterday") > -1) {
          // yesterday case
          group_interval = "60m";
          start = moment
            .utc(moment().tz(tz).subtract(1, "days").startOf("day").add(1, "s"))
            .format("YYYY-MM-DD HH:mm:ss");
          end = moment
            .utc(moment().tz(tz).subtract(1, "days").endOf("day"))
            .format("YYYY-MM-DD HH:mm:ss");
          days = 1;
        } else if (filter.indexOf("d") > -1) {
          // Nth days case
          days = parseInt(filter.substring(-1));
          if (days > 3 && days <= 10) {
            group_interval = "2h";
          } else if (days > 10) {
            group_interval = "8h";
          }
          start = moment
            .utc(moment().tz(tz).subtract(days, "days").startOf("day"))
            .format("YYYY-MM-DD HH:mm:ss");
          end = moment
            .utc(moment().tz(tz).subtract(1, "days").endOf("day"))
            .format("YYYY-MM-DD HH:mm:ss");
        }
      }

      const generic_query = `SELECT mean("bss") AS "mean_bss" FROM battery_data WHERE time > '${start}' AND time < '${end}' AND "device_id"='${req.query.device_id}' GROUP BY time(${group_interval}) FILL(0)`;

      try {
        const data = await helper.send_api_request({
          url: `http://${config.influx.host}:${config.influx.port}/query`,
          method: "get",
          params: {
            db: config.influx.name,
            q: req.query.sq ? req.query.sq : generic_query,
            epoch: "s",
            pretty: true,
          },
        });

        if (data.data.results && data.data.results[0].series)
          return apiResponse.success(res, req, data.data.results[0].series);
        else return apiResponse.fail(res, "No data found");
      } catch (err) {
        return apiResponse.fail(res, err);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.device_logs = (req, res) => {
  /**
   * @swagger
   *
   * /graph/device/{deviceId}/logs:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Device logs graph
   *     tags: [Graphs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: deviceId
   *         description: Device ID
   *         in: path
   *         required: true
   *         type: number
   *       - name: timezone
   *         description: User Local Timezone
   *         in: query
   *         required: true
   *         type: string
   *       - name: filter
   *         description: Filters can be today, yesterday, n(d) e.g 7d // Means last 7 days, and last one is date|date e.g 2019-12-20|2020-02-02
   *         in: query
   *         required: false
   *         type: string
   *       - name: type
   *         description: type can be heap, heaplow, heaplowota, rs_code, resetC, vbat. default type is heaplow
   *         in: query
   *         required: false
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.query, {
      timezone: "required",
      filter: "string",
      type: "string|in:heap,heaplow,heaplowota,rs_code,resetC,vbat",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const tz = req.query.timezone || moment.tz.guess();

      let start = moment
        .utc(moment().tz(tz).startOf("day"))
        .format("YYYY-MM-DD HH:mm:ss");
      let end = moment.utc(moment().tz(tz)).format("YYYY-MM-DD HH:mm:ss");
      let group_interval = "60m";
      let days = 1;

      if (req.query.filter) {
        const filter = req.query.filter;
        if (filter.indexOf("|") > -1) {
          // Range Case
          const range = filter.split("|");
          const sDate = moment(range[0]).tz(tz).startOf("day");
          const eDate = moment(range[1]).tz(tz).endOf("day");
          start = moment.utc(sDate).format("YYYY-MM-DD HH:mm:ss");
          end = moment.utc(eDate).format("YYYY-MM-DD HH:mm:ss");

          days = eDate.diff(sDate, "days");
          if (days > 3 && days <= 10) {
            group_interval = "2h";
          } else if (days > 10) {
            group_interval = "8h";
          }
        } else if (filter.indexOf("today") > -1) {
          // today case
          group_interval = "60m";
          start = moment
            .utc(moment().tz(tz).startOf("day"))
            .add(1, "s")
            .format("YYYY-MM-DD HH:mm:ss");
          end = moment
            .utc(moment().tz(tz).endOf("day"))
            .format("YYYY-MM-DD HH:mm:ss");
          days = 1;
        } else if (filter.indexOf("yesterday") > -1) {
          // yesterday case
          group_interval = "60m";
          start = moment
            .utc(moment().tz(tz).subtract(1, "days").startOf("day").add(1, "s"))
            .format("YYYY-MM-DD HH:mm:ss");
          end = moment
            .utc(moment().tz(tz).subtract(1, "days").endOf("day"))
            .format("YYYY-MM-DD HH:mm:ss");
          days = 1;
        } else if (filter.indexOf("d") > -1) {
          // Nth days case
          days = parseInt(filter.substring(-1));
          if (days > 3 && days <= 10) {
            group_interval = "2h";
          } else if (days > 10) {
            group_interval = "8h";
          }
          logger.info(group_interval);
          start = moment
            .utc(moment().tz(tz).subtract(days, "days").startOf("day"))
            .format("YYYY-MM-DD HH:mm:ss");
          end = moment
            .utc(moment().tz(tz).subtract(1, "days").endOf("day"))
            .format("YYYY-MM-DD HH:mm:ss");
        }
      }

      const DeviceMetadataModel = require("../../services/device_metadata");

      const type = req.query.type || "heap";
      const query = `select value,createdAt from Device_Metadata where device_id=${req.params.deviceId} and Device_Metadata.key='${type}' and createdAt > '${start}' and createdAt < '${end}' order by createdAt asc`;

      try {
        const result = await DeviceMetadataModel.cutom_query(query);
        const data = [];

        for (const index in result) {
          data.push([
            moment(result[index].createdAt).unix(),
            parseFloat(result[index].value),
          ]);
        }

        return apiResponse.success(res, req, {
          columns: ["time", "value"],
          values: data,
          name: "heaplow",
        });
      } catch (err) {
        return apiResponse.fail(res, err.message);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
