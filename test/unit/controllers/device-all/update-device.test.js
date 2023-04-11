const { uuid } = require("uuidv4");
const helper = require("../../../helper");
const { products } = require("../../../../common/products");

let tokens = null;
let deviceId;
const deviceName = uuid();
describe('Tests to update device name API URI: "/device/{id}/name"', () => {
  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
  });

  /**
   * Handle all the success scenarios of mentioned API
   */
  describe("Success Scenarios", () => {
    it("should create a new device under test organization", async () => {
      const response = await helper.post_request_with_authorization({
        endpoint: "device/create",
        token: tokens.superadmin,
        params: {
          serial: uuid(),
          pin_code: 1122,
          device_type: products.kiosk.id,
        },
      });
      deviceId = response.body.data.id;
      expect(response.body).toStrictEqual(expect.any(Object));
    });

    it("should update the device name if device name starts with an alphabet", async () => {
      /** As per true rule, the device name should not start with special char */
      const invalidNames = [
        "James's",
        "MY_name",
        "D-Scope",
        "PCT 1",
        "My Name",
      ];
      const data = {
        endpoint: `device/${deviceId}/name`,
        token: tokens.superadmin,
      };
      const promiseArray = [];
      invalidNames.forEach((dName) =>
        promiseArray.push(
          helper.put_request_with_authorization({
            ...data,
            params: { device_name: dName },
          }),
        ),
      );
      const response = await Promise.all(promiseArray);
      response.forEach((res) => {
        expect(res.statusCode).not.toBe(400);
        expect(res.statusCode.toString()).toMatch(/(200|409)/i);
      });
    });

    it("should update the device name if device name starts with a number", async () => {
      /** As per true rule, the device name should not start with special char */
      const invalidNames = [
        "1James's",
        "2MY_name",
        "0 D-Scope",
        "10PCT 1",
        "0900My Name",
      ];
      const data = {
        endpoint: `device/${deviceId}/name`,
        token: tokens.superadmin,
      };
      const promiseArray = [];
      invalidNames.forEach((dName) =>
        promiseArray.push(
          helper.put_request_with_authorization({
            ...data,
            params: { device_name: dName },
          }),
        ),
      );
      const response = await Promise.all(promiseArray);
      response.forEach((res) => {
        expect(res.statusCode).not.toBe(400);
        expect(res.statusCode.toString()).toMatch(/(200|409)/i);
      });
    });

    it("should update the device name if device name has special characters in between", async () => {
      /** As per true rule, the device name should not start with special char */
      const invalidNames = [
        "1James's",
        "2MY_name",
        "0 D-Scope",
        "10PCT~1",
        "0900My`Name",
        "My!Device",
        "My@Device",
        "My#Device",
        "My$Device",
        "My%Device",
        "My^Device",
        "My&Device",
        "My*Device",
        "My(Device",
        "My)Device",
        "My=Device",
        "My+Device",
      ];
      const data = {
        endpoint: `device/${deviceId}/name`,
        token: tokens.superadmin,
      };
      const promiseArray = [];
      invalidNames.forEach((dName) =>
        promiseArray.push(
          helper.put_request_with_authorization({
            ...data,
            params: { device_name: dName },
          }),
        ),
      );
      const response = await Promise.all(promiseArray);
      response.forEach((res) => {
        expect(res.statusCode).not.toBe(400);
        expect(res.statusCode.toString()).toMatch(/(200|409)/i);
      });
    });

    it("should update the device name if device name has special characters at the end", async () => {
      /** As per true rule, the device name should not start with special char */
      const invalidNames = [
        "1James's]",
        "2MY_name[",
        "0 D-Scope}",
        "10PCT~1{",
        "0900My`Name=",
        "My!Device+",
        "My@Device-",
        "My#Device_",
        "My$Device)",
        "My%Device(",
        "My^Device*",
        "My&Device&",
        "My*Device^",
        "My(Device%",
        "My)Device$",
        "My=Device#",
        "My+Device@",
        "My+Device!",
        "My+Device`",
        "My+Device~",
      ];
      const data = {
        endpoint: `device/${deviceId}/name`,
        token: tokens.superadmin,
      };
      const promiseArray = [];
      invalidNames.forEach((dName) =>
        promiseArray.push(
          helper.put_request_with_authorization({
            ...data,
            params: { device_name: dName },
          }),
        ),
      );
      const response = await Promise.all(promiseArray);
      response.forEach((res) => {
        expect(res.statusCode).not.toBe(400);
        expect(res.statusCode.toString()).toMatch(/(200|409)/i);
      });
    });

    it("should update the device name if device name ends with a number", async () => {
      /** As per true rule, the device name should not start with special char */
      const invalidNames = [
        "1James's1",
        "2MY_name2",
        "0 D-Scope3",
        "10PCT 14",
        "0900My Name5",
      ];
      const data = {
        endpoint: `device/${deviceId}/name`,
        token: tokens.superadmin,
      };
      const promiseArray = [];
      invalidNames.forEach((dName) =>
        promiseArray.push(
          helper.put_request_with_authorization({
            ...data,
            params: { device_name: dName },
          }),
        ),
      );
      const response = await Promise.all(promiseArray);
      response.forEach((res) => {
        expect(res.statusCode).not.toBe(400);
        expect(res.statusCode.toString()).toMatch(/(200|409)/i);
      });
    });
  });

  /**
   * Handle All error cases for above mentioned API
   */
  describe("Failure Scenarios", () => {
    /**
     * Handle all role based failure cases
     */
    describe("Role access denied", () => {
      it("should not allow an operator to update the name of device if user don't have rights", async () => {
        const data = {
          endpoint: "device/129/name",
          token: tokens.testOperator,
          params: { device_name: "abc" },
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.body).toStrictEqual({
          success: false,
          data: "You are not allowed",
        });
      });
    });

    describe("Data duplication and data validations", () => {
      it("should not update the device if device with same name exist in mentioned organization", async () => {
        const data = {
          endpoint: `device/${deviceId}/name`,
          token: tokens.superadmin,
          params: { device_name: deviceName },
        };
        let response = await helper.put_request_with_authorization(data);
        expect(response.body.success).toBeTruthy();
        expect(response.statusCode).toBe(200);

        response = await helper.put_request_with_authorization(data);
        expect(response.body.success).toBe(false);
        expect(response.statusCode).toBe(409);
      });

      it("should not update the device name if device name starts with a special character", async () => {
        /** As per true rule, the device name should not start with special char */
        const invalidNames = ["-James's", "++MY_name", "-DScope", "#/PCT"];
        const data = {
          endpoint: `device/${deviceId}/name`,
          token: tokens.superadmin,
        };
        const promiseArray = [];
        invalidNames.forEach((dName) =>
          promiseArray.push(
            helper.put_request_with_authorization({
              ...data,
              params: { device_name: dName },
            }),
          ),
        );
        const response = await Promise.all(promiseArray);
        response.forEach((res) => {
          expect(res.body.success).toBe(false);
          expect(res.statusCode).toBe(400);
        });
      });
    });
  });
});
