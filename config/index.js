require("dotenv").config();

module.exports = {
  influx: {
    dbHost: process.env.INFLUX_DB_HOST || "localhost",
    dbName: process.env.INFLUX_DB_NAME || "weather-station",
    dbPort: process.env.INFLUX_DB_PORT || 8086,
    dbToken:
      process.env.INFLUX_DB_TOKEN ||
      "Vw-EYGziiu7vHTdeLvipr2vtzdCxFQ2yS1ylpscrezARNslaPZ-YKsbM129KnFk0BiGqMd-f1CITSpKxPpUCeA==",
    dbOrganization: process.env.INFLUX_DB_ORG || "cowlar",
    userName: process.env.INFLUX_DB_USERNAME || "influxdb",
    password: process.env.INFLUX_DB_PASSWORD || "influxdb-pwd",
    precision: process.env.INFLUX_DB_PRECISION || "ms",
  },
};
