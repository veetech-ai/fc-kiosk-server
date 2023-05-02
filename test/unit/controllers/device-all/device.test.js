const helper = require("../../../helper");
const deviceController = require("../../../../controllers/device/device");
const {
  deviceAllStatus,
} = require("../../../../controllers/mqtt/messageHandlers");
const { uuid } = require("uuidv4");
const { products } = require("../../../../common/products");

let tokens = null;
let setConfigsKeys = {};

async function createNewDevices(token) {
  const devicesData = {
    kiosk: {
      device_type: products.kiosk.id,
      serial: uuid(),
      pin_code: "1111",
    },
  };
  const data = {
    endpoint: "device/create",
    token: tokens.superadmin,
  };
  const devices = {};
  for await (const [key, value] of Object.entries(devicesData)) {
    data.params = value;
    const device = await helper.post_request_with_authorization(data);
    devices[key] = device.body.data;
    //  devices.dScope = device.body.data
    // if (device.body.data.device_type === 23)
  }
  return devices;
}
let devices;
describe("Test the module of management of device configurations", () => {
  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
    devices = await createNewDevices(tokens.superadmin);
    console.log("created devices are: ", devices);
    setConfigsKeys = await helper.post_request_with_authorization({
      endpoint: "misc/app-configuration",
      token: tokens.superadmin,
      params: {
        config:
          '{"device_config":[{"key":"RUN_ENVIRONMENT.RUN_ENV","type":"text"},{"key":"SOCKETS.SOCKET_TCP_PORT","type":"text"},{"key":"MQTT.CONFIGS.MQTT_HOST_LOCAL","type":"text"},{"key":"temp","type":"text"}],"logo":10,"logo_bg":false,"theme_skin":false,"color_scheme":2,"choose_sizes":3,"footer_text":"2022 © VIAPHOTON by <a href=\'https://www.cowlar.com/\'>Cowlar</a>","fb":"","twitter":"","google":"","account_layout":2,"loader":4,"slack_notifications":true,"product_type":false,"device_trial_period":true,"device_grace_period":true,"tfa":false,"security_question":false,"fb_auth":false,"gmail_auth":false,"twitter_auth":false,"bill_duration":"30","company_about":"We are best with our services","company_email":"team@cowlar.com","company_phone":"+92 (51) 831 7562","company_timing":"9:00 AM to 5:00 PM","company_address":"Office 27 3rd Floor, Silver City Plaza, G-11 Markaz, Islamabad, Pakistan","binary_file_max_size":"2","default_grace_period":"7","default_trial_period":"30","device_history_limit":"200","upload_file_max_size":"50","profile_image_max_size":"5","all_notifications_limit":"50","schedules_allow_per_day":"3","label_print_company_name":"VIAPHOTON","unread_notification_limit":"12","label_print_company_website":"https://app.viaphoton.cowlar.com/","recent_device_history_limit":"10","device_locked_due_bill_message":"Bill not paid. Device is locked. You can\'t do this action.","device_offline_interval_forcefully":"10"}',
      },
    });
  });

  describe('Tests to get the device configurations by if API URI: "/device/config/{id}"', () => {
    /**
     * Handle all the success scenarios of mentioned API
     */
    describe("Success Scenarios", () => {
      it("should get the editable configurations of device", async () => {
        /**
         * We need to make sure that the config keys are there so we can get them
         */
        expect(setConfigsKeys.statusCode).toBe(200);
        expect(setConfigsKeys.body.success).toBeTruthy();

        /**
         * We need to set upodated config values first otherwise null will be returned.
         * These are the configs we send from frontend to update them on device
         */
        const setConfigsValues = await helper.put_request_with_authorization({
          endpoint: `device/config/${devices.kiosk.id}`,
          token: tokens.superadmin,
          params: {
            config:
              '{"RUN_ENVIRONMENT.RUN_ENV": "dev","SOCKETS.SOCKET_TCP_PORT": 3400,"MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90"}',
          },
        });
        expect(setConfigsValues.statusCode).toBe(200);
        expect(setConfigsValues.body.success).toBeTruthy();

        /**
         * We have to update the current configurations of device as normally
         * this will be triggered by receving ack from MDM
         */
        const updateCurrentConfig = await deviceController.updateCurrentConfig(
          devices.kiosk.id,
          {
            "RUN_ENVIRONMENT.RUN_ENV": "dev",
            "SOCKETS.SOCKET_TCP_PORT": 3400,
            "MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90",
          },
        );
        expect(updateCurrentConfig).toBeTruthy();

        const configurations = await helper.get_request_with_authorization({
          endpoint: `device/config/${devices.kiosk.id}`,
          token: tokens.superadmin,
        });
        expect(configurations.statusCode).toBe(200);
        expect(configurations.body.success).toBeTruthy();
        expect(configurations.body.data).toStrictEqual({
          "RUN_ENVIRONMENT.RUN_ENV": "dev",
          "SOCKETS.SOCKET_TCP_PORT": 3400,
          "MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90",
          temp: null,
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
        it("should not allow if no token provided", async () => {
          const response = await helper.get_request_with_authorization({
            endpoint: `device/config/${devices.kiosk.id}`,
            token: "",
          });
          expect(response.statusCode).toBe(401);
        });
        it.skip("should return 403 if user of other organization try to get specific device config", async () => {
          // test case not passing in the pipeline, though it gets passed locally. Need to debug the cause
          const response = await helper.get_request_with_authorization({
            endpoint: `device/config/${devices.kiosk.id}`,
            token: tokens.zongCustomer,
          });

          expect(response.statusCode).toBe(403);
          expect(response.body.success).toBeFalsy();
        });
      });

      describe("Data duplication and data validations", () => {
        it("should return 400 if no device id passed", async () => {
          const response = await helper.get_request_with_authorization({
            endpoint: "device/config",
            token: tokens.superadmin,
          });
          expect(response.statusCode).toBe(400);
          expect(response.body.success).toBeFalsy();
        });
        it("should return 404 if invalid device id passed", async () => {
          const response = await helper.get_request_with_authorization({
            endpoint: "device/config/11458693502",
            token: tokens.superadmin,
          });
          expect(response.statusCode).toBe(404);
          expect(response.body.success).toBeFalsy();
        });
      });
    });
  });

  describe('Tests to update the device configurations by id API URI: "/device/config/{id}"', () => {
    /**
     * Handle all the success scenarios of mentioned API
     */
    describe("Success Scenarios", () => {
      it("should update the updated configurations of device", async () => {
        /**
         * We need to make sure that the config keys are there so we can get them
         */
        expect(setConfigsKeys.statusCode).toBe(200);
        expect(setConfigsKeys.body.success).toBeTruthy();

        const response = await helper.put_request_with_authorization({
          endpoint: `device/config/${devices.kiosk.id}`,
          token: tokens.superadmin,
          params: {
            config:
              '{"RUN_ENVIRONMENT.RUN_ENV": "STAGE","SOCKETS.SOCKET_TCP_PORT": 3450,"MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90"}',
          },
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBeTruthy();

        /**
         * We have to update the current configurations of device as normally
         * this will be triggered by receving ack from MDM
         */
        const updateCurrentConfig = await deviceController.updateCurrentConfig(
          devices.kiosk.id,
          {
            "RUN_ENVIRONMENT.RUN_ENV": "STAGE",
            "SOCKETS.SOCKET_TCP_PORT": 3450,
            "MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90",
          },
        );
        expect(updateCurrentConfig).toBeTruthy();

        const configurations = await helper.get_request_with_authorization({
          endpoint: `device/config/${devices.kiosk.id}`,
          token: tokens.superadmin,
        });
        expect(configurations.statusCode).toBe(200);
        expect(configurations.body.success).toBeTruthy();
        expect(configurations.body.data).toStrictEqual({
          "RUN_ENVIRONMENT.RUN_ENV": "STAGE",
          "SOCKETS.SOCKET_TCP_PORT": 3450,
          "MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90",
          temp: null,
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
        it("should not allow if no token provided", async () => {
          const response = await helper.put_request_with_authorization({
            endpoint: `device/config/${devices.kiosk.id}`,
            token: "",
            params: {
              config:
                '{"RUN_ENVIRONMENT.RUN_ENV": "STAGE","SOCKETS.SOCKET_TCP_PORT": 3450,"MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90"}',
            },
          });
          expect(response.statusCode).toBe(401);
        });
        it("should return 403 if user is not super admin", async () => {
          const response = await helper.put_request_with_authorization({
            endpoint: `device/config/${devices.kiosk.id}`,
            token: tokens.zongCustomer,
            params: {
              config:
                '{"RUN_ENVIRONMENT.RUN_ENV": "STAGE","SOCKETS.SOCKET_TCP_PORT": 3450,"MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90"}',
            },
          });
          expect(response.statusCode).toBe(403);
          expect(response.body.success).toBeFalsy();
        });
      });

      describe("Data duplication and data validations", () => {
        it("should return 400 if invalid json config is passed", async () => {
          const response = await helper.put_request_with_authorization({
            endpoint: `device/config/${devices.kiosk.id}`,
            token: tokens.superadmin,
            params: { config: "hello test" },
          });
          expect(response.statusCode).toBe(400);
          expect(response.body.success).toBeFalsy();
        });
        it("should return 404 if invalid device id passed", async () => {
          const response = await helper.put_request_with_authorization({
            endpoint: "device/config/11458693502",
            token: tokens.superadmin,
            params: {
              config:
                '{"RUN_ENVIRONMENT.RUN_ENV": "STAGE","SOCKETS.SOCKET_TCP_PORT": 3450,"MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90"}',
            },
          });
          expect(response.statusCode).toBe(404);
          expect(response.body.success).toBeFalsy();
        });
      });
    });
  });

  describe("Tests to update the device configurations provided by MDM", () => {
    /**
     * Handle all the success scenarios of mentioned API
     */
    describe("Success Scenarios", () => {
      it("should update the updated configurations of device received from MDM", async () => {
        await helper.put_request_with_authorization({
          endpoint: `device/config/${devices.kiosk.id}`,
          token: tokens.superadmin,
          params: {
            config:
              '{"RUN_ENVIRONMENT.RUN_ENV": "STAGE","SOCKETS.SOCKET_TCP_PORT": 3450,"MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90"}',
          },
        });

        const response = await deviceController.updateCurrentConfig(
          devices.kiosk.id,
          {
            "RUN_ENVIRONMENT.RUN_ENV": "STAGE",
            "SOCKETS.SOCKET_TCP_PORT": 3450,
            "MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90",
          },
        );
        expect(response).toBeTruthy();
      });
    });

    /**
     * Handle All error cases for above mentioned API
     */
    describe("Failure Scenarios", () => {
      it("should return false if MDM sends wrong config", async () => {
        await helper.put_request_with_authorization({
          endpoint: `device/config/${devices.kiosk.id}`,
          token: tokens.superadmin,
          params: {
            config:
              '{"RUN_ENVIRONMENT.RUN_ENV": "STAGE","SOCKETS.SOCKET_TCP_PORT": 3450,"MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90"}',
          },
        });

        const response = await deviceController.updateCurrentConfig(
          devices.kiosk.id,
          {
            "RUN_ENVIRONMENT.RUN_ENV": "dev",
            "SOCKETS.SOCKET_TCP_PORT": 3400,
            "MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90",
          },
        );
        expect(response).toBeFalsy();
      });

      it("should return false if wrong device id passed", async () => {
        const response = await deviceController.updateCurrentConfig(
          14528966357414,
          {
            "RUN_ENVIRONMENT.RUN_ENV": "dev",
            "SOCKETS.SOCKET_TCP_PORT": 3400,
            "MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90",
          },
        );
        expect(response).toBeFalsy();
      });
      it("should return false if same setting has been passed to device id", async () => {
        const response = await deviceController.updateCurrentConfig(
          devices.kiosk.id,
          {
            "MQTT.CONFIGS.MQTT_HOST_LOCAL": "192.168.103.90",
            "RUN_ENVIRONMENT.RUN_ENV": "dev",
            "SOCKETS.SOCKET_TCP_PORT": 3400,
          },
        );
        expect(response).toBeFalsy();
      });
    });
  });

  describe("set online status of a device", () => {
    it("devices should be online", async () => {
      const action = { status: "online" };
      const payload = {
        destinationName: `d/${devices.kiosk.id}/status`,
        payloadString: JSON.stringify(action),
      };
      await deviceAllStatus(payload);

      const response = await helper.get_request_with_authorization({
        endpoint: `device/${devices.kiosk.id}`,
        token: tokens.admin,
      });
      expect(response.status).toBe(200);
      expect(response.body.data.Device.live_status).toEqual(true);
    });

    it("devices should be offline", async () => {
      const action = { status: "offline" };
      const payload = {
        destinationName: `d/${devices.kiosk.id}/status`,
        payloadString: JSON.stringify(action),
      };
      await deviceAllStatus(payload);

      const response = await helper.get_request_with_authorization({
        endpoint: `device/${devices.kiosk.id}`,
        token: tokens.admin,
      });
      expect(response.status).toBe(200);
      expect(response.body.data.Device.live_status).toEqual(false);
    });
  });
});
