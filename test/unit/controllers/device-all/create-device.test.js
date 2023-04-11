const { uuid } = require("uuidv4");
const helper = require("../../../helper");

const jwt = require("jsonwebtoken");
const config = require("../../../../config/config");

const { logger } = require("../../../../logger");
const { products } = require("../../../../common/products");

let tokens = null;
let stationId = null;
describe("test /device/create api", () => {
  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
  });

  describe("error", () => {
    describe("role access denied", () => {
      it("should not allow an operator to create the device", async () => {
        const bodyData = {
          serial: uuid(),
          pin_code: 1111,
          device_type: products.kiosk.id,
        };
        const data = {
          endpoint: "device/create",
          token: tokens.testOperator,
          params: bodyData,
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toStrictEqual({
          success: false,
          data: "You are not allowed",
        });
      });
    });
    describe("api internal errors", () => {
      it("should return error if invalid device type is sent to create the device", async () => {
        const bodyData = {
          serial: uuid(),
          pin_code: 1111,
          device_type: -1,
        };
        const data = {
          endpoint: "device/create",
          token: tokens.testCustomer,
          params: bodyData,
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toStrictEqual({
          success: false,
          data: "Device type not found",
        });
      });
    });
  });

  describe("success", () => {
    it("should create device under logged in user's organization and return device data if the serial does not exist and logged in user is the customer", async () => {
      const serial = uuid();
      const bodyData = {
        serial: serial,
        pin_code: 1111,
        device_type: products.kiosk.id,
        hw_ver: "IA2.1",
      };
      const data = {
        endpoint: "device/create",
        token: tokens.zongCustomer,
        params: bodyData,
      };
      const response = await helper.post_request_with_authorization(data);
      expect(response.body.success).toBe(true);
      expect(response.body.data.serial).toBe(serial);
    });

    it("should create device and org id is customer orgId", async () => {
      const serial = uuid();
      const bodyData = {
        serial: serial,
        pin_code: 1111,
        device_type: products.kiosk.id,
        hw_ver: "IA2.1",
      };
      const data = {
        endpoint: "device/create",
        token: tokens.zongCustomer,
        params: bodyData,
      };
      const response = await helper.post_request_with_authorization(data);

      const res = await helper.get_request_with_authorization({
        endpoint: `device/${response.body.data.id}`,
        token: tokens.admin,
      });
      const zongOrgId = jwt.verify(tokens.zongCustomer, config.jwt.secret);
      const orgId = res.body.data.orgId;
      expect(zongOrgId.orgId).toBe(orgId);
      expect(res.body.data.Device.hw_ver).toBe("IA2.1");
      expect(res.body.data.Device.device_type).toBe(bodyData.device_type);
      expect(res.body.data.Device.pin_code).toBe("1111");
    });

    it("should create device and org id is test account orgId if admin or superadmin", async () => {
      const serial = uuid();
      const bodyData = {
        serial: serial,
        pin_code: 1111,
        device_type: products.kiosk.id,
      };
      const data = {
        endpoint: "device/create",
        token: tokens.admin,
        params: bodyData,
      };
      const response = await helper.post_request_with_authorization(data);

      const res = await helper.get_request_with_authorization({
        endpoint: `device/${response.body.data.id}`,
        token: tokens.admin,
      });
      const testOrgId = jwt.decode(tokens.testCustomer);
      const orgId = res.body.data.orgId;
      expect(testOrgId.orgId).toBe(orgId);
    });

    it("should create device Stationary Beacon Device", async () => {
      const serial = uuid();
      const bodyData = {
        serial: serial,
        pin_code: 1111,
        device_type: products.kiosk.id,
      };
      const data = {
        endpoint: "device/create",
        token: tokens.admin,
        params: bodyData,
      };
      const response = await helper.post_request_with_authorization(data);
      stationId = response.body.data.id;

      const res = await helper.get_request_with_authorization({
        endpoint: `device/${response.body.data.id}`,
        token: tokens.admin,
      });
      expect(res.body.success).toBe(true);
      const type = res.body.data.Device.device_type;

      logger.info(`type: ${type}`);

      expect(type).toBe(bodyData.device_type);
    });
    it("should create device Mobile Beacon Device", async () => {
      const serial = uuid();
      const bodyData = {
        serial: serial,
        pin_code: 1111,
        device_type: products.kiosk.id,
      };
      const data = {
        endpoint: "device/create",
        token: tokens.admin,
        params: bodyData,
      };
      const response = await helper.post_request_with_authorization(data);

      const res = await helper.get_request_with_authorization({
        endpoint: `device/${response.body.data.id}`,
        token: tokens.admin,
      });
      expect(res.body.success).toBe(true);
      const type = res.body.data.Device.device_type;
      logger.info(`type: ${type}`);
      expect(type).toBe(bodyData.device_type);
    });
  });
});
