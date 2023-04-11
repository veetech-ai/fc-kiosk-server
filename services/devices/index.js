const moment = require("moment");

const config = require("../../config/config");
const helper = require("../../common/helper");

exports.setWindow = (start, end) => {
  const startTime = moment(start);
  const endTime = moment(end);
  let hours = 1;
  // const startTime = Number(moment(start).format('X'))
  // const endTime = Number(moment(end).format('X'))
  // const timeDifferenceHRS = (endTime - startTime) / 3600
  const timeDifferenceHRS = endTime.diff(startTime, "hours", true);
  if (timeDifferenceHRS >= 25) hours = 24;
  return `${hours}h`;
};

exports.calculateTimeBounds = ({
  filter,
  timeFormat = config.influxTimeFormat,
  timezone = config.timeZone,
}) => {
  const conditionalFilter = filter ? filter.toLowerCase().trim() : "";
  let start, end;
  switch (conditionalFilter) {
    case conditionalFilter.match(helper.dateRegex)?.input: {
      // start date to till date
      const startDate = filter;
      start = moment(startDate).tz(timezone).format(timeFormat);
      end = moment().tz(timezone).endOf("day").format(timeFormat);
      break;
    }

    case conditionalFilter.match(/^.*\|.*$/)?.input: {
      // Range Case
      const range = filter.split("|");
      start = moment(range[0]).tz(timezone).format(timeFormat);
      end = moment(range[1]).tz(timezone).format(timeFormat);
      break;
    }

    case "today": {
      // Today case
      start = moment().tz(timezone).startOf("day").format(timeFormat);
      end = moment().tz(timezone).endOf("day").format(timeFormat);
      break;
    }

    case "yesterday": {
      // Yesterday case
      start = moment()
        .tz(timezone)
        .subtract(1, "days")
        .startOf("day")
        .format(timeFormat);
      end = moment()
        .tz(timezone)
        .subtract(1, "days")
        .endOf("day")
        .format(timeFormat);
      break;
    }

    case conditionalFilter.match(/^[0-9]+d$/)?.input: {
      // Nth Day case
      let days = parseInt(filter);
      if (days > 1) days -= 1;
      start = moment()
        .tz(timezone)
        .subtract(parseInt(days), "days")
        .startOf("day")
        .format(timeFormat);
      end = moment().tz(timezone).endOf("day").format(timeFormat);
      break;
    }

    case conditionalFilter.match(/^[0-9]+m$/)?.input: {
      // Month's case
      const months = parseInt(filter);
      start = moment()
        .tz(timezone)
        .subtract(months, "months")
        .endOf("day")
        .format(timeFormat);
      end = moment().tz(timezone).endOf("day").format(timeFormat);
      break;
    }

    default: {
      throw {
        message: "Invalid time filter!",
      };
    }
  }
  const window = this.setWindow(start, end);
  return { start, end, window };
};

exports.isStartAndEndTimeSameDay = (
  startTime,
  endTime,
  timezone = config.timeZone,
) => {
  const offset = config.factoryFloorTimingOffset;
  const REFERENCE = moment(startTime)
    .tz(timezone)
    .subtract(offset, "hours")
    .subtract(1, "seconds");
  const startDate = REFERENCE.clone().startOf("day").add(offset, "hours");
  const endDate = REFERENCE.clone().endOf("day").add(offset, "hours");
  endTime = moment(endTime).tz(timezone);
  return moment(endTime).isBetween(startDate, endDate);
};
