const { filterRegex } = require("../../../common/helper");

describe("testing time range", () => {
  it('should return error with invalid time range, milliseconds not provided, though "." is used', () => {
    const timeRange = "2022-07-19T12:45:04.Z|2022-07-20T12:45:04.Z";
    expect(filterRegex.test(timeRange)).toStrictEqual(false);
  });

  it('should return error with invalid time range, milliseconds not provided, though "." is used for start time', () => {
    const timeRange = "2022-07-19T12:45:04.Z|2022-07-20T12:45:04.111Z";
    expect(filterRegex.test(timeRange)).toStrictEqual(false);
  });

  it('should return error if "." is used multiple times', () => {
    const timeRange = "2022-07-19T12:45:04.111.123Z|2022-07-20T12:45:04.111Z";
    expect(filterRegex.test(timeRange)).toStrictEqual(false);
  });

  it("should valid successfully in case of valid format for milliseconds for both start and end time", () => {
    const timeRange = "2022-07-19T12:45:04.112Z|2022-07-20T12:45:04.111Z";
    expect(filterRegex.test(timeRange)).toStrictEqual(true);
  });

  it("should valid successfully with no milliseconds", () => {
    const timeRange = "2022-07-19T12:45:04Z|2022-07-20T12:45:04Z";
    expect(filterRegex.test(timeRange)).toStrictEqual(true);
  });

  it("should valid successfully with only end time in milliseconds", () => {
    const timeRange = "2022-07-19T12:45:04Z|2022-07-20T12:45:04.111Z";
    expect(filterRegex.test(timeRange)).toStrictEqual(true);
  });

  it('should valid successfully for "today", "yesterday" or "<integer>d"', () => {
    let filter = "today";
    expect(filterRegex.test(filter)).toStrictEqual(true);
    filter = "yesterday";
    expect(filterRegex.test(filter)).toStrictEqual(true);
    filter = "7d";
    expect(filterRegex.test(filter)).toStrictEqual(true);
  });
});
