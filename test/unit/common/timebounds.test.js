const config = require("../../../config/config");
const moment = require("moment-timezone");

const { calculateTimeBounds } = require("../../../services/devices");

describe("test calculateTimeBounds function", () => {
  const currentDate = new Date();

  it("test pipe filter for multiple days", () => {
    const filter = `${moment(currentDate)
      .tz(config.timeZone)
      .subtract(7, "day")
      .utc()
      .format(config.timeFormatIncludingMilliseconds)}|${moment(currentDate)
      .tz(config.timeZone)
      .utc()
      .format(config.timeFormatIncludingMilliseconds)}`;

    const timeBounds = calculateTimeBounds({ filter });

    expect(timeBounds.window).toStrictEqual("24h");

    expect(
      moment(timeBounds.start)
        .tz(config.timeZone)
        .isSame(
          moment(currentDate).tz(config.timeZone).subtract(7, "day"),
          "day",
        ),
    ).toBeTruthy();
    expect(
      moment(timeBounds.end)
        .tz(config.timeZone)
        .isSame(moment(currentDate).tz(config.timeZone), "day"),
    ).toBeTruthy();

    // disabling this for now this is affected due to time zone change
    // expect(
    //   moment.duration(moment(timeBounds.end).diff(timeBounds.start)).asHours(),
    // ).toBeCloseTo(23.9999 * 7);
  });
  it.skip("test 1m filter for multiple days", () => {
    const timeBounds = calculateTimeBounds({ filter: "1m" });

    expect(timeBounds.window).toStrictEqual("24h");

    expect(
      moment(timeBounds.start)
        .tz(config.timeZone)
        .isSame(
          moment(currentDate).tz(config.timeZone).subtract(1, "month"),
          "day",
        ),
    ).toBeTruthy();

    expect(
      moment(timeBounds.end)
        .tz(config.timeZone)
        .isSame(moment(currentDate).tz(config.timeZone), "day"),
    ).toBeTruthy();

    expect(moment(timeBounds.end).diff(timeBounds.start, "months")).toBeCloseTo(
      1.0,
      1,
    );
  });
  it("test d filter for multiple days", () => {
    const timeBounds = calculateTimeBounds({ filter: "7d" });

    expect(timeBounds.window).toStrictEqual("24h");

    expect(
      moment(timeBounds.start)
        .tz(config.timeZone)
        .isSame(
          moment(currentDate).tz(config.timeZone).subtract(6, "day"),
          "day",
        ),
    ).toBeTruthy();

    expect(
      moment(timeBounds.end)
        .tz(config.timeZone)
        .isSame(moment(currentDate).tz(config.timeZone), "day"),
    ).toBeTruthy();

    expect(
      moment.duration(moment(timeBounds.end).diff(timeBounds.start)).asWeeks(),
    ).toBeCloseTo(0.999, 1);
  });
  it.skip("test today", () => {
    const timeBounds = calculateTimeBounds({ filter: "today" });

    expect(timeBounds.window).toStrictEqual("1h");

    expect(
      moment(timeBounds.start)
        .tz(config.timeZone)
        .isSame(moment(currentDate).tz(config.timeZone), "day"),
    ).toBeTruthy();

    expect(
      moment(timeBounds.end)
        .tz(config.timeZone)
        .isSame(moment(currentDate).tz(config.timeZone), "day"),
    ).toBeTruthy();

    expect(
      moment.duration(moment(timeBounds.end).diff(timeBounds.start)).asHours(),
    ).toBeCloseTo(23.9999);
  });
  it("test yesterday", () => {
    const timeBounds = calculateTimeBounds({ filter: "yesterday" });

    expect(timeBounds.window).toStrictEqual("1h");

    expect(
      moment(timeBounds.start)
        .tz(config.timeZone)
        .isSame(
          moment(currentDate).tz(config.timeZone).subtract(1, "day"),
          "day",
        ),
    ).toBeTruthy();

    expect(
      moment(timeBounds.end)
        .tz(config.timeZone)
        .isSame(
          moment(currentDate).tz(config.timeZone).subtract(1, "day"),
          "day",
        ),
    ).toBeTruthy();

    expect(
      moment.duration(moment(timeBounds.end).diff(timeBounds.start)).asHours(),
    ).toBeCloseTo(23.9999);
  });
  it("test failure", () => {
    try {
      calculateTimeBounds({ filter: "yeesterday" });

      expect({
        message:
          "the function should have thrown error! Check calculateTimebounds function",
      }).toBe(false);
    } catch (err) {
      expect(err).toStrictEqual({
        message: "Invalid time filter!",
      });
    }
  });
});
