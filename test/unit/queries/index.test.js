const config = require("../../../config/config");
const moment = require("moment-timezone");

const {
  setWindow,
  isStartAndEndTimeSameDay,
} = require("../../../services/devices");
const timeZone = config.timeZone;
describe("testing set window functionality", () => {
  it("should create time window of 24 hrs successfully", () => {
    const start = moment()
      .tz(timeZone)
      .subtract(2, "days")
      .startOf("day")
      .format(config.influxTimeFormat);
    const end = moment().tz(timeZone).format(config.influxTimeFormat);
    const timeDifferenceInHrs = setWindow(start, end);
    expect(timeDifferenceInHrs).toBe("24h");
  });
  it("should create time window of 1 hr successfully", () => {
    const start = moment()
      .tz(timeZone)
      .startOf("day")
      .format(config.influxTimeFormat);
    const end = moment()
      .tz(timeZone)
      .endOf("day")
      .format(config.influxTimeFormat);
    const timeDifferenceInHrs = setWindow(start, end);
    expect(timeDifferenceInHrs).toBe("1h");
  });
});

describe("testing isStartAndEndTimeSameDay  functionality", () => {
  it("should return true when new packet arrives at 00.00 of next day", () => {
    const newPacketTimeStamp = moment()
      .tz(config.timeZone)
      .startOf("day")
      .utc()
      .format(); // 00:00 according to America/Chicago
    const previousPacketTimeStamp = moment()
      .tz(config.timeZone)
      .startOf("day")
      .subtract(1, "day")
      .add(15, "hours")
      .utc()
      .format(); // 15:00 according to America/Chicago
    const isSameDay = isStartAndEndTimeSameDay(
      newPacketTimeStamp,
      previousPacketTimeStamp,
    );
    expect(isSameDay).toBe(true);
  });
  it("should return true when new packet arrives at 00:30 of next day", () => {
    const newPacketTimeStamp = moment()
      .tz(config.timeZone)
      .startOf("day")
      .add(30, "minutes")
      .utc()
      .format(); // 00:30 according to America/Chicago
    const previousPacketTimeStamp = moment()
      .tz(config.timeZone)
      .startOf("day")
      .subtract(1, "day")
      .add(15, "hours")
      .utc()
      .format(); // 15:00 according to America/Chicago
    const isSameDay = isStartAndEndTimeSameDay(
      newPacketTimeStamp,
      previousPacketTimeStamp,
    );
    expect(isSameDay).toBe(true);
  });
  it("should return true when new packet arrives at any time on same day", () => {
    const newPacketTimeStamp = moment()
      .tz(config.timeZone)
      .startOf("day")
      .add(10, "hours")
      .utc()
      .format(); // 10:00 according to America/Chicago
    const previousPacketTimeStamp = moment()
      .tz(config.timeZone)
      .startOf("day")
      .add(9, "hours")
      .utc()
      .format(); // 9:00 according to America/Chicago
    const isSameDay = isStartAndEndTimeSameDay(
      newPacketTimeStamp,
      previousPacketTimeStamp,
    );
    expect(isSameDay).toBe(true);
  });
  it("should return false when new packet arrives on next day after 1:00", () => {
    const newPacketTimeStamp = moment()
      .tz(config.timeZone)
      .startOf("day")
      .add(10, "hours")
      .utc()
      .format(); // 10:00 according to America/Chicago
    const previousPacketTimeStamp = moment()
      .tz(config.timeZone)
      .startOf("day")
      .subtract(1, "day")
      .add(21, "hours")
      .utc()
      .format(); // 21:00 previous day according to America/Chicago
    const isSameDay = isStartAndEndTimeSameDay(
      newPacketTimeStamp,
      previousPacketTimeStamp,
    );
    expect(isSameDay).toBe(false);
  });
  it("should return true when new packet arrives at 1:00", () => {
    const newPacketTimeStamp =
      moment().tz(config.timeZone).startOf("day").valueOf() + 60 * 60 * 1000; // 01:00 according to America/Chicago
    const previousPacketTimeStamp =
      moment().tz(config.timeZone).startOf("day").valueOf() + 30 * 60 * 1000; // 12:30 previous day according to America/Chicago
    const isSameDay = isStartAndEndTimeSameDay(
      newPacketTimeStamp,
      previousPacketTimeStamp,
    );
    expect(isSameDay).toBe(true);
  });
  it("should return false when new packet arrives at 1:01 and previous at 1:00", () => {
    const newPacketTimeStamp = moment()
      .tz(config.timeZone)
      .endOf("day")
      .add(1, "hours")
      .add(2, "minutes")
      .utc()
      .format(); // 01:01 according to America/Chicago
    const previousPacketTimeStamp =
      moment().tz(config.timeZone).startOf("day").valueOf() + 60 * 60 * 1000; // 01:00 according to America/Chicago
    const isSameDay = isStartAndEndTimeSameDay(
      newPacketTimeStamp,
      previousPacketTimeStamp,
    );
    expect(isSameDay).toBe(false);
  });
  // tests for different time zone
  it("should return false when new packet arrives on next day after 1:00 with different TimeZone", () => {
    const timeZone = "Asia/Karachi";
    const newPacketTimeStamp = moment()
      .tz("Asia/Karachi")
      .startOf("day")
      .add(10, "hours")
      .utc()
      .format(); // 10:00 according to 'Asia/Karachi'
    const previousPacketTimeStamp = moment()
      .tz("Asia/Karachi")
      .startOf("day")
      .subtract(1, "day")
      .add(22, "hours")
      .utc()
      .format(); // 22:00 previous day according to 'Asia/Karachi'
    const isSameDay = isStartAndEndTimeSameDay(
      newPacketTimeStamp,
      previousPacketTimeStamp,
      timeZone,
    );
    expect(isSameDay).toBe(false);
  });
  it("should return true when new packet arrives at any time on same day with different TimeZone", () => {
    const timeZone = "Asia/Karachi";
    const newPacketTimeStamp = moment()
      .tz("Asia/Karachi")
      .startOf("day")
      .add(10, "hours")
      .utc()
      .format(); // 10:00 according to 'Asia/Karachi'
    const previousPacketTimeStamp = moment()
      .tz("Asia/Karachi")
      .startOf("day")
      .add(14, "hours")
      .utc()
      .format(); // 2:00 PM  according to 'Asia/Karachi'
    const isSameDay = isStartAndEndTimeSameDay(
      newPacketTimeStamp,
      previousPacketTimeStamp,
      timeZone,
    );
    expect(isSameDay).toBe(true);
  });
});
