/* eslint-disable unused-imports/no-unused-vars */
const testHelper = require("../../../helper");
const helper = require("../../../../common/helper");
const { Device } = require("../../../../models");
const config = require("../../../../config/config");
const { products } = require("../../../../common/products");

describe("Offset Device Settings", () => {
  const endpoint = "device/set-device-setting/offset";
  const organization = 1;

  let tokens = null;
  let deviceId = null;

  const getSettingsRequestBody = (settingsPacket) => {
    return {
      endpoint,
      token: tokens.superadmin,
      params: {
        settings: JSON.stringify(settingsPacket),
        deviceId,
        organization,
      },
    };
  };

  beforeAll(async () => {
    tokens = await testHelper.get_all_roles_tokens();

    // Creating a device for testing
    const { body } = await testHelper.post_request_with_authorization({
      endpoint: "device/create",
      token: tokens.zongCustomer,
      params: {
        serial: "UHF-32EBF018801156000C701D0000E20034",
        device_type: products.kiosk.id,
        pin_code: 1111,
      },
    });
    deviceId = body.data.id;
  });

  describe("Success", () => {
    it("should send device offset settings to /d/<id>/gs/config/offset", async () => {
      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {
          expect(channel).toStrictEqual(`d/${deviceId}/gs/config/offset`);
          expect(retained).toEqual(false);
          expect(Object.keys(message)).toStrictEqual([
            "offset_pixels",
            "offset_direction",
          ]);
        },
      );

      const offsetSettingsPacket = {
        offset_pixels: 400,
        offset_direction: 4,
      };

      const requestBody = getSettingsRequestBody(offsetSettingsPacket);

      const { body } = await testHelper.post_request_with_authorization(
        requestBody,
      );

      expect(helper.mqtt_publish_message).toHaveBeenCalled();

      expect(body.success).toEqual(true);
      expect(body.data).toStrictEqual([1]);
    });
  });

  describe("Failure", () => {
    it("offset settings must not contain any other settings (/d/<id>/gs/config/offset)", async () => {
      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {},
      );

      expect(helper.mqtt_publish_message).not.toHaveBeenCalled();

      const invalidOffsetSettingsPacket = {
        offset_pixels: 400,
        offset_direction: 4,
        calibration_mode: 0,
        timezone_name: config.timeZone,
      };

      const requestBody = getSettingsRequestBody(invalidOffsetSettingsPacket);
      const res = await testHelper.post_request_with_authorization(requestBody);

      expect(res.status).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.data).toEqual(
        "Invalid Setting: offset setings can only contain: offset_pixels and offset_direction",
      );

      const invalidOffsetSettingsPacket2 = {
        offset_pixels: 400,
        calibration_mode: 0,
        timezone_name: config.timeZone,
      };

      const requestBody2 = getSettingsRequestBody(invalidOffsetSettingsPacket2);
      const res2 = await testHelper.post_request_with_authorization(
        requestBody2,
      );

      expect(res2.status).toEqual(400);
      expect(res2.body.success).toEqual(false);
      expect(res2.body.data).toEqual(
        "Invalid Setting: offset setings can only contain: offset_pixels and offset_direction",
      );
    });

    it("offset settings must contain must pixels and direction settings (/d/<id>/gs/config/offset)", async () => {
      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {},
      );

      expect(helper.mqtt_publish_message).not.toHaveBeenCalled();

      const invalidOffsetSettingsPacket1 = {
        offset_pixels: 400,
      };

      const requestBody = getSettingsRequestBody(invalidOffsetSettingsPacket1);
      const res = await testHelper.post_request_with_authorization(requestBody);

      expect(res.status).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.data).toEqual(
        "Invalid Setting: offset setings can only contain: offset_pixels and offset_direction",
      );

      const invalidOffsetSettingsPacket2 = {
        offset_direction: 4,
      };

      const requestBody1 = getSettingsRequestBody(invalidOffsetSettingsPacket2);
      const res1 = await testHelper.post_request_with_authorization(
        requestBody1,
      );

      expect(res1.status).toEqual(400);
      expect(res1.body.success).toEqual(false);
      expect(res1.body.data).toEqual(
        "Invalid Setting: offset setings can only contain: offset_pixels and offset_direction",
      );
    });

    it("should fail with status 400, if device not found in DB", async () => {
      const requestBody = getSettingsRequestBody({});
      requestBody.token = tokens.zongCustomer;
      requestBody.params.deviceId = 99;

      const res = await testHelper.post_request_with_authorization(requestBody);

      expect(res.status).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.data).toEqual("Invalid device serial");
    });

    it("should fail with status 403, if device bill is not cleared and user is not a super user", async () => {
      await Device.update({ bill_cleared: false }, { where: { id: deviceId } });

      const requestBody = getSettingsRequestBody({});
      requestBody.token = tokens.zongCustomer;

      const res = await testHelper.post_request_with_authorization(requestBody);

      expect(res.status).toEqual(403);
      expect(res.body.success).toEqual(false);
      expect(res.body.data).toEqual(
        "Bill not paid. Device is locked. You can't do this action.",
      );
    });
  });
});

