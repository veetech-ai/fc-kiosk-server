const mqtt = require("../../../controllers/mqtt/mqtt");
const { setInfluxData } = require("../../../controllers/mqtt/mqtt");
const { insertInfluxData } = require("../../../common/helper");
const {
  influxSchemaPeopleMetrics,
} = require("../../../common/influxSchemas/people-metrics.json");

jest.mock("../../../common/helper", () => ({
  ...jest.requireActual("../../../common/helper"),
  insertInfluxData: jest.fn(),
}));

describe.skip("set Influx data", () => {
  beforeAll(() => {
    jest.spyOn(mqtt, "updateScreenBasedOnUserId").mockImplementation(
      jest.fn(() => {
        return Promise.resolve();
      }),
    );

    jest.spyOn(mqtt, "updateScreenBasedOnDeviceId").mockImplementation(
      jest.fn(() => {
        return Promise.resolve();
      }),
    );
  });
  describe("when insertInfluxData returns true", () => {
    beforeAll(() => {
      insertInfluxData.mockImplementation(() => true);
    });

    it("updates if actions has userId", async () => {
      const action = {
        ts: 1645106445,
        drowsiness: 0.32596662640571594,
        distraction: 0.3179830312728882,
        presence: 1,
        userIdentification: "unknown",
        userId: "315",
      };
      const schema = influxSchemaPeopleMetrics;

      await setInfluxData(action, schema);
      expect(mqtt.updateScreenBasedOnUserId).toHaveBeenCalled();
    });

    it("updates if actions has deviceId", async () => {
      const action = {
        ts: 1645106445,
        drowsiness: 0.32596662640571594,
        distraction: 0.3179830312728882,
        presence: 1,
        userIdentification: "unknown",
        deviceId: 14,
      };
      const schema = influxSchemaPeopleMetrics;

      await setInfluxData(action, schema);
      expect(mqtt.updateScreenBasedOnDeviceId).toHaveBeenCalled();
    });

    it("updates if actions has both userId and deviceId", async () => {
      const action = {
        ts: 1645106445,
        drowsiness: 0.32596662640571594,
        distraction: 0.3179830312728882,
        presence: 1,
        userIdentification: "unknown",
        deviceId: 14,
        userId: "315",
      };
      const schema = influxSchemaPeopleMetrics;

      await setInfluxData(action, schema);
      expect(mqtt.updateScreenBasedOnUserId).toHaveBeenCalled();
    });

    it("will not updates if actions contains not userId nor deviceId", async () => {
      const action = {
        ts: 1645106445,
        drowsiness: 0.32596662640571594,
        distraction: 0.3179830312728882,
        presence: 1,
        userIdentification: "unknown",
      };
      const schema = influxSchemaPeopleMetrics;

      await setInfluxData(action, schema);
      expect(mqtt.updateScreenBasedOnUserId).not.toHaveBeenCalled();
      expect(mqtt.updateScreenBasedOnDeviceId).not.toHaveBeenCalled();
    });
  });

  describe("when insertInfluxData returns false", () => {
    beforeAll(() => {
      insertInfluxData.mockImplementation(() => false);
    });
    it("will not update", async () => {
      const action = {
        ts: 1645106445,
        drowsiness: 0.32596662640571594,
        distraction: 0.3179830312728882,
        presence: 1,
        userIdentification: "unknown",
        deviceId: 14,
        userId: "315",
      };
      const schema = influxSchemaPeopleMetrics;

      await setInfluxData(action, schema);
      expect(mqtt.updateScreenBasedOnUserId).not.toHaveBeenCalled();
      expect(mqtt.updateScreenBasedOnDeviceId).not.toHaveBeenCalled();
    });
  });
});
