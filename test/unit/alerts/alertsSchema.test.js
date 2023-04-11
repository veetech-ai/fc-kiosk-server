const helper = require("../../../common/helper");
const helperTest = require("../../helper");
const { uuid } = require("uuidv4");
const DeviceDiagnosticsModel = require("../../../services/device_diagnostics");
const DeviceModel = require("../../../services/device");

const moment = require("moment");
const {
  transformPowerCableTesterAlerts,
  setAlerts,
} = require("../../../controllers/mqtt/helper");
const { products } = require("../../../common/products");

// helper.mqtt_publish_message = jest.fn((channel, message, retained = true, qos = 1) => { return { channel, message, retained, qos } })
helper.set_mqtt_connection_lost_log = jest.fn();

describe("getAlertsCategoriesAndIndications helper function test", () => {
  let admin_token, device;
  beforeAll(async () => {
    admin_token = await helperTest.get_token_for("admin");

    const resp = await helperTest.post_request_with_authorization({
      endpoint: "device/create",
      token: admin_token,
      params: {
        device_type: products.kiosk.id,
        serial: uuid(),
        pin_code: "1111",
      },
    });
    device = resp.body.data;
    device.id = String(device.id);
    global.mqtt_connection_ok = true;
  });
  describe("Fiber Aligner Alert indication on MQTT", () => {
    it("should publish fdiagnos message on mqtt when error is raised ", async () => {
      const raiseAlarm = [0x5c, 0xca, 0x92, 0xd0, 0x7f, 0x01, 0x00, 0x00, 0x00];
      // const raisAlarmobject = {
      //   errorCode: 0,
      //   tsm: 1648471755356
      // }
      const transformedAlertsData = transformPowerCableTesterAlerts(raiseAlarm);
      transformedAlertsData.deviceId = device.id;

      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {
          expect(channel).toStrictEqual(`d/${device.id}/fdiagnos`);
          expect(message.ind).toStrictEqual({
            fi: true,
            wi: false,
            ii: false,
          });
          expect(retained).toStrictEqual(false);
          expect(qos).toStrictEqual(1);
        },
      );

      await setAlerts(device.id, transformedAlertsData, 1);
    });
    it("should publish fdiagnos message on mqtt when error is cleared ", async () => {
      const raiseAlarm = [0x5c, 0xaa, 0xa2, 0xd0, 0x7f, 0x01, 0x00, 0x00, 0x00];
      // const raisAlarmobject = {
      //   errorCode: 0,
      //   tsm: 1648472795740
      // }
      const transformedAlertsData = transformPowerCableTesterAlerts(raiseAlarm);
      transformedAlertsData.deviceId = device.id;

      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {
          expect(channel).toStrictEqual(`d/${device.id}/fdiagnos`);
          expect(message.ind).toStrictEqual({
            fi: false,
            wi: false,
            ii: false,
          });
          expect(retained).toStrictEqual(false);
          expect(qos).toStrictEqual(1);
        },
      );

      await setAlerts(device.id, transformedAlertsData, 0);
    });
  });

  describe("Power cable tester alert indication", () => {
    beforeAll(async () => {
      helper.mqtt_publish_message = jest.fn();
      global.mqtt_connection_ok = true;
    });

    it("should raise the alert indications", async () => {
      const alertsData =
        helper.schemasPerDeviceType[device.device_type].alertsData;

      const indications = await helper.set_indicator(
        device.id,
        { noCharging: true },
        alertsData,
      );
      const expectedIndicationsResponse = {
        fi: true,
        ii: false,
        wi: false,
      };

      expect(indications).toStrictEqual(expectedIndicationsResponse);
      const deviceData = await DeviceModel.findById(device.id);
      const indicationsFromDatabase = {
        fi: deviceData.fi,
        wi: deviceData.wi,
        ii: deviceData.ii,
      };
      expect(indicationsFromDatabase).toStrictEqual(
        expectedIndicationsResponse,
      );
    });
    it("should clear the alert indications", async () => {
      const alertsData =
        helper.schemasPerDeviceType[device.device_type].alertsData;

      const indications = await helper.set_indicator(
        device.id,
        { noCharging: false },
        alertsData,
      );
      const expectedIndicationsResponse = {
        fi: false,
        ii: false,
        wi: false,
      };
      expect(indications).toStrictEqual(expectedIndicationsResponse);

      const deviceData = await DeviceModel.findById(device.id);
      const indicationsFromDatabase = {
        fi: deviceData.fi,
        wi: deviceData.wi,
        ii: deviceData.ii,
      };

      expect(indicationsFromDatabase).toStrictEqual(
        expectedIndicationsResponse,
      );
    });
    it("should save the alert on alarm raise", async () => {
      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {},
      );

      const alertsSchema =
        helper.schemasPerDeviceType[device.device_type].alertsSchema;
      const alertsData =
        helper.schemasPerDeviceType[device.device_type].alertsData;
      const timestamp1 = Date.now();
      let alerts = await DeviceDiagnosticsModel.save_diagnostics({
        deviceId: device.id,
        alerts: { noCharging: true },
        timestamp: timestamp1,
        alertsSchema,
        alertsData,
      });
      expect(alerts.noCharging).toStrictEqual(true);
      expect(moment(alerts.noChargingUpdatedAt).valueOf()).toStrictEqual(
        timestamp1,
      );

      const timestamp2 = Date.now();
      alerts = await DeviceDiagnosticsModel.save_diagnostics({
        deviceId: device.id,
        alerts: { noCharging: false },
        timestamp: timestamp2,
        alertsSchema,
        alertsData,
      });
      expect(alerts.noCharging).toStrictEqual(false);
      expect(moment(alerts.noChargingUpdatedAt).valueOf()).toStrictEqual(
        timestamp2,
      );
    });
    it("should return Data already up to date if old timestamp is used to update the diagnostic", async () => {
      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {},
      );

      const alertsSchema =
        helper.schemasPerDeviceType[device.device_type].alertsSchema;
      const alertsData =
        helper.schemasPerDeviceType[device.device_type].alertsData;
      const timestamp1 = Date.now();

      await DeviceDiagnosticsModel.save_diagnostics({
        deviceId: device.id,
        alerts: { noCharging: true },
        timestamp: timestamp1,
        alertsSchema,
        alertsData,
      });
      const alertsResponse = await DeviceDiagnosticsModel.save_diagnostics({
        deviceId: device.id,
        alerts: { noCharging: false },
        timestamp: timestamp1 - 1,
        alertsSchema,
        alertsData,
      });
      expect(alertsResponse).toStrictEqual("Data already update to date");
    });
    it("should return Data already up to date if same time stamp with same data is used", async () => {
      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {},
      );

      const alertsSchema =
        helper.schemasPerDeviceType[device.device_type].alertsSchema;
      const alertsData =
        helper.schemasPerDeviceType[device.device_type].alertsData;
      const timestamp1 = Date.now();

      await DeviceDiagnosticsModel.save_diagnostics({
        deviceId: device.id,
        alerts: { noCharging: true },
        timestamp: timestamp1,
        alertsSchema,
        alertsData,
      });
      const alertsResponse = await DeviceDiagnosticsModel.save_diagnostics({
        deviceId: device.id,
        alerts: { noCharging: true },
        timestamp: timestamp1,
        alertsSchema,
        alertsData,
      });
      expect(alertsResponse).toStrictEqual("Data already update to date");
    });
  });
});
