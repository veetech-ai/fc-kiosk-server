const { uuid } = require("uuidv4");
const helper = require("../../../helper");
const jwt = require("jsonwebtoken");
const config = require("../../../../config/config");
const { get_where } = require("../../../../services/user");
const { logger } = require("../../../../logger");
const { products } = require("../../../../common/products");

let tokens;
const users = {};
let devices = [];
let operatorUser;

async function createNewDevices(token) {
  const devicesData = [
    {
      device_type: products.kiosk.id,
      serial: uuid(),
      pin_code: "1111",
    },
    {
      device_type: products.kiosk.id,
      serial: uuid(),
      pin_code: "1111",
    },
  ];
  const data = {
    endpoint: "device/create",
    token,
  };
  const devices = [];
  for await (const value of Object.values(devicesData)) {
    data.params = value;
    const device = await helper.post_request_with_authorization(data);
    devices.push(device.body.data);
    //  devices.dScope = device.body.data
    // if (device.body.data.device_type === 23)
  }
  return devices;
}

beforeAll(async () => {
  tokens = await helper.get_all_roles_tokens();
  users.testCustomer = jwt.verify(tokens.testCustomer, config.jwt.secret);
  users.superadmin = jwt.verify(tokens.superadmin, config.jwt.secret);
  users.admin = jwt.verify(tokens.admin, config.jwt.secret);
  users.zongCustomer = jwt.verify(tokens.zongCustomer, config.jwt.secret);
  users.testOperator = jwt.verify(tokens.testOperator, config.jwt.secret);
  // users.operator = jwt.verify(tokens.operator, config.jwt.secret);
  devices = await createNewDevices(tokens.superadmin);

  operatorUser = await get_where({
    email: "testoperator.viaphoton@cowlar.com",
  });
});

describe("Update User Card Serial /user/card/{userId}/{cardSerial}", () => {
  describe("Success", () => {
    it("update the card serial if user is trying to update his own serial", async () => {
      try {
        const user = {
          cardSerial: "22222222",
          userId: 1,
        };
        const response = await helper.put_request_with_authorization({
          endpoint: `user/card/${user.userId}/${user.cardSerial}`,
          token: tokens.testCustomer,
        });
        expect(response.body).toEqual({
          success: true,
          data: "User card Serial updated successfully",
        });
        expect(response.statusCode).toEqual(200);
        const updatedUser = await get_where({ id: user.userId });
        expect(updatedUser[0].cardSerial).toStrictEqual(user.cardSerial);
      } catch (error) {
        logger.error(error);
      }
    });
    it("update the card serial if non admin user is trying to update serial of another user of his own organization", async () => {
      try {
        const user = {
          cardSerial: "111111111",
          userId: users.testOperator.id,
        };
        const response = await helper.put_request_with_authorization({
          endpoint: `user/card/${user.userId}/${user.cardSerial}`,
          token: tokens.testCustomer,
        });
        expect(response.body).toEqual({
          success: true,
          data: "User card Serial updated successfully",
        });
        expect(response.statusCode).toEqual(200);
        const updatedUser = await get_where({ id: user.userId });
        expect(updatedUser[0].cardSerial).toStrictEqual(user.cardSerial);
      } catch (error) {
        logger.error(error);
      }
    });
    it("update the card serial if admin is trying to update serial of user of another organization", async () => {
      try {
        const user = {
          cardSerial: "111111111",
          userId: users.testCustomer.id,
          deviceId: devices[0].id,
        };
        const response = await helper.put_request_with_authorization({
          endpoint: `user/card/${user.userId}/${user.cardSerial}`,
          token: tokens.admin,
          params: {
            deviceId: user.deviceId,
          },
        });
        expect(response.body).toEqual({
          success: true,
          data: "User card Serial updated successfully",
        });
        expect(response.statusCode).toEqual(200);
        const updatedUser = await get_where({ id: user.userId });
        expect(updatedUser[0].cardSerial).toStrictEqual(user.cardSerial);
      } catch (error) {
        logger.error(error);
      }
    });
  });
  describe("Failure", () => {
    it("should return 401 without authorization token", async () => {
      try {
        const cardSerial = "0000000000";
        const response = await helper.put_request({
          endpoint: `user/card/${users.testCustomer}/${cardSerial}`,
        });
        expect(response.body).toEqual({
          success: false,
          data: "Token not provided",
        });
        expect(response.statusCode).toEqual(401);
      } catch (error) {
        logger.error(error);
      }
    });
    it("should fail if no user found", async () => {
      try {
        const user = {
          cardSerial: "0000000000",
          userId: 2323232,
          deviceId: devices[0].id,
        };
        const response = await helper.put_request_with_authorization({
          endpoint: `user/card/${user.userId}/${user.cardSerial}`,
          token: tokens.testCustomer,
          params: {
            deviceId: user.deviceId,
          },
        });

        expect(response.body).toStrictEqual({
          success: false,
          data: "User not found",
        });
        expect(response.statusCode).toEqual(404);
      } catch (error) {
        logger.error(error);
      }
    });
    it("should not update the user of other organizattion non admin user is trying to update card serial of others organization user", async () => {
      try {
        const user = {
          cardSerial: "0000000000",
          userId: 2032,
        };
        const response = await helper.put_request_with_authorization({
          endpoint: `user/card/${user.userId}/${user.cardSerial}`,
          token: tokens.zongCustomer,
        });
        expect(response.body).toEqual({
          success: false,
          data: "User not found",
        });
        expect(response.statusCode).toEqual(404);
      } catch (error) {
        logger.error(error);
      }
    });
    it("should fail if operator is trying to update his own serial ", async () => {
      try {
        const user = {
          cardSerial: "0000000000",
          userId: users.testOperator.id,
        };
        const response = await helper.put_request_with_authorization({
          endpoint: `user/card/${user.userId}/${user.cardSerial}`,
          token: tokens.testOperator,
        });
        expect(response.body).toEqual({
          success: false,
          data: "You are not allowed",
        });
        expect(response.statusCode).toEqual(403);
      } catch (error) {
        logger.error(error);
      }
    });
    describe("fails if updating card serial of user having '3' status", () => {
      it("should fail if super admin is trying to update the serial of user of any organization", async () => {
        try {
          const user = {
            cardSerial: "0000000000",
            userId: operatorUser[0].id,
            deviceId: devices[1].id,
          };
          const response = await helper.put_request_with_authorization({
            endpoint: `user/card/${user.userId}/${user.cardSerial}`,
            token: tokens.superadmin,
            params: {
              deviceId: user.deviceId,
            },
          });
          expect(response.body).toEqual({
            success: false,
            data: "Operation can not be performed",
          });
          expect(response.statusCode).toEqual(400);
        } catch (error) {
          logger.error(error);
        }
      });
      it("should fail if admin is trying to update the serial of user of any organization", async () => {
        try {
          const user = {
            cardSerial: "0000000000",
            userId: operatorUser[0].id,
            deviceId: devices[1].id,
          };
          const response = await helper.put_request_with_authorization({
            endpoint: `user/card/${user.userId}/${user.cardSerial}`,
            token: tokens.admin,
            params: {
              deviceId: user.deviceId,
            },
          });
          expect(response.body).toEqual({
            success: false,
            data: "Operation can not be performed",
          });
          expect(response.statusCode).toEqual(400);
        } catch (error) {
          logger.error(error);
        }
      });
    });
  });
});