describe("General Device Settings", () => {
  const endpoint = "device/set-device-setting";
  const organization = 1;

  let tokens = null;
  let deviceId = null;

  const getSettingsRequestBody = (settingsPacket) => {
    return {
      endpoint,
      token: tokens.superadmin,
      params: {
        settings: JSON.stringify(settingsPacket),
        deviceId,
        organization,
      },
    };
  };

  beforeAll(async () => {
    tokens = await testHelper.get_all_roles_tokens();

    // Creating a device for testing
    const { body } = await testHelper.post_request_with_authorization({
      endpoint: "device/create",
      token: tokens.zongCustomer,
      params: {
        serial: "UHF-32EBF018801156000C701D0000E20034",
        device_type: products.kiosk.id,
        pin_code: 1111,
      },
    });
    deviceId = body.data.id;
  });

  describe("Success", () => {
    it("should send device general settings to /d/<id>/gs/config", async () => {
      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {
          expect(channel).toStrictEqual(`d/${deviceId}/gs/config`);
          expect(retained).toEqual(true);
        },
      );

      const generalSettingsPacking = {
        calibration_mode: 0,
        timezone_name: config.timeZone,
        scale_factor: "5",
        timezone: null,
      };

      const requestBody = getSettingsRequestBody(generalSettingsPacking);

      const { body } = await testHelper.post_request_with_authorization(
        requestBody,
      );

      expect(helper.mqtt_publish_message).toHaveBeenCalled();

      expect(body.success).toEqual(true);
      expect(body.data).toStrictEqual([1]);
    });

    it("should delete offset settings from general setting payload (/d/<id>/gs/config)", async () => {
      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {
          expect(message.calibration_mode).toEqual(0);
          expect(Object.keys(message).length).toEqual(1);
        },
      );

      const generalSettingsPacket = {
        offset_pixels: 400,
        calibration_mode: 0,
      };

      const reqBody = getSettingsRequestBody(generalSettingsPacket);
      const res = await testHelper.post_request_with_authorization(reqBody);

      expect(helper.mqtt_publish_message).toHaveBeenCalled();

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data).toStrictEqual([1]);
    });
  });

  describe("Failure", () => {
    it("should fail with status 400, if no settings are specified (/d/<id>/gs/config)", async () => {
      helper.mqtt_publish_message = jest.fn(
        (channel, message, retained = true, qos = 1) => {},
      );

      expect(helper.mqtt_publish_message).not.toHaveBeenCalled();

      const invalidGeneralSettingsPacket1 = {
        offset_pixels: 400,
      };

      const requestBody = getSettingsRequestBody(invalidGeneralSettingsPacket1);
      const res = await testHelper.post_request_with_authorization(requestBody);

      expect(res.status).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.data).toEqual("Invalid Setting: no attributes were set");

      const invalidGeneralSettingsPacket2 = {
        offset_direction: 4,
      };

      const requestBody1 = getSettingsRequestBody(
        invalidGeneralSettingsPacket2,
      );
      const res1 = await testHelper.post_request_with_authorization(
        requestBody1,
      );

      expect(res1.status).toEqual(400);
      expect(res1.body.success).toEqual(false);
      expect(res1.body.data).toEqual("Invalid Setting: no attributes were set");

      const res2 = await testHelper.post_request_with_authorization(
        getSettingsRequestBody({}),
      );

      expect(res2.status).toEqual(400);
      expect(res2.body.success).toEqual(false);
      expect(res2.body.data).toEqual("Invalid Setting: no attributes were set");
    });

    it("should fail with status 400, if device not found in DB", async () => {
      const requestBody = getSettingsRequestBody({});
      requestBody.token = tokens.zongCustomer;
      requestBody.params.deviceId = 99;

      const res = await testHelper.post_request_with_authorization(requestBody);

      expect(res.status).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.data).toEqual("Invalid device serial");
    });

    it("should fail with status 403, if device bill is not cleared and user is not a super user", async () => {
      await Device.update({ bill_cleared: false }, { where: { id: deviceId } });

      const requestBody = getSettingsRequestBody({});
      requestBody.token = tokens.zongCustomer;

      const res = await testHelper.post_request_with_authorization(requestBody);

      expect(res.status).toEqual(403);
      expect(res.body.success).toEqual(false);
      expect(res.body.data).toEqual(
        "Bill not paid. Device is locked. You can't do this action.",
      );
    });
  });
});
